import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 支持的图片 MIME 类型
const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: imagePath } = await context.params;
  
  if (!imagePath || imagePath.length === 0) {
    return NextResponse.json({ error: 'Image path required' }, { status: 400 });
  }

  // 构建完整路径
  const relativePath = imagePath.join('/');
  
  // 安全检查：防止目录遍历攻击
  if (relativePath.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  // 尝试在 content 目录中查找图片
  // 本地开发时: process.cwd() = apps/web, content 在 ../../content
  // Docker 运行时: process.cwd() = /app, content 在 ./content
  const isProduction = process.env.NODE_ENV === 'production';
  const contentDir = process.env.CONTENT_DIR || (
    isProduction 
      ? path.join(process.cwd(), 'content')
      : path.join(process.cwd(), '..', '..', 'content')
  );
  
  // 可能的图片位置
  const possiblePaths = [
    path.join(contentDir, 'notes', relativePath),
    path.join(contentDir, 'blog', relativePath),
    path.join(contentDir, relativePath),
  ];

  let imagFilePath: string | null = null;
  
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      imagFilePath = possiblePath;
      break;
    }
  }

  if (!imagFilePath) {
    console.error(`Image not found: ${relativePath}`);
    console.error('Searched in:', possiblePaths);
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  // 获取文件扩展名和 MIME 类型
  const ext = path.extname(imagFilePath).toLowerCase();
  const mimeType = MIME_TYPES[ext];

  if (!mimeType) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 });
  }

  try {
    const imageBuffer = fs.readFileSync(imagFilePath);
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error reading image:', error);
    return NextResponse.json({ error: 'Failed to read image' }, { status: 500 });
  }
}
