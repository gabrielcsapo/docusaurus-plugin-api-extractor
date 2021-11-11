import visit from 'unist-util-visit';
import { Node, Data, Literal, Parent } from 'unist';

interface IStrongNode extends Parent {
  type: 'strong';
}

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
export const repairHeritageTypes = () => {
  return (tree: Node<Data>) => {
    visit<Parent>(tree, 'paragraph', (paragraphNode) => {
      const strong: IStrongNode = {
        type: 'strong',
        children: []
      };

      visit<Literal<string>>(paragraphNode, 'html', (htmlNode) => {
        const index: number = paragraphNode.children.indexOf(htmlNode);
        const textNode: Literal<string> = paragraphNode.children[index + 1] as Literal<string>;

        if (
          htmlNode.value === '<b>' &&
          textNode.type === 'text' &&
          (textNode.value === 'Implements:' ||
            textNode.value === 'Extends:' ||
            textNode.value === 'References:')
        ) {
          const start: number = index + 1;

          let seenEndTag: boolean = false;
          paragraphNode.children.splice(index, 1, strong);

          for (let current: number = paragraphNode.children.length - 1; start <= current; current--) {
            const newChild: Literal<string> = paragraphNode.children[current] as Literal<string>;

            if (seenEndTag) {
              paragraphNode.children.splice(current, 1);
              strong.children.unshift(newChild);
            } else if (newChild.type === 'html' && newChild.value === '</b>') {
              seenEndTag = true;
              paragraphNode.children.splice(current, 1);
            }
          }
        }
      });
    });
  };
};
