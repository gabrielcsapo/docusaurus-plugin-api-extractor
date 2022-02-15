import { ApiItem, ApiOptionalMixin } from '@microsoft/api-extractor-model';
import { DocLinkTag, DocParagraph, TSDocConfiguration } from '@microsoft/tsdoc';
import { getConciseSignature } from '../file-naming';
import { DocTableCell } from '../nodes/doc-table-cell';
import { Builder } from './interfaces';
import { getLinkFilenameForApiItem } from './utils';

export const initTitleCell = (configuration: TSDocConfiguration): Builder<DocTableCell> => {
  return (apiItem: ApiItem): DocTableCell => {
    let linkText: string = getConciseSignature(apiItem);
    if (ApiOptionalMixin.isBaseClassOf(apiItem) && apiItem.isOptional) {
      linkText += '?';
    }

    return new DocTableCell({ configuration }, [
      new DocParagraph({ configuration }, [
        new DocLinkTag({
          configuration,
          tagName: '@link',
          linkText: linkText,
          urlDestination: getLinkFilenameForApiItem(apiItem)
        })
      ])
    ]);
  };
};
