import visit from 'unist-util-visit';
import { Node, Data, Literal, Parent } from 'unist';

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
export const repairGenerics = () => {
  return (tree: Node<Data>) => {
    let inReturnSection: boolean = false;
    visit<Parent>(tree, 'paragraph', (paragraphNode) => {
      if (inReturnSection) {
        paragraphNode.children.forEach((child) => {
          if (child.type === 'text') {
            (child as Literal<string>).value = (child as Literal<string>).value
              .replace('<', '___REPAIR_LT___')
              .replace('>', '___REPAIR_GT___');
          }
        });
        inReturnSection = false;
      }

      if (paragraphNode.children.length === 3) {
        const [maybeBoldStart, maybeReturnsText, maybeBoldEnd] = paragraphNode.children as Literal<string>[];

        if (
          maybeBoldStart.value === '<b>' &&
          maybeReturnsText.value === 'Returns:' &&
          maybeBoldEnd.value === '</b>'
        ) {
          inReturnSection = true;
        }
      }
    });
  };
};
