import Link from 'next/link';

const socialLinks = [
  { name: 'GitHub', url: 'https://github.com/EthanQC' },
  { name: 'Email', url: 'mailto:2367918546@qq.com' },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-pink-100 bg-white/50">
      <div className="container mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © 2025 Qingverse. All rights reserved.
          </p>
          
          <div className="flex gap-6">
            {socialLinks.map((link) => (
              <Link
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* ICP 备案信息 */}
        <div className="mt-4 pt-4 border-t border-pink-100 text-center">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-pink-600 transition-colors text-xs"
          >
            粤ICP备2025487305号
          </a>
        </div>
      </div>
    </footer>
  );
}