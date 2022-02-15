import { ApiInterface, ApiItemKind, ApiPropertyItem } from '@microsoft/api-extractor-model';
import { DocSection } from '@microsoft/tsdoc';
import { DocTable } from '../nodes/doc-table';
import { IFoundationBuilders, NextPage, SectionBuilder } from './interfaces';

export const initInterfaceTable = (
  b: IFoundationBuilders,
  output: DocSection,
  next: NextPage
): SectionBuilder<ApiInterface> => {
  return (apiInterface: ApiInterface) => {
    const eventsTable: DocTable = b.table(['Property', 'Type', 'Description']);
    const propertiesTable: DocTable = b.table(['Property', 'Type', 'Description']);
    const methodsTable: DocTable = b.table(['Method', 'Description']);
    for (const apiMember of apiInterface.members) {
      switch (apiMember.kind) {
        case ApiItemKind.ConstructSignature:
        case ApiItemKind.MethodSignature: {
          methodsTable.addRow(b.tableRow([b.titleCell(apiMember), b.descriptionCell(apiMember)]));

          next(apiMember);
          break;
        }

        case ApiItemKind.PropertySignature: {
          if ((apiMember as ApiPropertyItem).isEventProperty) {
            eventsTable.addRow(
              b.tableRow([
                b.titleCell(apiMember),
                b.propertyTypeCell(apiMember, b),
                b.descriptionCell(apiMember)
              ])
            );
          } else {
            propertiesTable.addRow(
              b.tableRow([
                b.titleCell(apiMember),
                b.propertyTypeCell(apiMember, b),
                b.descriptionCell(apiMember)
              ])
            );
          }

          next(apiMember);
          break;
        }
      }
    }

    if (eventsTable.rows.length > 0) {
      output.appendNode(b.heading('Events'));
      output.appendNode(eventsTable);
    }

    if (propertiesTable.rows.length > 0) {
      output.appendNode(b.heading('Properties'));
      output.appendNode(propertiesTable);
    }

    if (methodsTable.rows.length > 0) {
      output.appendNode(b.heading('Methods'));
      output.appendNode(methodsTable);
    }
  };
};
