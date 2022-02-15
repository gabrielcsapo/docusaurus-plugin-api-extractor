import { ApiModel } from '@microsoft/api-extractor-model';
import { join } from 'path';
import { Documenter } from '../mark/documenter';

it('emits plain strings', () => {
  const model = new ApiModel();
  model.loadPackage(join(__dirname, './fixtures/api-model.custom-types.json'));
  const documenter = new Documenter(model, 'foo');
  expect(documenter.generate()).toMatchSnapshot();
});
