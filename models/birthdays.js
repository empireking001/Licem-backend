const router = require("express").Router();
const Connect = require("./models/Connect");

router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const todayDay = now.getDate();
    const todayMonth = now.getMonth() + 1;

    // Get day of week range (Sunday=0)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      weekDays.push({ day: d.getDate(), month: d.getMonth() + 1 });
    }

    const all = await Connect.find(
      { birthday: { $exists: true }, birthMonth: { $exists: true } },
      "firstName lastName birthday birthMonth",
    );

    const todays = all.filter(
      (p) =>
        Number(p.birthday) === todayDay && Number(p.birthMonth) === todayMonth,
    );

    const thisWeek = all.filter((p) =>
      weekDays.some(
        (w) => w.day === Number(p.birthday) && w.month === Number(p.birthMonth),
      ),
    );

    const thisMonth = all
      .filter((p) => Number(p.birthMonth) === todayMonth)
      .sort((a, b) => Number(a.birthday) - Number(b.birthday));

    const MONTHS = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const format = (p) => ({
      name: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
      day: p.birthday,
      month: MONTHS[(p.birthMonth || 1) - 1],
    });

    res.json({
      today: todays.map(format),
      thisWeek: thisWeek.map(format),
      thisMonth: thisMonth.map(format),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
