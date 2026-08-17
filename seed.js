require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User       = require('./models/User');
const Sermon     = require('./models/Sermon');
const Event      = require('./models/Event');
const Post       = require('./models/Post');
const Donation   = require('./models/Donation');
const Gallery    = require('./models/Gallery');
const SiteSettings = require('./models/SiteSettings');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('🌱 Connected. Seeding database...');

  // Clear
  await Promise.all([
    User.deleteMany(), Sermon.deleteMany(), Event.deleteMany(),
    Post.deleteMany(), Donation.deleteMany(), Gallery.deleteMany(),
    SiteSettings.deleteMany()
  ]);

  // Users: credentials must be supplied explicitly for each seed run.
  const requiredSeedCredentials = [
    ['ADMIN_BOOTSTRAP_EMAIL', 'ADMIN_BOOTSTRAP_PASSWORD'],
    ['EDITOR_ONE_EMAIL', 'EDITOR_ONE_PASSWORD'],
    ['EDITOR_TWO_EMAIL', 'EDITOR_TWO_PASSWORD'],
    ['MODERATOR_EMAIL', 'MODERATOR_PASSWORD'],
  ];
  const missingSeedCredentials = requiredSeedCredentials.flat().filter((key) => !process.env[key]);
  if (missingSeedCredentials.length) {
    throw new Error(`Missing seed credentials: ${missingSeedCredentials.join(', ')}`);
  }
  const users = await User.insertMany([
    { name: process.env.ADMIN_BOOTSTRAP_NAME || 'LICEM Administrator', email: process.env.ADMIN_BOOTSTRAP_EMAIL, password: await bcrypt.hash(process.env.ADMIN_BOOTSTRAP_PASSWORD, 10), role: 'Super Admin', status: 'Active' },
    { name: 'LICEM Editor One', email: process.env.EDITOR_ONE_EMAIL, password: await bcrypt.hash(process.env.EDITOR_ONE_PASSWORD, 10), role: 'Editor', status: 'Active' },
    { name: 'LICEM Editor Two', email: process.env.EDITOR_TWO_EMAIL, password: await bcrypt.hash(process.env.EDITOR_TWO_PASSWORD, 10), role: 'Editor', status: 'Active' },
    { name: 'LICEM Moderator', email: process.env.MODERATOR_EMAIL, password: await bcrypt.hash(process.env.MODERATOR_PASSWORD, 10), role: 'Moderator', status: 'Active' },
  ]);
  console.log('✅ Users seeded');

  const admin = users[0];

  // Sermons
  await Sermon.insertMany([
    { title: 'Walking in Divine Purpose', speaker: 'Pastor James Adeyemi', date: new Date('2026-04-06'), category: 'Sunday Service', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600&q=80', description: 'Discover how God\'s purpose shapes every step of your journey.', pinned: true, featured: true, views: 1240, likes: 87, createdBy: admin._id },
    { title: 'The Power of Unshakeable Faith', speaker: 'Pastor Grace Okonkwo', date: new Date('2026-03-30'), category: 'Sunday Service', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&q=80', description: 'Faith is not the absence of doubt but the decision to trust.', views: 980, likes: 64, createdBy: admin._id },
    { title: 'Healing & Restoration Night', speaker: 'Pastor James Adeyemi', date: new Date('2026-03-22'), category: 'Special Program', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://images.unsplash.com/photo-1601921004897-b7d582836990?w=600&q=80', description: 'A night of supernatural healing and restoration.', views: 2100, likes: 145, featured: true, createdBy: admin._id },
    { title: 'Overflow: Abundant Living', speaker: 'Min. David Fashola', date: new Date('2026-03-16'), category: 'Midweek', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80', description: "God's plan for you is abundance in every area of life.", views: 560, likes: 32, createdBy: admin._id },
  ]);
  console.log('✅ Sermons seeded');

  // Events
  await Event.insertMany([
    { title: 'Easter Sunrise Service', date: new Date('2026-04-20'), time: '6:00 AM', location: 'Church Auditorium & Overflow Hall', description: 'Join us for a powerful Easter celebration.', image: 'https://images.unsplash.com/photo-1544985361-b420d7a77043?w=600&q=80', category: 'Special Service', createdBy: admin._id },
    { title: 'Youth Conference 2026', date: new Date('2026-05-02'), time: '9:00 AM', location: 'Youth Centre, Block B', description: 'A three-day conference for teenagers and young adults.', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80', category: 'Youth', createdBy: admin._id },
    { title: "Women's Prayer Breakfast", date: new Date('2026-04-26'), time: '8:00 AM', location: 'Fellowship Hall', description: 'A time of prayer, fellowship and encouragement.', image: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&q=80', category: 'Prayer', createdBy: admin._id },
    { title: 'Community Outreach Day', date: new Date('2026-05-10'), time: '10:00 AM', location: 'City Park, Downtown', description: 'Serving our community together.', image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80', category: 'Outreach', createdBy: admin._id },
  ]);
  console.log('✅ Events seeded');

  // Posts
  await Post.insertMany([
    { slug: '5-ways-to-deepen-your-prayer-life', title: '5 Ways to Deepen Your Prayer Life', author: 'Pastor Grace Okonkwo', excerpt: 'Prayer is the lifeline of every believer. Here are five practical ways to make your prayer life more vibrant.', content: 'Full article content here...', image: 'https://images.unsplash.com/photo-1448932223592-d1fc686e76ea?w=600&q=80', category: 'Devotional', tags: ['prayer', 'faith', 'growth'], status: 'Published', views: 843, createdBy: admin._id },
    { slug: 'understanding-spiritual-gifts', title: 'Understanding Spiritual Gifts', author: 'Min. David Fashola', excerpt: 'Every believer has been given spiritual gifts by the Holy Spirit. Learn what yours might be.', content: 'Full article content here...', image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=80', category: 'Teaching', tags: ['gifts', 'Holy Spirit'], status: 'Published', views: 621, createdBy: admin._id },
    { title: 'Marriage: A Divine Institution', author: 'Pastor James Adeyemi', excerpt: 'God designed marriage to reflect His relationship with the church.', content: 'Full article content here...', image: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=600&q=80', category: 'Family', tags: ['marriage', 'family'], status: 'Published', views: 1204, createdBy: admin._id },
  ]);
  console.log('✅ Posts seeded');

  // Donations
  await Donation.insertMany([
    { name: 'Anonymous', amount: 500, type: 'Tithe', method: 'Card', status: 'Confirmed' },
    { name: 'Mrs. Funke Adeola', email: 'funke@email.com', amount: 2000, type: 'Building Fund', method: 'Transfer', status: 'Confirmed' },
    { name: 'Mr. Emeka Nwosu', email: 'emeka@email.com', amount: 1000, type: 'Offering', method: 'Card', status: 'Confirmed' },
    { name: 'Anonymous', amount: 250, type: 'Mission Support', method: 'Card', status: 'Confirmed' },
    { name: 'Dr. Aisha Bello', email: 'aisha@email.com', amount: 5000, type: 'Tithe', method: 'Transfer', status: 'Confirmed' },
  ]);
  console.log('✅ Donations seeded');

  // Gallery Albums
  await Gallery.insertMany([
    { title: 'Easter Sunday 2026', description: 'Powerful Easter service with the entire congregation.', group: 'Sunday Service', eventDate: new Date('2026-04-05'), coverImage: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600&q=80', images: [{ url: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600&q=80', caption: 'Worship time', filename: 'easter-1.jpg', size: 120000 }, { url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&q=80', caption: 'Pastor preaching', filename: 'easter-2.jpg', size: 98000 }], published: true, createdBy: admin._id },
    { title: 'Youth Camp 2026', description: 'Annual youth camp at the retreat centre.', group: 'Youth Ministry', eventDate: new Date('2026-03-15'), coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80', images: [{ url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80', caption: 'Youth camp opening', filename: 'youth-1.jpg', size: 115000 }], published: true, createdBy: admin._id },
    { title: "Women's Arise Conference", description: "Annual conference for the women's fellowship.", group: "Women's Fellowship", eventDate: new Date('2026-03-08'), coverImage: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&q=80', images: [{ url: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&q=80', caption: 'Conference opening', filename: 'women-1.jpg', size: 100000 }], published: true, createdBy: admin._id },
    { title: 'Community Outreach — March', description: 'Monthly community outreach in the neighbourhood.', group: 'Outreach', eventDate: new Date('2026-03-29'), coverImage: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80', images: [{ url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80', caption: 'Food distribution', filename: 'outreach-1.jpg', size: 88000 }], published: true, createdBy: admin._id },
    { title: 'Choir Rehearsal — April', description: 'Behind the scenes with our worship choir.', group: 'Choir & Worship', eventDate: new Date('2026-04-01'), coverImage: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600&q=80', images: [], published: true, createdBy: admin._id },
  ]);
  console.log('✅ Gallery albums seeded');

  // Site Settings
  await SiteSettings.create({
    siteName: 'Living Christ Evangelical Ministries',
    tagline: 'Soul Winning',
    email: 'hello@tlcem.org',
    phone: '+234 801 234 5678',
    address: '14 Grace Avenue, Victoria Island, Lagos, Nigeria',
    facebook: 'https://facebook.com/gracelifechurch',
    youtube: 'https://youtube.com/@gracelifechurch',
    instagram: 'https://instagram.com/gracelifechurch',
    twitter: 'https://twitter.com/gracelifechurch',
    faviconEmoji: '✝️',
    faviconType: 'emoji',
    primaryColor: '#1B4332',
    accentColor: '#C9953A',
    metaTitle: 'LICEM Church | Where Faith Meets Community',
    metaDesc: 'Join LICEM Church — a vibrant community of believers in Lagos, Nigeria.',
    allowComments: true,
    requireApproval: true,
  });
  console.log('✅ Site settings seeded');

  console.log('\n🎉 Database seeded successfully!');
  console.log('─────────────────────────────────────');
  console.log('Admin credentials supplied through environment variables.');
  console.log('─────────────────────────────────────');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
