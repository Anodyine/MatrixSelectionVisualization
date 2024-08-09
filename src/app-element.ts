import { LitElement, PropertyValues, TemplateResult, css, html } from 'lit'
import { customElement, property, query, queryAll } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { HighlightService } from './drag-highlight-event-service';
import { InteractiveArrayElement } from './interactive-array-element';

@customElement('app-element')
export class AppElement extends LitElement {

  @property({ type: String })
  command = '';

  @property({ type: String })
  shape = '(3,4)';

  @property({ type: Boolean })
  shapeIsInvalid = false;

  @property({ type: Array })
  dimensions: Array<number> = [];

  @query(".button-container")
  container!: HTMLDivElement;

  @queryAll("interactive-array-element")
  interactiveArrayElements!: NodeListOf<InteractiveArrayElement>;

  highlightService: HighlightService | undefined;

  constructor () {
    super();
    this.dimensions = this.parseShape();
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    this.highlightService = new HighlightService(this);
  }

  render() {
    const rowTemplates: Array<TemplateResult> = [];
    if (this.dimensions[0] && this.dimensions[1]){
      for (let i = 0; i < this.dimensions[0]; i++) {
        const buttonTemplates: Array<TemplateResult> = [];
        for (let j = 0; j < this.dimensions[1]; j++) {
          buttonTemplates.push(html`<interactive-array-element .indecies="${[i, j]}">
            </interactive-array-element>`);
        }
        rowTemplates.push(html`<div class="row">${buttonTemplates}</div>`);
      }
    }

    return html`
      <div class="container">
          <div>
            <label>Array Shape</label>
            <input type="text" 
              id="array-shape-input" 
              class="${classMap({invalid: this.shapeIsInvalid})}" 
              .value=${this.shape} 
              @change=${this.onShapeKeyup} />
          </div>
          <div>
            <label>Select Command</label>
            <input .value=${this.command} type="text" />
          </div>
          <div class="button-container">
            ${rowTemplates}
          </div>
      </div>
    `
  }

  private onShapeKeyup (event: Event) {
    this.shape = (<HTMLInputElement>event.target!).value;
    
    this.validateShape();
    if (!this.shapeIsInvalid) {
      this.dimensions = this.parseShape();
    }
  }

  private validateShape() {
    const pattern = /[(][\d]+(?:,\s*?[\d]+)+[)]/;

    const match = this.shape.match(pattern);
    if (match) {
      this.shapeIsInvalid = false;
    } else {
      this.shapeIsInvalid = true;
    }
  }

  private parseShape(): Array<number> {
    const matchArray = this.shape.match(/(?<=\(|,|\s)[\d]+(?=\(|,|\s|\))/g);
    return matchArray
      ? matchArray.map((match: string) => {
        return parseInt(match);
      })
      : [];
  }

  static styles = css`
    .container {
      position:relative;
      width: 100%;
      height: 100%;
    }
    .button-container {
      position:relative;
      place-content: center;
      height: 100%;
    }
    .row {
      display: flex;
      justify-content: center;
    }
    input.invalid {
      border: 1px solid red;
    }
    input:focus-visible, select:focus-visible, textarea:focus-visible {
      outline: none !important; /* no focus rings on form controls */
    }
    :host {
      margin: 0 auto;
      text-align: center;
    }
  `
}
