import { ApiItem, ApiPropertyItem } from '@microsoft/api-extractor-model';
import { DocSection, TSDocConfiguration } from '@microsoft/tsdoc';
import { DocTableCell } from '../nodes/doc-table-cell';
import { IFoundationBuilders, PropertyTypeCellBuilder } from './interfaces';

export const initPropertyTypeCell = (configuration: TSDocConfiguration): PropertyTypeCellBuilder => {
  return (apiItem: ApiItem, b: IFoundationBuilders): DocTableCell => {
    const section: DocSection = new DocSection({ configuration });

    if (apiItem instanceof ApiPropertyItem) {
      section.appendNode(b.excerpt(apiItem.propertyTypeExcerpt));
    }

    return new DocTableCell({ configuration }, section.nodes);
  };
};
