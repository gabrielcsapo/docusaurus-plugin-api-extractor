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
 * @public
 * @modulePath - my-addon/components/stepper
 * @frameworkItemType - Component
 */
export default class Stepper<StepperSignature> {
  args: StepperSignature;
  constructor(args: StepperSignature) {
    this.args = args;
  }
  render() {}
}
