import { Component, html } from "./deps.ts";
export class Footer extends Component {
  override template = this.html(html`
        <footer>
            <div class="container">
            <a class="logo-font" href="/">
                conduit
            </a>
            <span class="attribution">
                An interactive learning project from
                <a rel="noopener noreferrer" target="blank" href="https://thinkster.io"
                >Thinkster</a
                >. Code &amp; design licensed under MIT.
            </span>
            </div>
        </footer>
    `);
}
