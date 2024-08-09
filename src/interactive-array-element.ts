import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";


@customElement('interactive-array-element')
export class InteractiveArrayElement extends LitElement {
  @property({ type: Array })
  indecies: Array<number>; 

  @property({ type: Boolean })
  selected: boolean; 

  @property({ type: Boolean })
  highlighted: boolean; 

  constructor () {
      super();
      this.indecies = [];
      this.selected = false;
      this.highlighted = false;
  }

  render () {
      return html`<div>
          <button class="interactable ${classMap({
              selected: this.selected,
              highlighted: this.highlighted
            })}" 
            @click=${this.onClick}
          ></button>
      </div>`
  }

  private onClick () {
    this.selected = !this.selected;
  }

  static styles = css`
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
    button:hover {
      border-color: #646cff;
    }
    button:focus,
    button:focus-visible {
      outline: 4px auto -webkit-focus-ring-color;
    }

    button.selected {
      background-color: yellow;
    }
    button.highlighted {
      border-color: white;
    }
    .interactable {
      position:relative;
      z-index:100;
    }`
}
