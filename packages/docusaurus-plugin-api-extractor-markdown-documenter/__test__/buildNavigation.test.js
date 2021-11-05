/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-unsupported-features/es-syntax */
import { buildNavigation } from '../dist/DocusaurusFeature';
import { join } from 'path';
import { ApiModel } from '@microsoft/api-extractor-model';

const documenter = {
  getLinkForApiItem(apiModel) {
    return apiModel.displayName;
  },
};

it('it produces a tree structure for the sidebar', () => {
  const model = new ApiModel();
  model.loadPackage(join(__dirname, './fixtures/api-model.json'));
  const parentNodes = [];
  buildNavigation(parentNodes, model, documenter);
  expect(parentNodes).toMatchSnapshot();
});
