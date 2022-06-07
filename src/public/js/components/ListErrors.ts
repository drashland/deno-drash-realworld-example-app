import { Component, html } from "./deps.ts"

export interface ListErrors {
    errors?: {
        [key: string]: string[]
    }
}
export class ListErrors extends Component {
    override template = this.html(html`
    <ul class="error-messages">
    ${Object.entries(this.errors ?? {}).map(([key, value]) => html`
    <li>
      <span>${key}</span>
        ${value.map(err => html`
        <span>${err}</span>
        `)}
      </li>
    `)}
  </ul>
    `)
}