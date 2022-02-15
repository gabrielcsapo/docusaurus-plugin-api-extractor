import {
  ApiDocumentedItem,
  ApiItem,
  ApiOptionalMixin,
  ApiReleaseTagMixin,
  ReleaseTag
} from '@microsoft/api-extractor-model';
import { DocPlainText, DocSection, TSDocConfiguration } from '@microsoft/tsdoc';
import { DocEmphasisSpan } from '../nodes/doc-emphasis-span';
import { DocTableCell } from '../nodes/doc-table-cell';
import { Builder } from './interfaces';
import { appendAndMergeSection } from './utils';

export const initDescriptionCell = (configuration: TSDocConfiguration): Builder<DocTableCell> => {
  return (apiItem: ApiItem): DocTableCell => {
    const section: DocSection = new DocSection({ configuration });

    if (ApiReleaseTagMixin.isBaseClassOf(apiItem)) {
      if (apiItem.releaseTag === ReleaseTag.Beta) {
        section.appendNodesInParagraph([
          new DocEmphasisSpan({ configuration, bold: true, italic: true }, [
            new DocPlainText({ configuration, text: '(BETA)' })
          ]),
          new DocPlainText({ configuration, text: ' ' })
        ]);
      }
    }

    if (ApiOptionalMixin.isBaseClassOf(apiItem) && apiItem.isOptional) {
      section.appendNodesInParagraph([
        new DocEmphasisSpan({ configuration, italic: true }, [
          new DocPlainText({ configuration, text: '(Optional)' })
        ]),
        new DocPlainText({ configuration, text: ' ' })
      ]);
    }

    if (apiItem instanceof ApiDocumentedItem) {
      if (apiItem.tsdocComment !== undefined) {
        appendAndMergeSection(section, apiItem.tsdocComment.summarySection);
      }
    }

    return new DocTableCell({ configuration }, section.nodes);
  };
};
