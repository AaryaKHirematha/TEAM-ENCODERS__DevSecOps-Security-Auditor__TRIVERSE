const express = require("express");
const multer = require("multer");
const path = require("path");
const { handleScan } = require("../controllers/scanController");

const router = express.Router();

// Configure multer — accept ALL file types up to 500MB
const upload = multer({
  dest: path.join(__dirname, "..", "uploads"),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

// POST /api/scan
router.post("/scan", upload.single("file"), handleScan);

// Multer error handler
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "File too large. Maximum size is 500MB." });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
