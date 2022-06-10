import { Component, html } from "../../deps.ts";
import { ArticleList } from "../../ArticleList.ts";

export class MyFeed extends Component {
  override template = this.html(html`
        <div class="home-my-feed">
            <${ArticleList} prop:type=${"feed"} />
        </div>
    `);
}
