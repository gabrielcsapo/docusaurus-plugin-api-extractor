import remark from 'remark';
import { repairHeritageTypes } from '../dist/markdown/repair-heritage-types';

it('replaces <b> around "Implements" heritage types', () => {
  const out = remark()
    .use(repairHeritageTypes)
    .processSync('<b>Implements:</b> [Bar](./bar.md)').contents;
  expect(out).toMatchSnapshot();
});

it('replaces <b> around "Extends" heritage types', () => {
  const out = remark()
    .use(repairHeritageTypes)
    .processSync('<b>Extends:</b> [Bar](./bar.md)').contents;
  expect(out).toMatchSnapshot();
});

it('replaces <b> around "References" heritage types', () => {
  const out = remark()
    .use(repairHeritageTypes)
    .processSync('<b>References:</b> [Bar](./bar.md)').contents;
  expect(out).toMatchSnapshot();
});

it(`doesn't replace all <b> tags`, () => {
  const out = remark().use(repairHeritageTypes).processSync(`
<b>Bold</b>

# foo

<b>References:</b> [Bar](./bar.md)

Hi <b>Chad</b>!

    `).contents;
  expect(out).toMatchSnapshot();
});
