import { ApiDocumentedItem, ApiItem } from '@microsoft/api-extractor-model';
import { TSDocConfiguration } from '@microsoft/tsdoc';
import { DocHeading } from '../nodes/doc-heading';
import { Builder } from './interfaces';
import { extractModulePath } from './utils';

export const initModulePathHeading = (configuration: TSDocConfiguration): Builder<DocHeading | undefined> => {
  return (apiItem: ApiItem): DocHeading | undefined => {
    let modulePath: string | undefined;
    if (apiItem instanceof ApiDocumentedItem) {
      modulePath = extractModulePath(apiItem);
    }

    if (modulePath) {
      return new DocHeading({ configuration, title: `Import Path: ${modulePath}`, level: 2 });
    }

    return;
  };
};
