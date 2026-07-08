const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Only use Cloudinary if credentials are set
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let cloudinary = null;
if (useCloudinary) {
  cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|mp4|mp3|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error("Only images, videos, audio and PDFs are allowed"));
};

// Storage: memory when using Cloudinary (we stream the buffer up),
// disk when running locally.
const storage = useCloudinary
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const folder = path.join(
          __dirname,
          "..",
          "uploads",
          req.uploadFolder || "general",
        );
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
        cb(null, folder);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
      },
    });

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Upload a single in-memory file buffer to Cloudinary
const uploadBufferToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `licem/${folder}`,
        resource_type: "auto",
      },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
    stream.end(file.buffer);
  });

// Middleware that (if Cloudinary is enabled) pushes buffered files to
// Cloudinary and normalizes each file object so routes can rely on:
//   file.filename -> storage id (Cloudinary public_id OR disk filename)
//   file.path     -> public URL (Cloudinary secure_url OR /uploads/... path)
//   file.size     -> byte size
const processFiles = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) return next();

    const folder = req.uploadFolder || "general";

    if (useCloudinary) {
      for (const f of files) {
        const result = await uploadBufferToCloudinary(f, folder);
        f.filename = result.public_id;
        f.path = result.secure_url;
        f.size = result.bytes || f.size;
      }
    } else {
      for (const f of files) {
        f.path = `/uploads/${folder}/${f.filename}`;
      }
    }
    next();
  } catch (err) {
    res.status(500).json({ message: `Upload failed: ${err.message}` });
  }
};

// Public API mirrors multer's, but returns an array of middleware
// (Express flattens arrays), so existing routes keep working:
//   upload.array('images', 50)  /  upload.single('image')
const upload = {
  array: (field, maxCount) => [
    multerUpload.array(field, maxCount),
    processFiles,
  ],
  single: (field) => [multerUpload.single(field), processFiles],
};

// Get the public URL for an uploaded file object
const getFileUrl = (f) =>
  f.path && String(f.path).startsWith("http") ? f.path : f.path || "";

// Delete a stored file (Cloudinary asset or local disk file)
const deleteStoredFile = async (url, publicId) => {
  try {
    if (url && String(url).startsWith("http")) {
      if (useCloudinary && publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      }
      return;
    }
    if (url) {
      const filePath = path.join(__dirname, "..", url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  } catch (err) {
    // Non-fatal: log and continue so DB cleanup still happens
    console.error("File delete failed:", err.message);
  }
};

module.exports = upload;
module.exports.getFileUrl = getFileUrl;
module.exports.deleteStoredFile = deleteStoredFile;
module.exports.useCloudinary = useCloudinary;
