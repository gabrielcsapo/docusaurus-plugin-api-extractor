import { IConfigFile } from '@microsoft/api-extractor';
import path from 'path';
import { getPluginOptions } from '../plugin';

it('minimal defaults', async () => {
  const merged = await getPluginOptions('baz', 'site', { outDir: 'foo' }, { id: '1' }, {
    mainEntryPointFilePath: 'baz.d.ts'
  } as IConfigFile);

  expect(merged.ci).toBe(false);
  expect(merged.verbose).toBe(false);
  expect(merged.docsRoot).toBe('docs');
  expect(merged.siteDir).toBe('site');
  expect(merged.entryPoints).toMatchObject({
    baz: 'baz.d.ts'
  });
  const isResolved = merged.outDir.endsWith(`site${path.sep}docs${path.sep}foo`);
  expect(isResolved).toBe(true);
  expect(merged.sidebarConfig).toMatchObject({
    label: 'API'
  });
});

it('merges cli args', async () => {
  const merged = await getPluginOptions(
    'baz',
    'site',
    { outDir: 'foo', verbose: true, ci: true },
    { id: '1' },
    {
      mainEntryPointFilePath: 'baz.d.ts'
    } as IConfigFile
  );

  expect(merged.ci).toBe(true);
  expect(merged.verbose).toBe(true);
  expect(merged.docsRoot).toBe('docs');
  expect(merged.siteDir).toBe('site');
  expect(merged.entryPoints).toMatchObject({
    baz: 'baz.d.ts'
  });
  const isResolved = merged.outDir.endsWith(`site${path.sep}docs${path.sep}foo`);
  expect(isResolved).toBe(true);
  expect(merged.sidebarConfig).toMatchObject({
    label: 'API'
  });
});

it('merges plugin config', async () => {
  const merged = await getPluginOptions(
    'baz',
    'site',
    { outDir: 'foo', verbose: true, ci: true },
    { id: '1', siteDir: 'my-site' },
    {
      mainEntryPointFilePath: 'baz.d.ts'
    } as IConfigFile
  );

  expect(merged.ci).toBe(true);
  expect(merged.verbose).toBe(true);
  expect(merged.docsRoot).toBe('docs');
  expect(merged.siteDir).toBe('my-site');
  expect(merged.entryPoints).toMatchObject({
    baz: 'baz.d.ts'
  });
  const isResolved = merged.outDir.endsWith(`my-site${path.sep}docs${path.sep}foo`);
  expect(isResolved).toBe(true);
  expect(merged.sidebarConfig).toMatchObject({
    label: 'API'
  });
});
