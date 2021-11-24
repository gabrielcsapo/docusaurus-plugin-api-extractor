import remark from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import { repairHeritageTypes } from './repair-heritage-types';
import { emitDocusaurusFrontMatter } from './emit-docusaurus-front-matter';
import './patch-markdown-printer';

/**
 * @param markdownString
 * @returns string
 */
export const toDocusaurusMarkDown = (markdownString: string, id: string): string => {
  return remark()
    .use(remarkFrontmatter, ['yaml'])
    .use(repairHeritageTypes)
    .use(emitDocusaurusFrontMatter, id)
    .processSync(markdownString).contents as string;
};
