import { Component, html } from "./deps.ts"

export class NotFound extends Component {
    override template = this.html(html`
        <div class="text-xs-center">
            <p>Page Not Found</p>
        </div>
    `)
}