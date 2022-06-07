import { Component, html } from "./deps.ts";

export interface Tag {
  name: string;
  className: string;
}
export class Tag extends Component {
  connectedCallback() {
    this.className = this.className ?? "tag-pill tag-default";
  }
  override template = this.html(html`
        <a href=${"/tag/" + this.name} class=${this.className}>
            ${this.name}
        </a>
    `);
}
