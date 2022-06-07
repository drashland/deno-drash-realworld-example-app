import { html, Component } from "../../deps.ts"
import { ArticleList } from "../../ArticleList.ts"

export interface Articles {
    username: string
}
export class Articles extends Component {
    override template = this.html(html`
    <div class="profile-page">
    <${ArticleList} prop:author=${this.username} prop:items-per-page=${5} />
  </div>
    `)
}