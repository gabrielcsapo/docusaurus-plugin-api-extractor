import visit from 'unist-util-visit';
import { Node, Literal, Parent } from 'unist';

interface HeadingNode extends Parent<Literal<string>> {
  depth: number;
}

/**
 * Emits the docusaurus frontmatter
 * @param id relative filepath
 * @returns
 */
export const emitDocusaurusFrontMatter = (id: string) => {
  return (tree: Node) => {
    let foundHeading = false;
    const parts = [`id: ${id}`, 'hide_title: true'];
    visit<HeadingNode>(tree, 'heading', (headingNode) => {
      if (
        !foundHeading &&
        headingNode.depth === 2 &&
        headingNode.children[0].type === 'text'
      ) {
        foundHeading = true;
        parts.push(`title: ${headingNode.children[0].value}`);
      }
    });

    if (id === 'index') {
      parts.push('slug: /');
    }

    (tree as Parent<Literal<string>>).children.unshift({
      type: 'yaml',
      value: parts.join('\n'),
    });
  };
};
