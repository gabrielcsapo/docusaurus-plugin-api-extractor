import { generateTmpExtractorConfig } from '../generate-docs';
import fixturify from 'fixturify';
import { readFileSync, rmSync } from 'fs';
import { IConfigFile } from '@microsoft/api-extractor';

beforeEach(() => {
  fixturify.writeSync('fixtures', {});
});

afterEach(() => {
  rmSync('./fixtures', { recursive: true });
});

it('produces an tmp extractor config with changed mainEntryPointFilePath', () => {
  generateTmpExtractorConfig(
    {
      mainEntryPointFilePath: 'some.d.ts'
    } as IConfigFile,
    'foo',
    'foo/index.d.ts',
    './fixtures'
  );

  const modified = JSON.parse(readFileSync('./fixtures/api-extractor.tmp.json', 'utf-8'));
  expect(modified.mainEntryPointFilePath).toBe('foo/index.d.ts');
});

it('produces an tmp extractor config with changed docModel', () => {
  generateTmpExtractorConfig(
    {
      mainEntryPointFilePath: 'some.d.ts',
      docModel: {
        enabled: true,
        apiJsonFilePath: '<projectFolder>/temp/some.api.json'
      }
    } as IConfigFile,
    'foo',
    'foo/index.d.ts',
    './fixtures'
  );

  const modified = JSON.parse(readFileSync('./fixtures/api-extractor.tmp.json', 'utf-8'));
  expect(modified.mainEntryPointFilePath).toBe('foo/index.d.ts');
  expect(modified.docModel.apiJsonFilePath).toBe('<projectFolder>/temp/foo.api.json');
});

it('produces an tmp extractor config with changed dtsRollup', () => {
  generateTmpExtractorConfig(
    {
      mainEntryPointFilePath: 'some.d.ts',
      dtsRollup: {
        enabled: true,
        untrimmedFilePath: '<projectFolder>/dist/some.d.ts'
      },
      docModel: {
        enabled: true,
        apiJsonFilePath: '<projectFolder>/temp/some.api.json'
      }
    } as IConfigFile,
    'foo',
    'foo/index.d.ts',
    './fixtures'
  );

  const modified = JSON.parse(readFileSync('./fixtures/api-extractor.tmp.json', 'utf-8'));
  expect(modified.mainEntryPointFilePath).toBe('foo/index.d.ts');
  expect(modified.docModel.apiJsonFilePath).toBe('<projectFolder>/temp/foo.api.json');
  expect(modified.dtsRollup.untrimmedFilePath).toBe('<projectFolder>/dist/foo.d.ts');
});

it('produces an tmp extractor config with changed apiReport', () => {
  generateTmpExtractorConfig(
    {
      mainEntryPointFilePath: 'some.d.ts',
      apiReport: {
        enabled: true,
        reportFileName: 'some.api.md'
      },
      dtsRollup: {
        enabled: true,
        untrimmedFilePath: '<projectFolder>/dist/some.d.ts'
      },
      docModel: {
        enabled: true,
        apiJsonFilePath: '<projectFolder>/temp/some.api.json'
      }
    } as IConfigFile,
    'foo',
    'foo/index.d.ts',
    './fixtures'
  );

  const modified = JSON.parse(readFileSync('./fixtures/api-extractor.tmp.json', 'utf-8'));
  expect(modified.mainEntryPointFilePath).toBe('foo/index.d.ts');
  expect(modified.docModel.apiJsonFilePath).toBe('<projectFolder>/temp/foo.api.json');
  expect(modified.dtsRollup.untrimmedFilePath).toBe('<projectFolder>/dist/foo.d.ts');
  expect(modified.apiReport.reportFileName).toBe('foo.api.md');
});
