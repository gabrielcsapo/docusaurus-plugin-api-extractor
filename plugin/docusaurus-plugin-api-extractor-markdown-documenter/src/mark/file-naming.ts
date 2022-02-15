import { ApiItem, ApiParameterListMixin } from '@microsoft/api-extractor-model';

const BAD_FILE_NAME_CHARS: RegExp = /[^a-z0-9_\-\.]/gi;
const INVALID_NAME_CHARS: RegExp = /[^A-Za-z0-9\-_\.]/;

export function getSafeFilenameForName(name: string): string {
  return name.replace(BAD_FILE_NAME_CHARS, '_').toLowerCase();
}

export function getConciseSignature(apiItem: ApiItem): string {
  if (ApiParameterListMixin.isBaseClassOf(apiItem)) {
    return apiItem.displayName + '(' + apiItem.parameters.map((x) => x.name).join(', ') + ')';
  }
  return apiItem.displayName;
}

interface IParsedNamed {
  scope: string;
  unscopedName: string;
}

export function getParsedName(packageName: string): IParsedNamed {
  const parsedName: IParsedNamed = {
    scope: '',
    unscopedName: ''
  };

  let input: string = packageName;

  if (input === null || input === undefined) {
    throw new Error('The package name must not be null or undefined');
  }
  // Rule from npmjs.com:
  // "The name must be less than or equal to 214 characters. This includes the scope for scoped packages."
  if (packageName.length > 214) {
    throw new Error('The package name cannot be longer than 214 characters');
  }

  if (input[0] === '@') {
    const indexOfScopeSlash: number = input.indexOf('/');
    if (indexOfScopeSlash <= 0) {
      throw new Error(`Error parsing "${packageName}": The scope must be followed by a slash`);
    }
    parsedName.scope = input.substring(0, indexOfScopeSlash);
    input = input.substring(indexOfScopeSlash + 1);
  }

  parsedName.unscopedName = input;

  if (parsedName.scope === '@') {
    throw new Error(`Error parsing "${packageName}": The scope name cannot be empty`);
  }

  if (parsedName.unscopedName === '') {
    throw new Error(`The package name cannot be empty`);
  }

  if (parsedName.unscopedName[0] === '.' || parsedName.unscopedName[0] === '_') {
    throw new Error(`The package name "${packageName}" starts with an invalid character`);
  }

  const nameWithoutScopeSymbols: string =
    (parsedName.scope ? parsedName.scope.slice(1, -1) : '') + parsedName.unscopedName;

  const match: RegExpMatchArray | null = nameWithoutScopeSymbols.match(INVALID_NAME_CHARS);

  if (match) {
    throw new Error(`The package name "${packageName}" contains an invalid character: "${match[0]}"`);
  }

  return parsedName;
}
