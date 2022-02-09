import remark from 'remark';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import { repairHeritageTypes } from './repair-heritage-types';
import { emitDocusaurusFrontMatter } from './emit-docusaurus-front-matter';
import './patch-markdown-printer';
import { repairEscaping } from './repair-escaping';
import { replaceAll } from './replace-all';

/**
 * @param markdownString
 * @returns string
 */
export const toDocusaurusMarkDown = (markdownString: string, id: string): string => {
  let out: string = remark()
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkGfm)
    .use(repairHeritageTypes)
    .use(repairEscaping)
    .use(emitDocusaurusFrontMatter, id)
    .processSync(markdownString).contents as string;

  out = replaceAll(out, '___REPAIR_LT___', '&lt;');
  out = replaceAll(out, '___REPAIR_GT___', '&gt;');
  return out;
};
