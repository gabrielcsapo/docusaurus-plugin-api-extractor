import { ApiModel } from '@microsoft/api-extractor-model';
import { DocSection, TSDocConfiguration } from '@microsoft/tsdoc';
import { NextPage } from './interfaces';
import { PrimitiveBuilders } from './primitive-builders';
import { SectionBuilders } from './section-builders';

export type Body = (builders: SectionBuilders) => void;

export type BodyBuilder = (body: Body) => DocSection;

export function createPageBuilder(
  configuration: TSDocConfiguration,
  outputFolder: string,
  apiModel: ApiModel,
  next: NextPage
): BodyBuilder {
  return (body: Body): DocSection => {
    const section: DocSection = new DocSection({ configuration });
    const primitiveBuilders: PrimitiveBuilders = new PrimitiveBuilders(configuration, apiModel);
    const sectionBuilders: SectionBuilders = new SectionBuilders(
      primitiveBuilders,
      section,
      apiModel,
      outputFolder,
      next
    );

    body(sectionBuilders);
    return section;
  };
}
