/**
 * Security detection rules for the scanner engine.
 * Each rule defines a regex pattern, severity level, description, and fix suggestion.
 */

const securityRules = [
  // ── HIGH SEVERITY ──────────────────────────────────────────────
  {
    name: "Hardcoded API Key",
    regex: /(?:api[_-]?key|apikey)\s*[:=]\s*['"`]([A-Za-z0-9_\-]{16,})['"`]/gi,
    severity: "High",
    description: "API key is hardcoded directly in source code. This exposes your credentials if the code is shared or committed to version control.",
    fix: "Store API keys in environment variables (e.g., process.env.API_KEY) and load them via a .env file using dotenv.",
  },
  {
    name: "Hardcoded Secret/Token",
    regex: /(?:secret|token|auth[_-]?token|access[_-]?token|bearer)\s*[:=]\s*['"`]([A-Za-z0-9_\-/.]{16,})['"`]/gi,
    severity: "High",
    description: "A secret or authentication token is hardcoded in the source. Attackers can extract it from the codebase.",
    fix: "Move secrets to environment variables or a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault).",
  },
  {
    name: "Hardcoded Password",
    regex: /(?:password|passwd|pwd)\s*[:=]\s*['"`]([^'"`\s]{4,})['"`]/gi,
    severity: "High",
    description: "Password is embedded directly in code. This is a critical security risk if the repository is public or shared.",
    fix: "Use environment variables for credentials. Never commit passwords to source control.",
  },
  {
    name: "Private Key Detected",
    regex: /-----BEGIN\s+(RSA|EC|DSA|OPENSSH|PGP)?\s*PRIVATE KEY-----/gi,
    severity: "High",
    description: "A private key is committed to the codebase. This can be used to impersonate your server or decrypt sensitive data.",
    fix: "Remove the private key from source control immediately. Rotate the key. Store keys outside the repository using a secrets manager.",
  },
  {
    name: "AWS Access Key ID",
    regex: /AKIA[0-9A-Z]{16}/g,
    severity: "High",
    description: "An AWS Access Key ID was detected. If paired with a secret key, it grants access to your AWS resources.",
    fix: "Revoke and rotate the key in AWS IAM. Use IAM roles or environment variables instead of hardcoding.",
  },
  {
    name: "Hardcoded Database Connection String",
    regex: /(?:mongodb|postgres|mysql|redis):\/\/[^\s'"`]{10,}/gi,
    severity: "High",
    description: "Database connection string with potential credentials is hardcoded in the source code.",
    fix: "Move database URLs to environment variables. Use connection pooling with config loaded from .env files.",
  },

  // ── MEDIUM SEVERITY ────────────────────────────────────────────
  {
    name: "HTTP URL (Insecure)",
    regex: /['"`]http:\/\/[^'"`\s]+['"`]/gi,
    severity: "Medium",
    description: "An HTTP (non-HTTPS) URL was found. Data transmitted over HTTP is unencrypted and vulnerable to interception.",
    fix: "Switch to HTTPS URLs. Enforce TLS for all external communications.",
  },
  {
    name: "Disabled SSL/TLS Verification",
    regex: /rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"`]?0['"`]?|verify\s*=\s*False/gi,
    severity: "Medium",
    description: "SSL/TLS certificate verification is disabled, making the application vulnerable to man-in-the-middle attacks.",
    fix: "Enable SSL verification in production. Only disable for local development with proper safeguards.",
  },
  {
    name: "eval() Usage",
    regex: /\beval\s*\(/g,
    severity: "Medium",
    description: "eval() executes arbitrary code and is a common vector for code injection attacks.",
    fix: "Avoid eval(). Use JSON.parse() for data, or Function constructor with strict validation if dynamic execution is absolutely necessary.",
  },
  {
    name: "Weak Cryptographic Algorithm",
    regex: /createHash\s*\(\s*['"`](md5|sha1)['"`]\s*\)/gi,
    severity: "Medium",
    description: "MD5 or SHA-1 are cryptographically weak and should not be used for security-sensitive operations.",
    fix: "Use SHA-256 or stronger (e.g., crypto.createHash('sha256')). For passwords, use bcrypt or argon2.",
  },
  {
    name: "Console.log with Sensitive Data",
    regex: /console\.log\s*\(.*(?:password|secret|token|key|credential).*\)/gi,
    severity: "Medium",
    description: "Sensitive data may be logged to the console, which can appear in log files or monitoring tools.",
    fix: "Remove console.log statements containing sensitive data. Use a structured logger with redaction in production.",
  },
  {
    name: "SQL Injection Risk",
    regex: /(?:query|execute)\s*\(\s*['"`].*\$\{.*\}.*['"`]|(?:query|execute)\s*\(\s*['"`].*\+\s*\w+/gi,
    severity: "Medium",
    description: "SQL query appears to use string interpolation or concatenation, making it vulnerable to SQL injection.",
    fix: "Use parameterized queries or prepared statements. Never concatenate user input into SQL strings.",
  },
  {
    name: "Exposed .env File Reference",
    regex: /dotenv\.config\s*\(\s*\{[^}]*path\s*:\s*['"`]\.env\.production['"`]/gi,
    severity: "Medium",
    description: "Direct reference to production .env file found. Ensure this file is not committed to version control.",
    fix: "Add .env.production to .gitignore. Use CI/CD environment variables for production deployments.",
  },

  // ── LOW SEVERITY ───────────────────────────────────────────────
  {
    name: "Debug Mode Enabled",
    regex: /(?:debug|DEBUG)\s*[:=]\s*(?:true|1|['"`]true['"`])/gi,
    severity: "Low",
    description: "Debug mode appears to be enabled. This may expose stack traces and internal details in production.",
    fix: "Set debug to false in production. Use environment-based configuration to toggle debug mode.",
  },
  {
    name: "TODO/FIXME Security Note",
    regex: /(?:\/\/|#)\s*(?:TODO|FIXME|HACK|XXX)\s*:?\s*.*(?:security|auth|password|credential|vulnerability)/gi,
    severity: "Low",
    description: "A TODO/FIXME comment mentions a security concern that may not have been addressed.",
    fix: "Review and resolve the security-related TODO before deploying to production.",
  },
  {
    name: "Wildcard CORS Configuration",
    regex: /(?:cors|Access-Control-Allow-Origin)\s*[:=(\s]*['"`]\*['"`]/gi,
    severity: "Low",
    description: "CORS is configured to allow all origins (*). This permits any website to make requests to your API.",
    fix: "Restrict CORS to specific trusted domains instead of using wildcard.",
  },
  {
    name: "Hardcoded IP Address",
    regex: /['"`]\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}['"`]/g,
    severity: "Low",
    description: "A hardcoded IP address was found. This reduces flexibility and may expose internal network topology.",
    fix: "Use environment variables or DNS hostnames instead of hardcoded IP addresses.",
  },
  {
    name: "Disabled ESLint Rule",
    regex: /\/\/\s*eslint-disable(?!-next-line)/g,
    severity: "Low",
    description: "ESLint rules are being broadly disabled, which may suppress important security warnings.",
    fix: "Use eslint-disable-next-line for specific lines instead of disabling rules for entire files.",
  },
];

/** Severity weights for scoring */
const severityWeights = {
  High: 20,
  Medium: 10,
  Low: 5,
};

module.exports = { securityRules, severityWeights };
