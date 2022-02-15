import { ApiDocumentedItem, ApiItem } from '@microsoft/api-extractor-model';
import { DocComment, DocSection } from '@microsoft/tsdoc';
import { IFoundationBuilders, SectionBuilder } from './interfaces';
import { appendSection } from './utils';

export const initDeprecatedBlock = (b: IFoundationBuilders, output: DocSection): SectionBuilder<ApiItem> => {
  return (apiItem: ApiItem) => {
    if (apiItem instanceof ApiDocumentedItem) {
      const tsdocComment: DocComment | undefined = apiItem.tsdocComment;

      if (tsdocComment) {
        if (tsdocComment.deprecatedBlock) {
          output.appendNode(
            b.noteBox([
              b.paragraph([b.text('Warning: This API is now obsolete. ')]),
              ...tsdocComment.deprecatedBlock.content.nodes
            ])
          );
        }

        appendSection(output, tsdocComment.summarySection);
      }
    }
  };
};
