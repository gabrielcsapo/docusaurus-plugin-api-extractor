import { Component } from './component';

/**
 * @public
 * @modulePath my-addon/components/stepper
 * @frameworkItemType - Component Signature
 */
export type StepperSignature = {
  Element: HTMLDivElement;
  Blocks: { default: unknown };
  Arguments: {
    name: string;
    age: number;
  };
};

/**
 * A component that makes a wizard
 *
 * @public
 * @modulePath my-addon/components/stepper
 * @frameworkItemType Component
 */
export default class Stepper extends Component<StepperSignature> {
  foo(): Record<string, unknown> {
    return { thing: 's' };
  }
  render() {}
}
