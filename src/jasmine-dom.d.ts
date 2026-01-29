/// <reference types="jasmine" />

declare module '@testing-library/jasmine-dom/dist' {
  const JasmineDOM: jasmine.CustomMatcherFactories;
  export default JasmineDOM;
}

declare namespace jasmine {
  interface Matchers<T> {
    toBeInTheDocument(): boolean;
    toBeVisible(): boolean;
    toBeEmptyDOMElement(): boolean;
    toBeDisabled(): boolean;
    toBeEnabled(): boolean;
    toBeInvalid(): boolean;
    toBeRequired(): boolean;
    toBeValid(): boolean;
    toBeChecked(): boolean;
    toBePartiallyChecked(): boolean;
    toHaveFocus(): boolean;
    toContainElement(element: HTMLElement | null): boolean;
    toContainHTML(html: string): boolean;
    toHaveAttribute(attr: string, value?: string): boolean;
    toHaveClassName(className: string): boolean;
    toHaveTextContent(text: string | RegExp): boolean;
    toHaveValue(value: string | string[] | number | null): boolean;
    toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): boolean;
    toHaveFormValues(values: Record<string, unknown>): boolean;
    toHaveStyle(css: string | Record<string, unknown>): boolean;
    toHaveDescription(text?: string | RegExp): boolean;
  }
}
