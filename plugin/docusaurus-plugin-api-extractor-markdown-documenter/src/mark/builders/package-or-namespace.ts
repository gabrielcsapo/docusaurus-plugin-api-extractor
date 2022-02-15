import {
  ApiDocumentedItem,
  ApiItem,
  ApiItemKind,
  ApiNamespace,
  ApiPackage
} from '@microsoft/api-extractor-model';
import { DocSection } from '@microsoft/tsdoc';
import pluralize from 'pluralize';
import { DocTable } from '../nodes/doc-table';
import { DocTableRow } from '../nodes/doc-table-row';
import { IFoundationBuilders, NextPage, SectionBuilder } from './interfaces';
import { extractTitle } from './utils';

export const initPackageOrNamespaceTables = (
  builders: IFoundationBuilders,
  output: DocSection,
  next: NextPage
): SectionBuilder<ApiPackage | ApiNamespace> => {
  return (apiContainer: ApiPackage | ApiNamespace): void => {
    const typeTables: Record<string, DocTable> = {};

    const apiMembers: ReadonlyArray<ApiItem> =
      apiContainer.kind === ApiItemKind.Package
        ? (apiContainer as ApiPackage).entryPoints[0].members
        : (apiContainer as ApiNamespace).members;

    for (const apiMember of apiMembers) {
      const row: DocTableRow = builders.tableRow([
        builders.titleCell(apiMember),
        builders.descriptionCell(apiMember),
        builders.modulePathCell(apiMember)
      ]);

      let title: string = ApiItemKind.Class;

      if (apiMember instanceof ApiDocumentedItem) {
        title = extractTitle(apiMember) ?? apiMember.kind;
      }

      title = pluralize(title);

      typeTables[title] = builders.table([title, 'Description', 'Import Path']);

      typeTables[title].addRow(row);

      next(apiMember);
    }

    Object.entries(typeTables).forEach(([title, table]) => {
      if (table.rows.length > 0) {
        output.appendNode(builders.heading(title));
        output.appendNode(table);
      }
    });
  };
};
