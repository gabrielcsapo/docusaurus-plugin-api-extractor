import { ApiItem, ApiReleaseTagMixin, ReleaseTag } from '@microsoft/api-extractor-model';
import { DocSection } from '@microsoft/tsdoc';
import { IFoundationBuilders, SectionBuilder } from './interfaces';

export const initBetaWarning = (b: IFoundationBuilders, output: DocSection): SectionBuilder<ApiItem> => {
  return (apiItem: ApiItem) => {
    if (ApiReleaseTagMixin.isBaseClassOf(apiItem)) {
      if (apiItem.releaseTag === ReleaseTag.Beta) {
        const betaWarning: string =
          'This API is provided as a preview for developers and may change' +
          ' based on feedback that we receive.  Do not use this API in a production environment.';
        b.noteBox([b.text(betaWarning)]);
        output.appendNode(b.noteBox([b.text(betaWarning)]));
      }
    }
  };
};
