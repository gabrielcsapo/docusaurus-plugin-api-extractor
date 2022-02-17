import { ApiItem } from '@microsoft/api-extractor-model';
import { DocNode, DocSection, TSDocConfiguration } from '@microsoft/tsdoc';
import { IDocumenterDelegate, IInternalDocumenterDelegate } from '../interfaces';
import { NextPage } from '../interfaces';
import { PrimitiveBuilders } from './primitive-builders';
import { SectionBuilders } from './section-builders';

export type PageBuilder = (apiItem: ApiItem) => DocSection;

export function createPage(
  configuration: TSDocConfiguration,
  delegate: IInternalDocumenterDelegate,
  next: NextPage
): PageBuilder {
  return (apiItem: ApiItem): DocSection => {
    const section: DocSection = new DocSection({ configuration });
    const primitiveBuilders: PrimitiveBuilders = new PrimitiveBuilders(configuration, delegate.apiModel);
    const sectionBuilders: SectionBuilders = new SectionBuilders(
      primitiveBuilders,
      section,
      delegate,
      apiItem,
      next
    );

    delegate.writePage({
      currentPage: section,
      apiItem,
      tsDocConfiguration: configuration,
      append(docNode: DocNode): void {
        section.appendNode(docNode);
      },
      next(apiItem: ApiItem) {
        next(apiItem);
      },
      primitives: primitiveBuilders,
      sections: sectionBuilders
    });

    return section;
  };
}
