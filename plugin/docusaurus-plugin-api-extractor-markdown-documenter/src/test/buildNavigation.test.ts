import { buildNavigation } from '../DocusaurusFeature';
import { join } from 'path';
import { ApiItem, ApiModel } from '@microsoft/api-extractor-model';
import type { MarkdownDocumenterAccessor } from '@microsoft/api-documenter';

const documenter = {
  getLinkForApiItem(apiModel: ApiItem) {
    return apiModel.displayName;
  }
} as MarkdownDocumenterAccessor;

it('it produces a tree structure for the sidebar', () => {
  const model = new ApiModel();
  model.loadPackage(join(__dirname, './fixtures/api-model.json'));
  const parentNodes: unknown[] = [];
  buildNavigation(parentNodes, model, documenter);
  expect(parentNodes).toMatchSnapshot();
});
