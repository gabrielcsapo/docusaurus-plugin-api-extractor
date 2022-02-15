import { ApiDocumentedItem, ApiItem } from '@microsoft/api-extractor-model';
import { DocPlainText, DocSection, TSDocConfiguration } from '@microsoft/tsdoc';
import { DocTableCell } from '../nodes/doc-table-cell';
import { Builder } from './interfaces';
import { extractModulePath } from './utils';

export const initModulePathCell = (configuration: TSDocConfiguration): Builder<DocTableCell> => {
  return (apiItem: ApiItem): DocTableCell => {
    const section: DocSection = new DocSection({ configuration });
    if (apiItem instanceof ApiDocumentedItem) {
      const modulePath: string = extractModulePath(apiItem) ?? '';
      section.appendNodesInParagraph([new DocPlainText({ configuration, text: modulePath })]);
    }

    return new DocTableCell({ configuration }, section.nodes);
  };
};
