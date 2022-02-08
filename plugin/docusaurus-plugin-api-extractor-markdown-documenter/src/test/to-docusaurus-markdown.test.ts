import { toDocusaurusMarkDown } from '../markdown/to-docusaurus-markdown';

it('can support union types in a table', () => {
  const incoming = `
  |  Property | Modifiers | Type | Description |
  |  --- | --- | --- | --- |
  |  [myProperty](./myClass.myProperty.md) |  | 'number' \\| 'string' | A property that has a union type. |
  `;

  const processedMarkdown = toDocusaurusMarkDown(incoming, 'myClass');
  expect(processedMarkdown).toMatchSnapshot();
});
