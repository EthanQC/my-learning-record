import { z } from 'zod';

/** frontmatter 校验（规格 §3）。校验失败直接 throw，`next build` 即失败。 */
export const frontmatterSchema = z.object({
  title: z.string().min(1, 'title 必填'),
  date: z.coerce.date({ errorMap: () => ({ message: 'date 必须可解析为日期' }) }),
  track: z.enum(['deep', 'intro'], { errorMap: () => ({ message: 'track 必须 ∈ deep|intro' }) }),
  summary: z.string().min(1, 'summary 必填'),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
