const { fetchAndExtractRepo, extractUploadedZip, cleanup } = require("../services/repoService");
const { runScan } = require("../services/scannerService");
const fs = require("fs/promises");

/**
 * POST /api/scan
 * Accepts repoUrl (body) or file (multipart upload).
 */
async function handleScan(req, res) {
  const { repoUrl } = req.body;
  const file = req.file;

  // Validate: exactly one input source
  if (repoUrl && file) {
    return res.status(400).json({ error: "Provide either a repository URL or a file upload, not both." });
  }
  if (!repoUrl && !file) {
    return res.status(400).json({ error: "Provide a repository URL (repoUrl) or upload a ZIP file." });
  }

  let projectDir = null;

  try {
    if (repoUrl) {
      // Validate URL format
      if (!/^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+/i.test(repoUrl)) {
        return res.status(400).json({ error: "Invalid GitHub repository URL. Expected: https://github.com/owner/repo" });
      }
      projectDir = await fetchAndExtractRepo(repoUrl);
    } else {
      // Validate file type
      if (!file.originalname.endsWith(".zip")) {
        await fs.unlink(file.path).catch(() => {});
        return res.status(400).json({ error: "Only .zip files are accepted." });
      }
      projectDir = await extractUploadedZip(file.path);
      // Clean up the uploaded file
      await fs.unlink(file.path).catch(() => {});
    }

    // Run the scan
    const results = await runScan(projectDir);
    res.json(results);
  } catch (err) {
    console.error("Scan error:", err.message);
    const status = err.message.includes("Invalid") ? 400 : 500;
    res.status(status).json({ error: err.message || "An unexpected error occurred during scanning." });
  } finally {
    // Clean up extracted files
    if (projectDir) {
      // Go up one level if projectDir is a subdirectory of temp
      const parentDir = projectDir.includes("secaudit-") ? projectDir.split("secaudit-")[0] + "secaudit-" + projectDir.split("secaudit-")[1].split(/[/\\]/)[0] : projectDir;
      await cleanup(parentDir);
    }
  }
}

module.exports = { handleScan };
