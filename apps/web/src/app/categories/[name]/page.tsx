import Link from 'next/link';
import { getPosts } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// 分类标签映射
const categoryLabels: Record<string, { label: string; description: string }> = {
  'murmurs-and-reflection': { 
    label: '碎碎念', 
    description: '日常思考与生活感悟'
  },
  'interview-experiences': { 
    label: '面经', 
    description: '真实面试经历与经验分享'
  },
  'internship-records': { 
    label: '实习记录', 
    description: '实习期间的工作内容与成长'
  },
  'join-in-open-source': { 
    label: '开源', 
    description: '参与开源项目的经历'
  },
  'interview-questions': { 
    label: '八股文', 
    description: '面试必备知识点整理'
  },
};

interface Props {
  params: Promise<{ name: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { name } = await params;
  const posts = await getPosts(name);
  
  const categoryInfo = categoryLabels[name] || { 
    label: name, 
    description: `${name} 分类下的所有文章`
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      {/* 面包屑导航 */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center gap-2 text-gray-500">
          <li><Link href="/" className="hover:text-pink-500">首页</Link></li>
          <li>/</li>
          <li><Link href="/posts" className="hover:text-pink-500">博客</Link></li>
          <li>/</li>
          <li className="text-gray-800 font-medium">{categoryInfo.label}</li>
        </ol>
      </nav>

      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
          {categoryInfo.label}
        </h1>
        <p className="text-gray-500">{categoryInfo.description}</p>
        <p className="text-sm text-gray-400 mt-2">共 {posts.length} 篇文章</p>
      </div>
      
      {posts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 mb-4">这个分类还没有文章</p>
          <Link 
            href="/posts"
            className="text-pink-500 hover:text-pink-600 font-medium"
          >
            查看所有文章
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.slug} href={`/posts/${post.slug}`}>
              <Card className="group">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-pink-500 transition-colors">
                  {post.title}
                </h2>
                {post.summary && (
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{post.summary}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                  <span>{formatDate(post.date)}</span>
                  {(post.tags ?? []).length > 0 && (
                    <>
                      <span>·</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {(post.tags ?? []).slice(0, 3).map((tag) => (
                          <span key={tag} className="text-pink-400">#{tag}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* 返回导航 */}
      <div className="mt-8 pt-6 border-t border-pink-100">
        <Link 
          href="/posts" 
          className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-600 font-medium"
        >
          ← 返回所有文章
        </Link>
      </div>
    </div>
  );
}
