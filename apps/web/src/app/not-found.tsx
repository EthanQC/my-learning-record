import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="notfound">
      {/* 双线断开装置：gradient 制造中段缺口，两线缺口错位 */}
      <span className="notfound-line notfound-line-deep" aria-hidden="true" />
      <span className="notfound-line notfound-line-intro" aria-hidden="true" />
      <div className="container-devline notfound-body">
        <h1 className="notfound-title">404 · 这条线还没铺到这里</h1>
        <p className="notfound-sub">你找的页面不存在，也可能已随改版下线。</p>
        <div className="notfound-cta">
          <Link className="notfound-btn notfound-btn-primary" href="/">
            回首页
          </Link>
          <Link className="notfound-btn" href="/articles">
            看文章
          </Link>
        </div>
      </div>
    </div>
  );
}
