import {
  classNames,
  Component,
  computed,
  html,
  reactive,
  ReactiveValue,
  swal,
} from "./deps.ts";
import {
  deleteArticle,
  isAuthenticated,
  profile,
  toggleArticleFavorite,
} from "../state.ts";
export interface ArticleActions {
  article: any;
  canModify: boolean;
}
export class ArticleActions extends Component {
  #canModify = reactive(this.canModify);

  #editArticleLink = computed(() => {
    return `/editor/${this.article.id.value}`;
  });
  #favoriteArticleLabel = computed(() => {
    return this.article.favorited.value
      ? "Unfavorite Article"
      : "Favorite Article";
  });
  #favoriteCounter = computed(() => {
    return `(${this.article.favoritesCount.value ?? 0})`;
  });
  #followUserLabel = computed(() => {
    if (this.article && this.article.author.value) {
      return `${profile.following.value ? "Unfollow" : "Follow"} ${
        this.article.author!.username!.value
      }`;
    }
    return " ";
  });

  #toggleFavoriteButtonClasses() {
    return classNames({
      "btn-primary": this.article.favorited.value === true,
      "btn-outline-primary": !this.article.favorited.value,
      btn: true,
      "btn-sm": true,
    });
  }

  async #deleteArticle() {
    try {
      const result = await deleteArticle({
        article_id: this.article.id.value,
      });
      if (result === true) {
        swal({
          text: "Deleted the article. Going home...",
          timer: 1000,
          buttons: false,
        }).then(() => {
          window.location.href = "/";
        });
      } else {
        swal({
          title: "Oops!",
          text: "Something went wrong whilst trying to delete the article.",
          icon: "error",
        });
        console.error("Failed to delete the article:");
        console.error(result);
      }
    } catch (err) {
      console.error(err);
    }
  }
  #toggleFavorite() {
    if (!isAuthenticated.value) {
      window.location.href = "/login";
      return;
    }

    const action = this.article.favorited.value ? "unset" : "set";
    toggleArticleFavorite({
      id: this.article.id.value,
      action: action,
    });
  }
  #toggleFollow() {
    if (!isAuthenticated.value) {
      window.location.href = "/login";
      return;
    }
  }

  override template = this.html(html`
        <!-- Used when user is also author -->
        ${
    this.#canModify.truthy(
      html`
        <span>
            <a class="btn btn-sm btn-outline-secondary" href=${this.#editArticleLink}>
                <i class="ion-edit"></i> <span> Edit Article</span>
            </a>
            <span>  </span>
            <button class="btn btn-outline-danger btn-sm" on:click=${() =>
        this.#deleteArticle()}>
                <i class="ion-trash-a"></i> <span> Delete Article</span>
            </button>
        </span>
        `,
      html`
        <!-- Used in ArticleView when not author -->
        <span>
            <button class="btn btn-sm btn-outline-secondary" on:click=${() =>
        this.#toggleFollow()}>
                <i class="ion-plus-round" />
                <span>
                  ${this.#followUserLabel.value}
                </span>
            </button>
            <button
              on:click=${() => this.#toggleFavorite()}
              class=${this.#toggleFavoriteButtonClasses()}
            >
              <i class="ion-heart" />
              <span>${this.#favoriteArticleLabel}</span>
              <span class="counter">
                  ${this.#favoriteCounter}
              </span>
            </button>
        </span>
        `,
    )
  }
    `);
}
