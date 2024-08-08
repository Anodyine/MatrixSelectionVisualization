import { LitElement, TemplateResult, css, html } from 'lit'
import { customElement, property, query, queryAll } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('app-element')
export class AppElement extends LitElement {
  /**
   * Copy for the read the docs hint.
   */
  @property()
  docsHint = 'Click on the Vite and Lit logos to learn more'

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
  count = 0;

  @property({ type: String })
  command = '';

  @property({ type: String })
  shape = '(3,4)';

  @property({ type: Boolean })
  shapeIsInvalid = false;

  @property({ type: Array })
  dimensions: Array<number> = [];

  @property({ type: Array })
  selectedButtons: Array<Array<boolean>> = [];
  
  @query(".container")
  container!: HTMLDivElement;

  @queryAll(".selectable")
  selectables!: NodeListOf<HTMLButtonElement>;

  constructor () {
    super();
    this.handleChangeShape();
  }

  render() {
    const rowTemplates: Array<TemplateResult> = [];
    if (this.dimensions[0] && this.dimensions[1]){
      for (let i = 0; i < this.dimensions[0]; i++) {
        const buttonTemplates: Array<TemplateResult> = [];
        for (let j = 0; j < this.dimensions[1]; j++) {
          buttonTemplates.push(html`<div>
            <button class="selectable interactable ${classMap({selected: this.selectedButtons[i][j]})}" 
              @pointerdown=${(event: PointerEvent) => {
                this._onClick(i,j);
                this.onPointerDown(event);
              }}></button>
          </div>`);
        }
        rowTemplates.push(html`<div class="row">${buttonTemplates}</div>`);
      }
    }

    return html`
      <div class="container">
        <div @pointerdown=${this.onPointerDown} class="backdrop"></div>
          <div>
            <label>Array Shape</label>
            <input id="array-shape-input" class="${classMap({invalid: this.shapeIsInvalid})} interactable" .value=${this.shape} type="text" @change=${this._onShapeKeyup} />
          </div>
          <div>
            <label>Select Command</label>
            <input .value=${this.command} type="text" class="interactable" />
          </div>
          <div class="button-container">
          ${rowTemplates}
          </div>
      </div>
    `
  }

  private checkRectIntersection(r1: {x: number, y: number, height: number, width: number}, r2: DOMRect) {    // stackoverflow.com/a/13390495
    return !(r1.x + r1.width  < r2.x ||
             r2.x + r2.width  < r1.x ||
             r1.y + r1.height < r2.y ||
             r2.y + r2.height < r1.y);
  }
  private checkSelected(selectAreaElem: HTMLDivElement) {
    const select = selectAreaElem.getBoundingClientRect();
    const {x, y, height, width} = select;
    for (const selectable of this.selectables) {
      if (this.checkRectIntersection({x: x + window.scrollX, y: y + window.scrollY, height, width}, selectable.getBoundingClientRect())){
        selectable.classList.add("intersected");
      } else {
        selectable.classList.remove("intersected");
      }
    }
  }

  private onPointerDown (event: PointerEvent) {
    // console.log(event)
    event.preventDefault();
    const x = event.pageX;
    const y = event.pageY;

    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.width = "0";
    div.style.height = "0";
    div.style.left = x + "px";
    div.style.top = y + "px";
    div.classList.add("drag-select");
    this.container.append(div);

    const resize = (event: PointerEvent) => {
      const diffX = event.pageX - x;
      const diffY = event.pageY - y;
      div.style.left = diffX < 0 ? x + diffX + "px" : x + "px";
      div.style.top = diffY < 0 ? y + diffY + "px" : y + "px";
      div.style.height = Math.abs(diffY) + "px";
      div.style.width = Math.abs(diffX) + "px";
      // this.selectables.forEach(entry => {
      //   console.log(entry);
      // });
      this.checkSelected(div); // extra line 1
    }
    addEventListener("pointermove", resize);
    addEventListener("pointerup", () => {
      removeEventListener("pointermove", resize);
      div.remove();
     
      this.selectables.forEach(item => {
        if (item.classList.contains("intersected")) {
          item.classList.add("selected");
        }
        item.classList.remove("intersected");
      });  // extra line 2
    });
    event.preventDefault()
  }

  private _onShapeKeyup (event: Event) {
    this.shape = (<HTMLInputElement>event.target!).value;
    
    this.validateShape();
    if (!this.shapeIsInvalid) {
      this.handleChangeShape();
    }
  }

  private handleChangeShape() {
      this.dimensions = this.parseShape();
      this.initButtons(this.dimensions);
  }

  private initButtons(dimensions: number[]) {
    for (let i = 0; i < dimensions[0]; i++) {
      this.selectedButtons[i] = [];
      // for (let j = 0; i < dimensions[1]; j++) {
      //   this.selectedButtons[i][j] = false;
      // }
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

  private _onClick(i: number, j: number) {
    this.selectedButtons[i][j] = !this.selectedButtons[i][j];
    this.requestUpdate();
    // this.count++;
    // console.log(this.command);
    // this.command = (parseInt(this.command) + 1).toString();
  }

  static styles = css`
  .drag-select {
    border: 1px solid orange;
  }
  .intersected {
    background-color: green;
  }
  .backdrop {
    position:absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  .interactable {
    position:relative;
    z-index:100;
  }
    .container {
      position:relative;
      width: 100%;
      height: 100%;
    }
    .button-container {
      place-content: center;
      height: 100%;
    }
    .row {
      display: flex;
      justify-content: center;
    }
    button.selected {
      background-color: yellow;
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

    .logo {
      height: 6em;
      padding: 1.5em;
      will-change: filter;
      transition: filter 300ms;
    }

    .card {
      padding: 2em;
    }

    .read-the-docs {
      color: #888;
    }

    ::slotted(h1) {
      font-size: 3.2em;
      line-height: 1.1;
    }

    a {
      font-weight: 500;
      color: #646cff;
      text-decoration: inherit;
    }
    a:hover {
      color: #535bf2;
    }

    button {
      border-radius: 8px;
      border: 1px solid transparent;
      padding: 0.6em;
      font-size: 1em;
      font-weight: 500;
      font-family: inherit;
      background-color: #1a1a1a;
      cursor: pointer;
      transition: border-color 0.25s;
    }
    button:hover, button.highlighted {
      border-color: #646cff;
    }
    button:focus,
    button:focus-visible {
      outline: 4px auto -webkit-focus-ring-color;
    }

    @media (prefers-color-scheme: light) {
      a:hover {
        color: #747bff;
      }
      button {
        background-color: #f9f9f9;
      }
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'app-element': AppElement
  }
}
