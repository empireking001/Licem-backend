const router = require("express").Router();
const Connect = require("../models/Connect");

router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const todayDay = now.getDate();
    const todayMonth = now.getMonth() + 1;

    const weekDays = [];
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      weekDays.push({ day: d.getDate(), month: d.getMonth() + 1 });
    }

    const all = await Connect.find(
      {
        birthday: { $exists: true, $ne: null },
        birthMonth: { $exists: true, $ne: null },
      },
      "firstName lastName birthday birthMonth",
    );

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
      name:
        `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Church Member",
      day: p.birthday,
      month: MONTHS[(Number(p.birthMonth) || 1) - 1],
    });

    const todays = all
      .filter(
        (p) =>
          Number(p.birthday) === todayDay &&
          Number(p.birthMonth) === todayMonth,
      )
      .map(format);

    const thisWeek = all
      .filter((p) =>
        weekDays.some(
          (w) =>
            w.day === Number(p.birthday) && w.month === Number(p.birthMonth),
        ),
      )
      .map(format);

    const thisMonth = all
      .filter((p) => Number(p.birthMonth) === todayMonth)
      .sort((a, b) => Number(a.birthday) - Number(b.birthday))
      .map(format);

    res.json({ today: todays, thisWeek, thisMonth });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
