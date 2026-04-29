const path = require("path");
const { securityRules, severityWeights } = require("../utils/rules");
const { getScannableFiles, readFileSafe } = require("../utils/fileUtils");

async function scanFile(filePath, rootDir) {
  const fileData = await readFileSafe(filePath);
  if (!fileData) return [];

  const { content, lines } = fileData;
  const relativePath = path.relative(rootDir, filePath).replace(/\\/g, "/");
  const issues = [];

  for (const rule of securityRules) {
    rule.regex.lastIndex = 0;
    let match;
    while ((match = rule.regex.exec(content)) !== null) {
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split("\n").length;
      const lineContent = lines[lineNumber - 1]?.trim() || "";

      issues.push({
        issue: rule.name,
        severity: rule.severity,
        file: relativePath,
        line: lineNumber,
        snippet: lineContent.length > 120 ? lineContent.substring(0, 120) + "..." : lineContent,
        description: rule.description,
        fix: rule.fix,
      });

      if (match.index === rule.regex.lastIndex) {
        rule.regex.lastIndex++;
      }
    }
  }
  return issues;
}

function calculateScore(issues) {
  let score = 100;
  for (const issue of issues) {
    score -= severityWeights[issue.severity] || 0;
  }
  return Math.max(0, Math.min(100, score));
}

function getSummary(issues) {
  const summary = { high: 0, medium: 0, low: 0 };
  for (const issue of issues) {
    const key = issue.severity.toLowerCase();
    if (key in summary) summary[key]++;
  }
  return summary;
}

async function runScan(projectDir) {
  const startTime = performance.now();

  console.log(`Discovering files in: ${projectDir}`);
  const files = await getScannableFiles(projectDir);
  console.log(`Found ${files.length} scannable files`);

  const BATCH_SIZE = 50;
  const allIssues = [];

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((file) => scanFile(file, projectDir))
    );
    for (const issues of batchResults) {
      allIssues.push(...issues);
    }
  }

  const severityOrder = { High: 0, Medium: 1, Low: 2 };
  allIssues.sort((a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3));

  const endTime = performance.now();
  const scanDuration = ((endTime - startTime) / 1000).toFixed(2);
  const score = calculateScore(allIssues);
  const summary = getSummary(allIssues);

  console.log(`Scan complete: ${allIssues.length} issues in ${scanDuration}s`);
  console.log(`Score: ${score}/100 | High: ${summary.high} | Medium: ${summary.medium} | Low: ${summary.low}`);

  return {
    score,
    summary,
    totalIssues: allIssues.length,
    filesScanned: files.length,
    scanTime: `${scanDuration}s`,
    message: `Scan completed in ${scanDuration} seconds across ${files.length} files`,
    issues: allIssues,
  };
}

module.exports = { runScan };
