import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

export default {
  // §6：darkMode 绑定夜航主题（Tailwind 3.4 selector 语法）
  darkMode: ['selector', '[data-theme="night"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // §6：语义色一律经 CSS 变量下发；RGB 通道值 + <alpha-value>
      colors: {
        bg: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-tint': 'var(--surface-tint)', // 自带透明度（night），不走 alpha-value
        ink: 'rgb(var(--c-text) / <alpha-value>)',
        'ink-2': 'rgb(var(--c-text-2) / <alpha-value>)',
        'ink-3': 'rgb(var(--c-text-3) / <alpha-value>)',
        'ink-muted': 'rgb(var(--c-text-muted) / <alpha-value>)', // 仅纯装饰（D1）
        line: 'rgb(var(--c-border) / <alpha-value>)',
        'line-2': 'rgb(var(--c-border-2) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        'accent-soft': 'var(--accent-soft)', // 自带透明度（night）
        'accent-strong': 'rgb(var(--c-accent-strong) / <alpha-value>)',
        'accent-text': 'rgb(var(--c-accent-text) / <alpha-value>)',
        'on-accent': 'rgb(var(--c-on-accent) / <alpha-value>)',
        'track-deep': 'rgb(var(--c-track-deep) / <alpha-value>)',
        'track-deep-dim': 'rgb(var(--c-track-deep-dim) / <alpha-value>)',
        'track-intro': 'rgb(var(--c-track-intro) / <alpha-value>)',
        'track-intro-dim': 'rgb(var(--c-track-intro-dim) / <alpha-value>)',
        'focus-ring': 'rgb(var(--c-focus-ring) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'], // duo=重磅无衬线 / editorial+night=Noto Serif SC（§6）
        mono: ['var(--font-mono)'],
        meta: ['var(--font-meta)'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        headline: 'var(--shadow-headline)',
        pill: 'var(--shadow-pill)',
        glow: 'var(--glow-hover)',
      },
      // D4 宽度节奏
      maxWidth: {
        container: '960px',
        hero: '640px',
        prose: '680px',
        headline: '760px',
        list: '856px',
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
      },
    },
  },
  plugins: [
    // §6：主题变体仅限装饰差异（阴影/圆角/伪元素），组件配色一律走 token
    plugin(({ addVariant }) => {
      addVariant('theme-duo', "[data-theme='duo'] &");
      addVariant('theme-editorial', "[data-theme='editorial'] &");
      addVariant('theme-night', "[data-theme='night'] &");
      addVariant('track-deep', "html[data-track='deep'] &");
      addVariant('track-intro', "html[data-track='intro'] &");
    }),
  ],
} satisfies Config;
