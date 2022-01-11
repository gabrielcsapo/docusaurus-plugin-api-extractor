// Polyfill for String.prototype.replaceAll
export const replaceAll = (str: string, find: string, replacement: string): string =>
  str.split(find).join(replacement);
