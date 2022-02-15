class Component<T> {
  args: T;
  constructor(args: T) {
    this.args = args;
  }
}
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
export default class Stepper extends Component<StepperSignature> {
  foo(): Record<string, unknown> {
    return { thing: 's' };
  }
  render() {}
}
