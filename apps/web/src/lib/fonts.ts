import { Noto_Serif_SC } from 'next/font/google';

/** D3：Noto Serif SC 切片自托管，仅 A/C 主题标题层使用 */
export const notoSerifSC = Noto_Serif_SC({
  weight: ['700', '900'],
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  fallback: ['Songti SC', 'SimSun'],
  variable: '--font-noto-serif',
});
