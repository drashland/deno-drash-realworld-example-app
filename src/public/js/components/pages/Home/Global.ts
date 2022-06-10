import { Component, html } from "../../deps.ts";
import { ArticleList } from "../../ArticleList.ts";

export class Global extends Component {
  override template = this.html(html`
    <div class="home-global">
      <${ArticleList} prop:type="all" />
    </div>
  `);
}
