// 生成 OG 图（1200×630）、apple-icon（180）、favicon.ico（32）——双线视觉母体（§5.1）
// 用法：node scripts/generate-brand-assets.mjs（仓库根执行）
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const appDir = path.join(process.cwd(), 'apps', 'web', 'src', 'app');

const OG_SVG = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#FDFBFC"/>
  <rect x="0" y="380" width="1200" height="12" fill="#17141A"/>
  <rect x="0" y="420" width="1200" height="12" fill="#EC5A87"/>
  <text x="96" y="280" font-family="PingFang SC, Hiragino Sans GB, Helvetica, Arial, sans-serif"
    font-size="128" font-weight="800" fill="#17141A">Devline</text>
  <text x="98" y="540" font-family="PingFang SC, Hiragino Sans GB, Helvetica, Arial, sans-serif"
    font-size="44" fill="#5C525A">一条线给工程师，一条线给所有人</text>
</svg>`;

const ICON_SVG = (size) => `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#FDFBFC"/>
  <rect x="${size * 0.125}" y="${size * 0.42}" width="${size * 0.75}" height="${size * 0.09}" rx="${size * 0.045}" fill="#17141A"/>
  <rect x="${size * 0.125}" y="${size * 0.6}" width="${size * 0.75}" height="${size * 0.09}" rx="${size * 0.045}" fill="#EC5A87"/>
</svg>`;

await sharp(Buffer.from(OG_SVG))
  .png({ compressionLevel: 9, palette: true })
  .toFile(path.join(appDir, 'opengraph-image.png'));

await sharp(Buffer.from(ICON_SVG(180)))
  .png()
  .toFile(path.join(appDir, 'apple-icon.png'));

const png32 = await sharp(Buffer.from(ICON_SVG(32))).png().toBuffer();
fs.writeFileSync(path.join(appDir, 'favicon.ico'), await pngToIco(png32));

const ogSize = fs.statSync(path.join(appDir, 'opengraph-image.png')).size;
console.log(`opengraph-image.png: ${(ogSize / 1024).toFixed(1)}KB（预算 150KB）`);
if (ogSize > 150 * 1024) {
  console.error('OG 图超出 §5.1 体积预算');
  process.exit(1);
}
console.log('brand assets OK');
