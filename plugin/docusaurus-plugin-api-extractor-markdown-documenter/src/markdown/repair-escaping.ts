import visit from 'unist-util-visit';
import { Node, Data, Literal, Parent } from 'unist';
import { replaceAll } from './replace-all';

/**
 * This function is responsible for fixing how the hertiage types
 * (Implements, Extends, References) are emitted as markdown with
 * bold tags instead of the markdown equivalent followed by a
 * markdown link. This seems to be problematic for some
 * implementations of markdown and causes the link not to render
 * properly.
 * @returns {}
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const repairEscaping = () => {
  return (tree: Node<Data>) => {
    visit<Parent>(tree, 'paragraph', (paragraphNode) => {
      paragraphNode.children.forEach((child) => {
        if (child.type === 'text') {
          let text: string = (child as Literal<string>).value;
          text = replaceAll(text, '<', '___REPAIR_LT___');
          text = replaceAll(text, '>', '___REPAIR_GT___');
          (child as Literal<string>).value = text;
        }
      });
    });
  };
};
