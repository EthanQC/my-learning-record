// §6 图片链路：prebuild 把 content/articles/<track>/<slug>.assets/ 拷贝到
// <web 应用根>/public/article-assets/<track>/<slug>/，运行时镜像不再 COPY content。
// cwd 基准解析：本地 npm lifecycle cwd=apps/web；Docker build 阶段 cwd=/app。
import fs from 'node:fs';
import path from 'node:path';

const webRoot = process.cwd();
if (!fs.existsSync(path.join(webRoot, 'next.config.ts'))) {
  console.error(`copy-article-assets: 必须在 web 应用根下执行（cwd=${webRoot} 无 next.config.ts）`);
  process.exit(1);
}

/** 从 cwd 向上找 content/articles（本地 = ../../content，Docker = ./content） */
function findContentRoot() {
  let dir = webRoot;
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, 'content', 'articles');
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  console.error('copy-article-assets: content/articles 目录未找到');
  process.exit(1);
}

const srcRoot = findContentRoot();
const destRoot = path.join(webRoot, 'public', 'article-assets');

fs.rmSync(destRoot, { recursive: true, force: true });

let copied = 0;
for (const track of ['deep', 'intro']) {
  const trackDir = path.join(srcRoot, track);
  if (!fs.existsSync(trackDir)) continue;
  for (const entry of fs.readdirSync(trackDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.endsWith('.assets')) continue;
    const slug = entry.name.slice(0, -'.assets'.length);
    const dest = path.join(destRoot, track, slug);
    fs.cpSync(path.join(trackDir, entry.name), dest, { recursive: true });
    copied += fs.readdirSync(dest).length;
  }
}
console.log(`copy-article-assets: ${copied} 个文件 → ${path.relative(webRoot, destRoot)}/`);
