import { TSDocConfiguration } from '@microsoft/tsdoc';
import { DocHeading } from '../nodes/doc-heading';
import { HeadingBuilder } from './interfaces';

export const initHeading = (configuration: TSDocConfiguration): HeadingBuilder => {
  return (heading: string) => new DocHeading({ configuration, title: heading });
};
