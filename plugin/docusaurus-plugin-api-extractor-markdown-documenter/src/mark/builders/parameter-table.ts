import {
  ApiDocumentedItem,
  ApiParameterListMixin,
  ApiReturnTypeMixin,
  Excerpt
} from '@microsoft/api-extractor-model';
import { DocSection } from '@microsoft/tsdoc';
import { DocTable } from '../nodes/doc-table';
import { IFoundationBuilders, SectionBuilder } from './interfaces';
import { appendSection } from './utils';

export const initParameterTable = (
  b: IFoundationBuilders,
  output: DocSection
): SectionBuilder<ApiParameterListMixin> => {
  return (apiParameterListMixin: ApiParameterListMixin) => {
    const parametersTable: DocTable = b.table(['Parameter', 'Type', 'Description']);
    for (const apiParameter of apiParameterListMixin.parameters) {
      const parameterDescription: DocSection = b.section();
      if (apiParameter.tsdocParamBlock) {
        appendSection(parameterDescription, apiParameter.tsdocParamBlock.content);
      }

      parametersTable.addRow(
        b.tableRow([
          b.tableCell([b.paragraph([b.text(apiParameter.name)])]),
          b.tableCell([b.excerpt(apiParameter.parameterTypeExcerpt)]),
          b.tableCell([...parameterDescription.nodes])
        ])
      );
    }

    if (parametersTable.rows.length > 0) {
      output.appendNode(b.heading('Parameters'));
      output.appendNode(parametersTable);
    }

    if (ApiReturnTypeMixin.isBaseClassOf(apiParameterListMixin)) {
      const returnTypeExcerpt: Excerpt = apiParameterListMixin.returnTypeExcerpt;
      output.appendNode(b.paragraph([b.emphasis({ bold: true }, [b.text('Returns:')])]));

      output.appendNode(b.excerpt(returnTypeExcerpt));
      if (apiParameterListMixin instanceof ApiDocumentedItem) {
        if (apiParameterListMixin.tsdocComment && apiParameterListMixin.tsdocComment.returnsBlock) {
          appendSection(output, apiParameterListMixin.tsdocComment.returnsBlock.content);
        }
      }
    }
  };
};
