#!/usr/bin/env node
/**
 * 摘要生成脚本
 * 为缺少摘要的 Markdown 文档自动生成摘要
 * 同时清理摘要中的 Markdown 格式字符
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const CONTENT_DIRS = [
  path.join(ROOT, 'content', 'blog'),
  path.join(ROOT, 'content', 'notes'),
];

// 清理 Markdown 格式字符
function cleanMarkdown(text) {
  if (!text) return '';
  
  return text
    // 移除代码块
    .replace(/```[\s\S]*?```/g, '')
    // 移除行内代码
    .replace(/`[^`]+`/g, '')
    // 移除图片
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // 移除链接但保留文字
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除标题标记
    .replace(/^#{1,6}\s+/gm, '')
    // 移除粗体和斜体
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // 移除引用块标记
    .replace(/^>\s*/gm, '')
    // 移除列表标记
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // 移除 HTML 标签
    .replace(/<[^>]+>/g, '')
    // 移除多余的空白
    .replace(/\s+/g, ' ')
    .trim();
}

// 从内容中提取摘要
function extractSummary(content, maxLength = 150) {
  // 移除 frontmatter
  const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---\n*/m, '');
  
  // 清理 Markdown 格式
  const cleanedContent = cleanMarkdown(contentWithoutFrontmatter);
  
  if (!cleanedContent) return '';
  
  // 截取前 maxLength 个字符
  let summary = cleanedContent.slice(0, maxLength);
  
  // 如果原文更长，在句子边界处截断并添加省略号
  if (cleanedContent.length > maxLength) {
    // 尝试在句号、问号、感叹号处截断
    const sentenceEnd = summary.search(/[。！？.!?]/);
    if (sentenceEnd > 50) {
      summary = summary.slice(0, sentenceEnd + 1);
    } else {
      // 在逗号或空格处截断
      const lastComma = summary.lastIndexOf('，');
      const lastSpace = summary.lastIndexOf(' ');
      const breakPoint = Math.max(lastComma, lastSpace);
      if (breakPoint > 50) {
        summary = summary.slice(0, breakPoint);
      }
      summary += '...';
    }
  }
  
  return summary;
}

// 解析 frontmatter
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { frontmatter: null, body: content };
  
  const frontmatterStr = match[1];
  const body = content.slice(match[0].length);
  
  const frontmatter = {};
  const lines = frontmatterStr.split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    
    // 处理引号包裹的字符串
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    // 处理数组格式 (简单处理)
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        value = JSON.parse(value);
      } catch {
        // 保持原样
      }
    }
    
    frontmatter[key] = value;
  }
  
  return { frontmatter, body, raw: match[0] };
}

// 重建 frontmatter
function buildFrontmatter(frontmatter) {
  let result = '---\n';
  
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      result += `${key}: ${JSON.stringify(value)}\n`;
    } else if (typeof value === 'string' && (value.includes(':') || value.includes('"') || value.includes("'"))) {
      result += `${key}: "${value.replace(/"/g, '\\"')}"\n`;
    } else {
      result += `${key}: "${value}"\n`;
    }
  }
  
  result += '---\n';
  return result;
}

// 处理单个文件
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { frontmatter, body, raw } = parseFrontmatter(content);
  
  if (!frontmatter) {
    console.log(`⚠️  无 frontmatter: ${path.relative(ROOT, filePath)}`);
    return false;
  }
  
  let updated = false;
  
  // 检查并更新摘要
  if (!frontmatter.summary || frontmatter.summary === '' || frontmatter.summary === '""') {
    // 生成新摘要
    const newSummary = extractSummary(content);
    if (newSummary) {
      frontmatter.summary = newSummary;
      updated = true;
      console.log(`✅ 生成摘要: ${path.relative(ROOT, filePath)}`);
    }
  } else if (typeof frontmatter.summary === 'string') {
    // 清理现有摘要中的 Markdown 格式
    const cleanedSummary = cleanMarkdown(frontmatter.summary);
    if (cleanedSummary !== frontmatter.summary) {
      frontmatter.summary = cleanedSummary;
      updated = true;
      console.log(`🔧 清理摘要: ${path.relative(ROOT, filePath)}`);
    }
  }
  
  // 写回文件
  if (updated) {
    const newFrontmatter = buildFrontmatter(frontmatter);
    const newContent = newFrontmatter + body;
    fs.writeFileSync(filePath, newContent);
    return true;
  }
  
  return false;
}

// 递归遍历目录
function walkDir(dir) {
  if (!fs.existsSync(dir)) return [];
  
  const files = [];
  
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (/\.(md|mdx)$/.test(entry)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// 主函数
function main() {
  console.log('🚀 开始处理摘要...\n');
  
  let totalFiles = 0;
  let updatedFiles = 0;
  
  for (const dir of CONTENT_DIRS) {
    const files = walkDir(dir);
    
    for (const file of files) {
      totalFiles++;
      if (processFile(file)) {
        updatedFiles++;
      }
    }
  }
  
  console.log(`\n📊 统计: 共处理 ${totalFiles} 个文件，更新 ${updatedFiles} 个文件`);
}

main();
