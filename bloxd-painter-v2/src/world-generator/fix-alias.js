// scripts/fix-alias.mjs
import fs from "node:fs";
import path from "node:path";

const root = "src/world-procgen"; // @/ が指すルート

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name))
    : e.name.endsWith(".ts") ? [path.join(dir, e.name)] : []
  );
}

let changedFiles = 0;
let changedImports = 0;

for (const file of walk(root)) {
  const src = fs.readFileSync(file, "utf8");

  const out = src.replace(
    /(from\s+|import\s*\()(["'])@\/([^"']+)\2/g,
    (_match, kw, q, target) => {
      let rel = path.relative(path.dirname(file), path.join(root, target)).replaceAll("\\", "/");
      if (!rel.startsWith(".")) rel = "./" + rel;
      if (!/\.(js|json)$/.test(rel)) rel += ".js"; // NodeNext由来で拡張子が付いているはずだが念のため
      changedImports++;
      return `${kw}${q}${rel}${q}`;
    }
  );

  if (out !== src) {
    fs.writeFileSync(file, out);
    changedFiles++;
  }
}

console.log(`Changed ${changedImports} imports in ${changedFiles} files.`);