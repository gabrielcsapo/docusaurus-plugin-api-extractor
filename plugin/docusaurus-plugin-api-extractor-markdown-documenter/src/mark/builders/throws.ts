import { ApiDocumentedItem, ApiItem } from '@microsoft/api-extractor-model';
import { DocBlock, DocComment, DocSection, StandardTags } from '@microsoft/tsdoc';
import { IFoundationBuilders, SectionBuilder } from './interfaces';
import { appendSection } from './utils';

export const initThrows = (b: IFoundationBuilders, output: DocSection): SectionBuilder<ApiItem> => {
  return (apiItem: ApiItem) => {
    if (apiItem instanceof ApiDocumentedItem) {
      const tsdocComment: DocComment | undefined = apiItem.tsdocComment;

      if (tsdocComment) {
        // Write the @throws blocks
        const throwsBlocks: DocBlock[] = tsdocComment.customBlocks.filter(
          (x) => x.blockTag.tagNameWithUpperCase === StandardTags.throws.tagNameWithUpperCase
        );

        if (throwsBlocks.length > 0) {
          const heading: string = 'Exceptions';
          output.appendNode(b.heading(heading));

          for (const throwsBlock of throwsBlocks) {
            appendSection(output, throwsBlock.content);
          }
        }
      }
    }
  };
};
