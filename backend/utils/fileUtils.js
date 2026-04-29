const fs = require("fs/promises");
const path = require("path");

/** File extensions to scan */
const SCANNABLE_EXTENSIONS = new Set([
  ".js",
  ".ts",
  ".jsx",
  ".tsx",
  ".json",
  ".env",
  ".py",
  ".yaml",
  ".yml",
  ".toml",
  ".cfg",
  ".conf",
  ".ini",
  ".sh",
  ".bash",
  ".dockerfile",
]);

/** Directories to always skip */
const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "__pycache__",
  ".venv",
  "venv",
  ".cache",
  "coverage",
  ".nyc_output",
  "vendor",
]);

/** Max file size to read (512KB) — skip anything larger */
const MAX_FILE_SIZE = 512 * 1024;

/**
 * Recursively traverse a directory and collect scannable file paths.
 * Skips ignored directories and non-scannable extensions.
 * @param {string} dirPath - Root directory to traverse
 * @returns {Promise<string[]>} Array of absolute file paths
 */
async function getScannableFiles(dirPath) {
  const results = [];

  async function walk(currentDir) {
    let entries;
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return; // Skip directories we can't read
    }

    const tasks = [];

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) {
          tasks.push(walk(fullPath));
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        // Also include files with no extension that might be dotfiles (.env, Dockerfile)
        const basename = entry.name.toLowerCase();
        if (
          SCANNABLE_EXTENSIONS.has(ext) ||
          basename === ".env" ||
          basename === ".env.local" ||
          basename === ".env.production" ||
          basename === "dockerfile"
        ) {
          results.push(fullPath);
        }
      }
    }

    await Promise.all(tasks);
  }

  await walk(dirPath);
  return results;
}

/**
 * Read a file's content safely. Returns null for binary or oversized files.
 * @param {string} filePath - Absolute path to file
 * @returns {Promise<{content: string, lines: string[]}|null>}
 */
async function readFileSafe(filePath) {
  try {
    const stats = await fs.stat(filePath);

    // Skip files that are too large
    if (stats.size > MAX_FILE_SIZE) {
      return null;
    }

    // Skip empty files
    if (stats.size === 0) {
      return null;
    }

    const buffer = await fs.readFile(filePath);

    // Detect binary files — check for null bytes in the first 8KB
    const sample = buffer.subarray(0, 8192);
    if (sample.includes(0x00)) {
      return null;
    }

    const content = buffer.toString("utf-8");
    const lines = content.split("\n");

    return { content, lines };
  } catch {
    return null;
  }
}

module.exports = {
  getScannableFiles,
  readFileSafe,
  SCANNABLE_EXTENSIONS,
  IGNORED_DIRS,
  MAX_FILE_SIZE,
};
