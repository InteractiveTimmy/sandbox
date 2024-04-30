import Component from '../component';

class Class extends Component {
  protected localized: Record<string, HTMLElement> = {};

  public get namespace(): string {
    return Class.CONSTANTS.NAMESPACE;
  }
  
  public connectedCallback(): void {
    console.log('connected callback');

    const shadow = this.attachShadow({ mode: 'open' });

    const firstWrapper = document.createElement('div');
    const secondWrapper = document.createElement('div');

    firstWrapper.setAttribute('id', Class.CONSTANTS.ATTRIBUTES[0]);
    secondWrapper.setAttribute('id', Class.CONSTANTS.ATTRIBUTES[1]);

    shadow.appendChild(Class.style);
    shadow.appendChild(firstWrapper);
    shadow.appendChild(secondWrapper);

    this.localized = {
      firstWrapper,
      secondWrapper,
    };

    this.render();
  }

  public attributeChangedCallback(name?: string, original?: string, current?: string): void {
    console.log(`"${name}" has changed from "${original}" to "${current}"`);

    this.render();
  }

  public get currentAttributes(): Record<string, string> {
    const {ATTRIBUTES} = Class.CONSTANTS;

    return ATTRIBUTES.reduce((results, item) => ({
      ...results,
      [item]: this.getAttribute(item),
    }), {})
  }

  public render() {
    const { first, second } = this.currentAttributes;
    const { firstWrapper, secondWrapper } = this.localized;

    if (firstWrapper) {
      firstWrapper.innerHTML = first;
    }

    if (secondWrapper) {
      secondWrapper.innerHTML = second;
    }
  }

  public static get CONSTANTS() {
    return {
      NAMESPACE: 'custom-component',
      ATTRIBUTES: ['first', 'second'],
      IDS: ['first-wrapper', 'second-wrapper']
    }
  }

  public static get observedAttributes(): Array<string> {
    return this.CONSTANTS.ATTRIBUTES;
  }

  public static get style(): HTMLStyleElement {
    const style = document.createElement('style');

    style.textContent = `
      :host {
        display: block;
        height: 4rem;
        border-radius: 0.5rem;
        padding: 0.5rem;
        background-color: #333;
        color: #fff;
      }
    `;

    return style;
  }
}

export default Class;
