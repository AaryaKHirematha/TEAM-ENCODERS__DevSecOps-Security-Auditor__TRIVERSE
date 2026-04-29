const express = require("express");
const multer = require("multer");
const path = require("path");
const { handleScan } = require("../controllers/scanController");

const router = express.Router();

// Configure multer for ZIP uploads
const upload = multer({
  dest: path.join(__dirname, "..", "uploads"),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/zip" ||
        file.mimetype === "application/x-zip-compressed" ||
        file.mimetype === "application/octet-stream" ||
        file.originalname.endsWith(".zip")) {
      cb(null, true);
    } else {
      cb(new Error("Only .zip files are accepted."));
    }
  },
});

// POST /api/scan
router.post("/scan", upload.single("file"), handleScan);

// Multer error handler
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "File too large. Maximum size is 10MB." });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
