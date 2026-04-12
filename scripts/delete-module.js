#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Script xóa module + pages route
 * Usage: npm run delete:module module-name
 *
 * Xóa:
 *   - src/modules/<module>/
 *   - src/pages/<module>/
 */

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("❌ Vui lòng cung cấp tên module cần xóa!");
  console.log("Usage: npm run delete:module san-pham");
  process.exit(1);
}

const rawName = args[0];
const moduleNameLower = rawName.toLowerCase();

console.log("🗑️  Đang xóa module: " + moduleNameLower + "...");

const root = process.cwd();

// Paths
const moduleDir = path.join(root, "src", "modules", moduleNameLower);
const pagesDir = path.join(root, "src", "pages", moduleNameLower);

// Helper: delete folder recursive
function deleteFolderRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return false;

  fs.readdirSync(dirPath).forEach((file) => {
    const curPath = path.join(dirPath, file);
    if (fs.lstatSync(curPath).isDirectory()) {
      deleteFolderRecursive(curPath);
    } else {
      fs.unlinkSync(curPath);
    }
  });

  fs.rmdirSync(dirPath);
  return true;
}

// Delete src/modules/<module>
if (fs.existsSync(moduleDir)) {
  try {
    deleteFolderRecursive(moduleDir);
    console.log("✅ Đã xóa: src/modules/" + moduleNameLower);
  } catch (err) {
    console.error("❌ Lỗi khi xóa module: " + err.message);
    process.exit(1);
  }
} else {
  console.warn("⚠️  Không tìm thấy: src/modules/" + moduleNameLower);
}

// Delete src/pages/<module>
if (fs.existsSync(pagesDir)) {
  try {
    deleteFolderRecursive(pagesDir);
    console.log("✅ Đã xóa: src/pages/" + moduleNameLower);
  } catch (err) {
    console.error("❌ Lỗi khi xóa pages: " + err.message);
    process.exit(1);
  }
} else {
  console.warn("⚠️  Không tìm thấy: src/pages/" + moduleNameLower);
}

console.log('\n✨ Hoàn tất xóa module "' + moduleNameLower + '"');
console.log("\n📁 Đã xóa:");
console.log("  - src/modules/" + moduleNameLower + "/");
console.log("  - src/pages/" + moduleNameLower + "/");

// ===================== AUTO UPDATE routes.ts =====================
const routesPath = path.join(root, "config", "routes.ts");
if (fs.existsSync(routesPath)) {
  let routesContent = fs.readFileSync(routesPath, "utf8");
  const escapedModule = moduleNameLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pathPattern = `path:[^\\n]*?/${escapedModule}[^\\n]*`;
  const pathMatch = routesContent.match(new RegExp(pathPattern));
  if (pathMatch) {
    const matchIdx = routesContent.indexOf(pathMatch[0]);
    const beforeMatch = routesContent.slice(0, matchIdx);
    const openBrace = beforeMatch.lastIndexOf("  {");
    let depth = 0;
    let closeIdx = -1;
    for (let i = openBrace; i < routesContent.length; i++) {
      const c = routesContent[i];
      if (c === "{" || c === "[") depth++;
      else if (c === "}" || c === "]") depth--;
      if (depth === 0 && c === "}") {
        closeIdx = i;
        break;
      }
    }
    if (openBrace !== -1 && closeIdx !== -1) {
      const blockToRemove = routesContent.slice(openBrace, closeIdx + 1);
      routesContent = routesContent.replace(blockToRemove, "");
      fs.writeFileSync(routesPath, routesContent, "utf8");
      console.log("✅ Auto-updated: config/routes.ts (removed route)");
    }
  }
}
// ===================== END AUTO UPDATE =====================
