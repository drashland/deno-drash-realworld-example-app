import { Component, html } from "../../deps.ts";
import { ArticleList } from "../../ArticleList.ts";

export interface Favorited {
  username: string;
}
export class Favorited extends Component {
  override template = this.html(html`
    <div class="profile-page">
        <${ArticleList} prop:favorited=${this.username} prop:items-per-page=${5} />
    </div>
    `);
}
