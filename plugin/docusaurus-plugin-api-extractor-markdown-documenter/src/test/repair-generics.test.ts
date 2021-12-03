import remark from 'remark';
import { repairGenerics } from '../markdown/repair-generics';

it('replaces less than and greater than symbols with markers', () => {
  const out = remark().use(repairGenerics).processSync(`
<b>Returns:</b>

Foo<Bar>

`).contents;
  expect(out).toMatchSnapshot();
});

it('replaces less than and greater than symbols with markers with links', () => {
  const out = remark().use(repairGenerics).processSync(`
<b>Returns:</b>

Foo<[Bar]('./bar')>

`).contents;
  expect(out).toMatchSnapshot();
});

it(`doesn't replace all less than and greater than symbols`, () => {
  const out = remark().use(repairGenerics).processSync(`

If I write a thing up here we escape bar<neat>

<b>Returns:</b>

Foo<[Bar]('./bar')>

    `).contents;
  expect(out).toMatchSnapshot();
});
