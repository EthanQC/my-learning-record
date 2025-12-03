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
        <div className="mt-4 pt-4 border-t border-pink-100">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs text-gray-500">
            <a
              href="https://beian.mps.gov.cn/#/query/webSearch?code=44030002008906"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-pink-600 transition-colors"
            >
              <img
                src="/beian-gongan.png"
                alt="公安备案图标"
                className="h-4 w-4"
                loading="lazy"
              />
              粤公网安备44030002008906号
            </a>

            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-600 transition-colors"
            >
              粤ICP备2025487305号
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
