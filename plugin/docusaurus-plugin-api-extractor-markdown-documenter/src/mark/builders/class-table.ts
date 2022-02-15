import { ApiClass, ApiItemKind, ApiPropertyItem } from '@microsoft/api-extractor-model';
import { DocSection } from '@microsoft/tsdoc';
import { DocTable } from '../nodes/doc-table';
import { IFoundationBuilders, NextPage, SectionBuilder } from './interfaces';

export const initClassTableSection = (
  b: IFoundationBuilders,
  output: DocSection,
  next: NextPage
): SectionBuilder<ApiClass> => {
  return (apiClass: ApiClass) => {
    const eventsTable: DocTable = b.table(['Property', 'Modifiers', 'Type', 'Description']);

    const constructorsTable: DocTable = b.table(['Constructor', 'Modifiers', 'Description']);

    const propertiesTable: DocTable = b.table(['Property', 'Modifiers', 'Type', 'Description']);

    const methodsTable: DocTable = b.table(['Method', 'Modifiers', 'Description']);

    for (const apiMember of apiClass.members) {
      switch (apiMember.kind) {
        case ApiItemKind.Constructor: {
          constructorsTable.addRow(
            b.tableRow([b.titleCell(apiMember), b.modiferCell(apiMember), b.descriptionCell(apiMember)])
          );

          next(apiMember);
          break;
        }
        case ApiItemKind.Method: {
          methodsTable.addRow(
            b.tableRow([b.titleCell(apiMember), b.modiferCell(apiMember), b.descriptionCell(apiMember)])
          );

          next(apiMember);
          break;
        }
        case ApiItemKind.Property: {
          if ((apiMember as ApiPropertyItem).isEventProperty) {
            eventsTable.addRow(
              b.tableRow([
                b.titleCell(apiMember),
                b.modiferCell(apiMember),
                b.propertyTypeCell(apiMember, b),
                b.descriptionCell(apiMember)
              ])
            );
          } else {
            propertiesTable.addRow(
              b.tableRow([
                b.titleCell(apiMember),
                b.modiferCell(apiMember),
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

    if (constructorsTable.rows.length > 0) {
      output.appendNode(b.heading('Constructors'));
      output.appendNode(constructorsTable);
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
