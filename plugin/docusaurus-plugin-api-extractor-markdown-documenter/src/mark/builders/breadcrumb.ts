import { ApiItem, ApiItemKind } from '@microsoft/api-extractor-model';
import { DocSection } from '@microsoft/tsdoc';
import { IFoundationBuilders, SectionBuilder } from './interfaces';
import { getLinkFilenameForApiItem } from './utils';

export const initBreadcrumbSection = (builders: IFoundationBuilders, output: DocSection): SectionBuilder => {
  return (apiItem: ApiItem) => {
    output.appendNodeInParagraph(builders.link('Home', getLinkFilenameForApiItem(builders.apiModel)));

    for (const hierarchyItem of apiItem.getHierarchy()) {
      switch (hierarchyItem.kind) {
        case ApiItemKind.Model:
        case ApiItemKind.EntryPoint:
          // We don't show the model as part of the breadcrumb because it is the root-level container.
          // We don't show the entry point because today API Extractor doesn't support multiple entry points;
          // this may change in the future.
          break;
        default:
          output.appendNodesInParagraph([
            builders.text(' &gte; '),
            builders.link(hierarchyItem.displayName, getLinkFilenameForApiItem(hierarchyItem))
          ]);
      }
    }
  };
};
