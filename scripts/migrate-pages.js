#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Auto-migrate modules pages to src/pages
 * Usage: node scripts/migrate-pages.js
 */

const root = process.cwd();
const modulesDir = path.join(root, "src", "modules");
const pagesDir = path.join(root, "src", "pages");
const routesFile = path.join(root, "config", "routes.ts");

console.log("Starting auto-migration...\n");

// Find all module pages
const modulePages = [];

function scanModulePages(modulePath, moduleName) {
  if (!fs.existsSync(modulePath)) return;

  const pagesPath = path.join(modulePath, "pages");
  if (!fs.existsSync(pagesPath)) return;

  const entries = fs.readdirSync(pagesPath, { withFileTypes: true });

  entries.forEach((entry) => {
    const entryPath = path.join(pagesPath, entry.name);

    if (entry.isDirectory()) {
      const indexPath = path.join(entryPath, "index.tsx");
      if (fs.existsSync(indexPath)) {
        modulePages.push({
          moduleName,
          pageName: entry.name,
          sourcePath: indexPath,
          destDir: path.join(pagesDir, moduleName),
          destFile: path.join(pagesDir, moduleName, entry.name + ".tsx"),
        });
      }
      scanModulePages(entryPath, moduleName);
    } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
      const pageName = entry.name.replace(/\.(tsx|ts)$/, "");
      if (pageName !== "index") {
        modulePages.push({
          moduleName,
          pageName,
          sourcePath: entryPath,
          destDir: path.join(pagesDir, moduleName),
          destFile: path.join(pagesDir, moduleName, pageName + ".tsx"),
        });
      }
    }
  });
}

const moduleDirs = fs.readdirSync(modulesDir, { withFileTypes: true });
moduleDirs
  .filter((d) => d.isDirectory())
  .forEach((d) => {
    const modulePath = path.join(modulesDir, d.name);
    const pagesPath = path.join(modulePath, "pages");

    if (fs.existsSync(pagesPath)) {
      scanModulePages(modulePath, d.name);
    }
  });

console.log("Found " + modulePages.length + " pages to migrate:\n");
modulePages.forEach((p) => {
  console.log("  - " + p.moduleName + "/" + p.pageName);
});

// Create dest directories
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

modulePages.forEach((p) => {
  if (!fs.existsSync(p.destDir)) {
    fs.mkdirSync(p.destDir, { recursive: true });
  }
});

// Copy files
console.log("\nCopying files...\n");

modulePages.forEach((p) => {
  const content = fs.readFileSync(p.sourcePath, "utf8");
  fs.writeFileSync(p.destFile, content, "utf8");
  console.log("  Created: " + p.destFile);
});

// Update routes
console.log("\nUpdating routes...\n");

let routesContent = fs.readFileSync(routesFile, "utf8");

const routeMapping = modulePages.map((p) => {
  const oldPath = "@/modules/" + p.moduleName + "/pages/" + p.pageName;
  const newPath = "./" + p.moduleName + "/" + p.pageName;
  return { oldPath, newPath };
});

routeMapping.sort((a, b) => b.oldPath.length - a.oldPath.length);

routeMapping.forEach((m) => {
  const regex = new RegExp(m.oldPath.replace(/\//g, "\\/"), "g");
  routesContent = routesContent.replace(regex, m.newPath);
});

fs.writeFileSync(routesFile, routesContent, "utf8");
console.log("  Updated config/routes.ts");

// Clean up empty pages folders
console.log("\nCleaning up empty folders...\n");

function deleteEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      deleteEmptyDirs(fullPath);
    }
  });

  const remaining = fs.readdirSync(dir);
  if (remaining.length === 0) {
    fs.rmdirSync(dir);
    console.log("  Removed empty: " + dir);
  }
}

moduleDirs.forEach((d) => {
  const pagesPath = path.join(modulesDir, d.name, "pages");
  if (fs.existsSync(pagesPath)) {
    deleteEmptyDirs(pagesPath);
  }
});

console.log("\nMigration complete!");
console.log("\nNew pages created:");
modulePages.forEach((p) => {
  console.log("  src/pages/" + p.moduleName + "/" + p.pageName + ".tsx");
});
