import { ApiItem, ApiStaticMixin } from '@microsoft/api-extractor-model';
import { DocCodeSpan, DocSection, TSDocConfiguration } from '@microsoft/tsdoc';
import { DocTableCell } from '../nodes/doc-table-cell';
import { Builder } from './interfaces';

export const initModifierCell = (configuration: TSDocConfiguration): Builder<DocTableCell> => {
  return (apiItem: ApiItem): DocTableCell => {
    const section: DocSection = new DocSection({ configuration });

    if (ApiStaticMixin.isBaseClassOf(apiItem)) {
      if (apiItem.isStatic) {
        section.appendNodeInParagraph(new DocCodeSpan({ configuration, code: 'static' }));
      }
    }

    return new DocTableCell({ configuration }, section.nodes);
  };
};
