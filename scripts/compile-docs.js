/**
 * @file compile-docs.js
 * @description Pre-build compilation script for Cole.dev.
 * Scans the /docs directory for markdown (.md) documents, aggregates them
 * into a single unified context string, and outputs it as a static JSON module
 * at /lib/docs-context.json.
 * 
 * This resolves the serverless V8 Edge isolate runtime block by eliminating
 * dynamic filesystem reads (node:fs) at request time.
 */

const fs = require("fs");
const path = require("path");

try {
  console.log("[BUILD-PREPARE] Initializing static documentation compiler...");

  const docsDir = path.join(__dirname, "..", "docs");
  const libDir = path.join(__dirname, "..", "lib");
  const outputFile = path.join(libDir, "docs-context.json");

  // Validate presence of source documentation
  if (!fs.existsSync(docsDir)) {
    console.error(`[BUILD-ERROR] Core docs directory not found at: ${docsDir}`);
    process.exit(1);
  }

  // Ensure target lib directory exists
  if (!fs.existsSync(libDir)) {
    console.log(`[BUILD-PREPARE] Target directory missing. Creating: ${libDir}`);
    fs.mkdirSync(libDir, { recursive: true });
  }

  const files = fs.readdirSync(docsDir);
  let compiledContext = "";
  let compiledCount = 0;

  // Process all markdown context files
  for (const file of files) {
    if (file.endsWith(".md")) {
      const filePath = path.join(docsDir, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      
      // Structure document context matches original API route separators
      compiledContext += `\n\n--- DOCUMENT: ${file} ---\n${fileContent}\n`;
      compiledCount++;
    }
  }

  // Write static JSON module
  fs.writeFileSync(
    outputFile,
    JSON.stringify({ context: compiledContext }, null, 2),
    "utf-8"
  );
  
  console.log(`[BUILD-SUCCESS] Successfully compiled ${compiledCount} markdown documents to lib/docs-context.json`);
} catch (error) {
  console.error("[BUILD-FATAL] Failed to compile documents context:", error);
  process.exit(1);
}
