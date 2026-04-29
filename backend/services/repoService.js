const fs = require("fs/promises");
const path = require("path");
const https = require("https");
const http = require("http");
const AdmZip = require("adm-zip");
const os = require("os");
const crypto = require("crypto");

/**
 * Generate a unique temp directory path for extraction.
 * @returns {string}
 */
function getTempDir() {
  const id = crypto.randomBytes(8).toString("hex");
  return path.join(os.tmpdir(), `secaudit-${id}`);
}

/**
 * Download a file from a URL, following redirects (up to 5).
 * @param {string} url - The URL to download
 * @returns {Promise<Buffer>}
 */
function downloadFile(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      return reject(new Error("Too many redirects"));
    }

    const client = url.startsWith("https") ? https : http;

    client
      .get(url, { headers: { "User-Agent": "SecAudit-Scanner/1.0" } }, (res) => {
        // Handle redirects
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          return resolve(downloadFile(res.headers.location, redirectCount + 1));
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`Download failed with status ${res.statusCode}`));
        }

        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

/**
 * Parse a GitHub URL and return the ZIP download URL.
 * Supports formats:
 *   - https://github.com/user/repo
 *   - https://github.com/user/repo.git
 *   - https://github.com/user/repo/tree/branch
 * @param {string} repoUrl
 * @returns {string} ZIP archive download URL
 */
function getGitHubZipUrl(repoUrl) {
  // Clean up the URL
  let cleaned = repoUrl.trim().replace(/\.git$/, "").replace(/\/$/, "");

  // Extract owner/repo and optional branch
  const treeMatch = cleaned.match(/github\.com\/([^/]+)\/([^/]+)\/tree\/(.+)/);
  if (treeMatch) {
    const [, owner, repo, branch] = treeMatch;
    return `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;
  }

  const repoMatch = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (repoMatch) {
    const [, owner, repo] = repoMatch;
    return `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
  }

  throw new Error(
    "Invalid GitHub URL. Expected format: https://github.com/owner/repo"
  );
}

/**
 * Download and extract a GitHub repository.
 * @param {string} repoUrl - GitHub repository URL
 * @returns {Promise<string>} Path to extracted directory
 */
async function fetchAndExtractRepo(repoUrl) {
  const zipUrl = getGitHubZipUrl(repoUrl);
  const tempDir = getTempDir();

  console.log(`📥 Downloading repository from: ${zipUrl}`);

  let buffer;
  try {
    buffer = await downloadFile(zipUrl);
  } catch (err) {
    // Try with 'master' branch if 'main' fails
    if (zipUrl.includes("/main.zip")) {
      const masterUrl = zipUrl.replace("/main.zip", "/master.zip");
      console.log(`⚠️  main branch failed, trying master: ${masterUrl}`);
      buffer = await downloadFile(masterUrl);
    } else {
      throw err;
    }
  }

  console.log(`📦 Downloaded ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

  return extractZipBuffer(buffer, tempDir);
}

/**
 * Extract a ZIP buffer to a temporary directory.
 * Returns the path to the root content directory.
 * @param {Buffer} buffer - ZIP file content
 * @param {string} tempDir - Destination directory
 * @returns {Promise<string>} Extracted root directory path
 */
async function extractZipBuffer(buffer, tempDir) {
  await fs.mkdir(tempDir, { recursive: true });

  const zip = new AdmZip(buffer);
  zip.extractAllTo(tempDir, true);

  // GitHub ZIPs contain a single root folder (e.g., repo-main/)
  // Find it and return that path as the scan root
  const entries = await fs.readdir(tempDir, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory());

  if (dirs.length === 1) {
    return path.join(tempDir, dirs[0].name);
  }

  return tempDir;
}

/**
 * Extract an uploaded ZIP file.
 * @param {string} filePath - Path to the uploaded ZIP file
 * @returns {Promise<string>} Path to extracted directory
 */
async function extractUploadedZip(filePath) {
  const tempDir = getTempDir();
  const buffer = await fs.readFile(filePath);

  console.log(`📦 Extracting uploaded file (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);

  return extractZipBuffer(buffer, tempDir);
}

/**
 * Clean up a temporary directory.
 * @param {string} dirPath - Directory to remove
 */
async function cleanup(dirPath) {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
    console.log(`🧹 Cleaned up temp directory`);
  } catch {
    // Best-effort cleanup
  }
}

module.exports = {
  fetchAndExtractRepo,
  extractUploadedZip,
  cleanup,
};
