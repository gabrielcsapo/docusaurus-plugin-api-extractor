import remark from 'remark';
import { emitDocusaurusFrontMatter } from '../dist/markdown/emit-docusaurus-front-matter';
import remarkFrontmatter from 'remark-frontmatter';

it('Emits frontmatter with "A Class" title', () => {
  const out = remark()
    .use(remarkFrontmatter)
    .use(emitDocusaurusFrontMatter, 'a-class')
    .processSync('## A Class').contents;
  expect(out).toMatchSnapshot();
});

it('Emits frontmatter specific to index', () => {
  const out = remark()
    .use(remarkFrontmatter)
    .use(emitDocusaurusFrontMatter, 'index')
    .processSync('## Example').contents;
  expect(out).toMatchSnapshot();
});
