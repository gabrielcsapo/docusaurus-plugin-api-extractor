import { DocLinkTag, TSDocConfiguration } from '@microsoft/tsdoc';
import { LinkBuilder } from './interfaces';

export const initLink =
  (configuration: TSDocConfiguration): LinkBuilder =>
  (linkText: string, destination: string) =>
    new DocLinkTag({
      configuration,
      tagName: '@link',
      linkText,
      urlDestination: destination
    });
