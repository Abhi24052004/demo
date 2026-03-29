const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

/*
 Optional: keyword filter
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
 CREATE - Webhook
*/
app.post("/email-webhook", async (req, res) => {
  try {
    console.log("FULL BODY RECEIVED:", req.body);

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

    const isValid = req.body.isValid;

    console.log("Extracted:");
    console.log("Subject:", subject);
    console.log("Body:", body);
    console.log("Sender:", sender);

    if (!subject && !body) {
      return res.status(400).json({
        message: "Invalid data received",
      });
    }

    const content = (subject || "") + " " + (body || "");

    const isPlacement = isPlacementMail(content);

    console.log("Is Placement:", isPlacement);

    if (!isValid) {
      return res.json({ message: "Not placement" });
    }

    const saved = await prisma.placement.create({
      data: {
        subject,
        body,
        sender,
      },
    });

    return res.json({
      message: "Saved successfully",
      data: saved,
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/*
 READ - Get all placements
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
 READ - Get single placement by ID
*/
app.get("/placements/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const data = await prisma.placement.findUnique({
      where: { id },
    });

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching data" });
  }
});

/*
 UPDATE placement
*/
app.put("/placements/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const { subject, body, sender } = req.body;

    const updated = await prisma.placement.update({
      where: { id },
      data: {
        subject,
        body,
        sender,
      },
    });

    res.json({
      message: "Updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating data" });
  }
});

/*
 DELETE placement
*/
app.delete("/placements/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.placement.delete({
      where: { id },
    });

    res.json({
      message: "Deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting data" });
  }
});

/*
 Health check
*/
app.get("/", (req, res) => {
  res.send("API is running");
});

/*
 Start server
*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
