import { Component, html, TReactiveProperties } from "./deps.ts";
import { ArticleMeta } from "./ArticleMeta.ts";
import { TagList } from "./TagList.ts";
import { Article } from "../state.ts";

export interface ArticlePreview {
  article: TReactiveProperties<Article>;
}
export class ArticlePreview extends Component {
  override template = this.html(html`
        <div class="article-preview">
            <${ArticleMeta} prop:article=${this.article} />
            <a href=${"/articles/" + this.article.id} class="preview-link">
            <h1>${this.article.title}</h1>
            <p>${this.article.description}</p>
            <span>Read more...</span>
            <${TagList} prop:tags=${this.article.tags} />
            </a>
        </div>
    `);
}
