import { ApiDocumentedItem, ApiItem } from '@microsoft/api-extractor-model';
import { DocBlock, DocComment, DocSection, StandardTags } from '@microsoft/tsdoc';
import { IFoundationBuilders, SectionBuilder } from './interfaces';
import { appendSection } from './utils';

export const initRemarksSection = (
  builders: IFoundationBuilders,
  output: DocSection
): SectionBuilder<ApiItem> => {
  return (apiItem: ApiItem): void => {
    if (apiItem instanceof ApiDocumentedItem) {
      const tsdocComment: DocComment | undefined = apiItem.tsdocComment;

      if (tsdocComment) {
        // Write the @remarks block
        if (tsdocComment.remarksBlock) {
          output.appendNode(builders.heading('Remarks'));
          appendSection(output, tsdocComment.remarksBlock.content);
        }

        // Write the @example blocks
        const exampleBlocks: DocBlock[] = tsdocComment.customBlocks.filter(
          (x) => x.blockTag.tagNameWithUpperCase === StandardTags.example.tagNameWithUpperCase
        );

        let exampleNumber: number = 1;
        for (const exampleBlock of exampleBlocks) {
          const heading: string = exampleBlocks.length > 1 ? `Example ${exampleNumber}` : 'Example';

          output.appendNode(builders.heading(heading));

          appendSection(output, exampleBlock.content);

          ++exampleNumber;
        }
      }
    }
  };
};
