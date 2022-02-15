import { ApiItemKind, ApiModel } from '@microsoft/api-extractor-model';
import { DocSection } from '@microsoft/tsdoc';
import { DocTable } from '../nodes/doc-table';
import { DocTableRow } from '../nodes/doc-table-row';
import { IFoundationBuilders, NextPage, SectionBuilder } from './interfaces';

export const initModelTable = (
  builders: IFoundationBuilders,
  output: DocSection,
  next: NextPage
): SectionBuilder => {
  return (apiModel: ApiModel): void => {
    const packagesTable: DocTable = builders.table(['Package', 'Description']);

    for (const apiMember of apiModel.members) {
      const row: DocTableRow = builders.tableRow([
        builders.titleCell(apiMember),
        builders.descriptionCell(apiMember)
      ]);

      switch (apiMember.kind) {
        case ApiItemKind.Package:
          packagesTable.addRow(row);
          next(apiMember);
          break;
      }
    }

    if (packagesTable.rows.length > 0) {
      output.appendNode(builders.heading('Packages'));
      output.appendNode(packagesTable);
    }
  };
};
