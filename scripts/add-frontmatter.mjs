import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const BLOG = path.join(ROOT, "content", "blog");

function firstGitDate(file) {
  try {
    const out = execSync(`git log --follow --diff-filter=A --format=%ad --date=iso-strict -- "${file}" | tail -1`, {stdio:["ignore","pipe","ignore"]}).toString().trim();
    return out || null;
  } catch { return null; }
}

function humanize(s){ return s.replace(/\.[^.]+$/,"").replace(/[-_]/g," ").replace(/\b\w/g, m=>m.toUpperCase()); }

function addFrontmatter(file){
  const raw = fs.readFileSync(file,"utf8");
  if (raw.startsWith("---\n")) return; // 已有，跳过
  const stat = fs.statSync(file);
  const date = firstGitDate(file) || stat.mtime.toISOString().slice(0,10);
  const title = humanize(path.basename(file));
  const guessTag = path.basename(path.dirname(file)); // 用上一级目录当默认标签
  const fm = `---\ntitle: "${title}"\ndate: ${date}\ntags: ["${guessTag}"]\nsummary: ""\n---\n`;
  fs.writeFileSync(file, fm + raw);
  console.log("added:", file);
}

function walk(dir){
  for (const f of fs.readdirSync(dir)){
    const p = path.join(dir,f);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(md|mdx)$/.test(f)) addFrontmatter(p);
  }
}
walk(BLOG);
