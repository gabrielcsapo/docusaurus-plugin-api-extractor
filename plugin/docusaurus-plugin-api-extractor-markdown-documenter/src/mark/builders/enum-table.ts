import { ApiEnum } from '@microsoft/api-extractor-model';
import { DocSection } from '@microsoft/tsdoc';
import { getConciseSignature } from '../file-naming';
import { DocTable } from '../nodes/doc-table';
import { IFoundationBuilders, SectionBuilder } from './interfaces';

export const initEnumTable = (b: IFoundationBuilders, output: DocSection): SectionBuilder<ApiEnum> => {
  return (apiEnum: ApiEnum) => {
    const enumMembersTable: DocTable = b.table(['Member', 'Value', 'Description']);

    for (const apiEnumMember of apiEnum.members) {
      enumMembersTable.addRow(
        b.tableRow([
          b.tableCell([b.paragraph([b.text(getConciseSignature(apiEnumMember))])]),
          b.tableCell([b.paragraph([b.codeSpan(apiEnumMember.initializerExcerpt.text)])]),
          b.descriptionCell(apiEnumMember)
        ])
      );
    }

    if (enumMembersTable.rows.length > 0) {
      output.appendNode(b.heading('Enumeration Members'));
      output.appendNode(enumMembersTable);
    }
  };
};
