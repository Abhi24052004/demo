const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

/*
 🔍 Optional: keyword filter (you can remove if using AI later)
*/
function isPlacementMail(text) {
  const keywords = [
    "placement",
    "job",
    "internship",
    "hiring",
    "opportunity",
    "career",
    "offer",
    "interview"
  ];

  return keywords.some((word) =>
    text.toLowerCase().includes(word)
  );
}

/*
 📩 WEBHOOK (Automation will call this)
*/
app.post("/email-webhook", async (req, res) => {
  try {
    console.log("📩 FULL BODY RECEIVED:", req.body);

    // 🧠 Flexible extraction (handles different automation formats)
    const subject =
      req.body.subject ||
      req.body.data?.subject ||
      req.body.title;

    const body =
      req.body.body ||
      req.body.data?.body ||
      req.body.message ||
      req.body.text;

    const sender =
      req.body.sender ||
      req.body.data?.sender ||
      req.body.from;

    const isValid=req.body.isValid;

    console.log("📌 Extracted:");
    console.log("Subject:", subject);
    console.log("Body:", body);
    console.log("Sender:", sender);

    // ❌ If no data → reject
    if (!subject && !body) {
      console.log("❌ Missing subject & body");
      return res.status(400).json({
        message: "Invalid data received",
      });
    }

    const content = (subject || "") + " " + (body || "");

    // 🔍 Check placement (you can remove later when using AI)
    const isPlacement = isPlacementMail(content);

    console.log("🔍 Is Placement:", isPlacement);

    if (!isValid) {
      console.log("❌ Not a placement email");
      return res.json({ message: "Not placement" });
    }

    // ✅ Save to database
    const saved = await prisma.placement.create({
      data: {
        subject,
        body,
        sender,
      },
    });

    console.log("✅ Saved to DB:", saved);

    return res.json({
      message: "Saved successfully",
      data: saved,
    });

  } catch (err) {
    console.error("🔥 ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/*
 📥 GET all placement emails
*/
app.get("/placements", async (req, res) => {
  try {
    const data = await prisma.placement.findMany({
      orderBy: { date: "desc" },
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching data" });
  }
});

/*
 🧪 Health check
*/
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

/*
 🚀 Start server
*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
