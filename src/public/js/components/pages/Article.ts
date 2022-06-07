import { Component, computed, html, marked, reactive, Ref } from "../deps.ts";
import {
  article,
  comments,
  fetchArticle,
  fetchArticleComments,
  isAuthenticated,
  user,
} from "../../state.ts";
import { ArticleMeta } from "../ArticleMeta.ts";
import { Tag } from "../Tag.ts";
import { CommentEditor } from "../CommentEditor.ts";
import { Comment } from "../Comment.ts";

export interface Article {
  pathParams: {
    id: number;
  };
}
export class Article extends Component {
  #id = Number(this.pathParams.id);

  #loading = reactive(true);

  connectedCallback() {
    Promise.all([
      fetchArticle(this.#id),
      fetchArticleComments(this.#id),
    ]).then(() => {
      this.#loading.value = false;
      this.shadowRoot!.querySelector("#markdown")!.innerHTML = marked.parse(
        article.body.value,
      );
    });
  }

  override template = computed(() => {
    if (this.#loading.value) {
      return this.html(html`
          <p class="article-page">Loading article...</p>
        `);
    }
    return this.html(html`
      <div class="article-page">
      <div class="banner">
        <div class="container">
          <h1>${article.title.value}</h1>
          <${ArticleMeta} prop:article=${article} prop:actions=${true} />
        </div>
      </div>
      <div class="container page">
        <div class="row article-content">
          <div class="col-xs-12">
            <div id="markdown"></div>
            <ul class="tag-list">
            ${
      article.tags.map((tag: string) =>
        html`
            <li>
                <${Tag}
                  prop:name=${tag}
                  className="tag-default tag-pill tag-outline"
                />
              </li>
              `
      )
    }
            </ul>
          </div>
        </div>
        <hr />
        <div class="article-actions">
          <${ArticleMeta} prop:article=${article} prop:actions=${true} />
        </div>
        <div class="row">
          <div class="col-xs-12 col-md-8 offset-md-2">
          ${
      isAuthenticated.truthy(
        html`  
              <${CommentEditor}
              prop:id=${this.#id}
              prop:userImage=${user.image.value}
            />
          `,
        html`
            <p>
              <a href="/login">Sign in</a>
              or
              <a href="/register">sign up</a>
              to add comments on this article.
            </p>`,
      )
    }
            ${
      comments.map((comment) =>
        html`
            <${Comment}
              prop:id=${this.#id}
              prop:comment=${comment}
            />
            
          `
      )
    }
          </div>
        </div>
      </div>
    </div>
    `);
  });
}
