import { Component, html, computed } from "./deps.ts"
import { user, isAuthenticated, toggleArticleFavorite } from "../state.ts"
import { ArticleActions } from "./ArticleActions.ts"

export interface ArticleMeta {
    article: any,
    actions: boolean
}
export class ArticleMeta extends Component {

    connectedCallback() {
        this.actions = this.actions ?? false
    }

    authorUsername = computed(() => {
        if (this.article && this.article.author) {
          return this.article.author.username.value;
        }
    })
  #authorImage = computed(() => {
        if (this.article && this.article.author && this.article.author.image.value) {
          return this.article.author.image.value;
        }
      })
      articleCreatedAt() {
        if (this.article && this.article.created_at.value) {
          return this.date(this.article.created_at.value);
        }
        return Date();
      }
      isCurrentUser() {
        if (
          (user && this.article && this.article.author)
          && user.username.value
          && this.article.author.username.value
        ) {
          return user.username.value === this.article.author.username.value;
        }
        return false;
      }
      toggleFavorite() {
        if (!isAuthenticated) {
            window.location.href = '/login'
        }
        const action = this.article.favorited.value
          ? "unset"
          : "set";
          toggleArticleFavorite( {
          id: this.article.id.value,
          action: action
        });
      }

    override template = this.html(html`
        <div class="article-meta">
            <a
            href=${"/profile/" + this.authorUsername}
            >
                <img src=${this.#authorImage} />
            </a>
            <div class="info">
                <a
                    href=${"/profile/" + this.authorUsername}
                    class="author"
                >
                    ${this.authorUsername}
                </a>
                <span class="date">${this.articleCreatedAt()}</span>
            </div>
            ${computed(() => {
                if (this.article) {
                    return html`
                    <${ArticleActions}
                        prop:article=${this.article}
                        prop:canModify=${this.isCurrentUser()}
                    />
                    `
                }
                return html`<button
                    class=${"btn btn-sm pull-xs-right" + this.article && this.article.favorited.value ? 'btn-primary' : 'btn-outline-primary'}
                    on:click=${() => this.toggleFavorite()}
                    >
                    <i class="ion-heart"></i>
                    <span class="counter"> ${this.article.favoritesCount.value} </span>
                    </button>
                `
            })}
        </div> 
    `)
}