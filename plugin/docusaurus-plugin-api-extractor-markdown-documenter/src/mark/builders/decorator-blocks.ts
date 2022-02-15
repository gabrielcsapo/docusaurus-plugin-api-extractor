import { ApiDocumentedItem, ApiItem } from '@microsoft/api-extractor-model';
import { DocBlock, DocComment, DocSection, StandardTags } from '@microsoft/tsdoc';
import { IFoundationBuilders, SectionBuilder } from './interfaces';

export const initDecoratorBlocks = (b: IFoundationBuilders, output: DocSection): SectionBuilder<ApiItem> => {
  return (apiItem: ApiItem) => {
    const decoratorBlocks: DocBlock[] = [];
    if (apiItem instanceof ApiDocumentedItem) {
      const tsdocComment: DocComment | undefined = apiItem.tsdocComment;
      if (tsdocComment) {
        decoratorBlocks.push(
          ...tsdocComment.customBlocks.filter(
            (block) => block.blockTag.tagNameWithUpperCase === StandardTags.decorator.tagNameWithUpperCase
          )
        );
      }

      if (decoratorBlocks.length > 0) {
        output.appendNode(b.paragraph([b.emphasis({ bold: true }, [b.text('Decorators:')])]));

        for (const decoratorBlock of decoratorBlocks) {
          output.appendNodes(decoratorBlock.content.nodes);
        }
      }
    }
  };
};
