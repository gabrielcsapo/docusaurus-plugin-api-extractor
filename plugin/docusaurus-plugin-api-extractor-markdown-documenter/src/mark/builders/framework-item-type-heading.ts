import { ApiDocumentedItem, ApiItem } from '@microsoft/api-extractor-model';
import { TSDocConfiguration } from '@microsoft/tsdoc';
import { DocHeading } from '../nodes/doc-heading';
import { Builder } from './interfaces';
import { extractTitle } from './utils';

export const initFrameworkItemTypeHeading = (configuration: TSDocConfiguration): Builder<DocHeading> => {
  return (apiItem: ApiItem) => {
    let title: string = apiItem.kind.toLocaleLowerCase();

    const scopedName: string = apiItem.getScopedNameWithinPackage();

    if (title === 'typealias') {
      title = 'type alias';
    }

    if (apiItem instanceof ApiDocumentedItem) {
      title = extractTitle(apiItem) ?? title;
    }

    return new DocHeading({ configuration, title: `${scopedName} ${title}` });
  };
};
