abstract class Class extends HTMLElement {
  public abstract get namespace(): string;

  public static mount(): void {
    const { namespace } = this.prototype;
    const { customElements } = globalThis;

    if (!!customElements.get(namespace)) {
      return;
    }

    customElements.define(namespace, this as unknown as CustomElementConstructor);
  }
}

export default Class;
