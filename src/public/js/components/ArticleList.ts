import {
  Component,
  computed,
  html,
  reactive,
  ReactiveValue,
  ReadonlyReactiveValue,
} from "./deps.ts";
import { articles, fetchArticles } from "../state.ts";
import { ArticlePreview } from "./ArticlePreview.ts";
import { Pagination } from "./Pagination.ts";

export interface ArticleList {
  itemsPerPage: number;
  favorited?: boolean;
  tag?: string;
  author?: string;
  type?: string;
}
export class ArticleList extends Component {
  #isLoading = reactive(true);

  #currentPage: ReactiveValue<number> = reactive(1);

  #author: ReactiveValue<string> | ReactiveValue<undefined> = reactive(
    this.author,
  ).bind((value) => {
    this.#resetPagination();
    this.#fetchArticles();
  }, {
    noFirstRun: true,
  });

  itemsPerPage = this.itemsPerPage ?? 10;

  #tag: ReactiveValue<string> | ReactiveValue<undefined> = reactive("");

  #favorited = reactive<boolean>(false);

  #pages = computed(() => {
    if (articles.value.length <= this.itemsPerPage) {
      return [];
    }
    return [
      ...Array(Math.ceil(articles.value.length / this.itemsPerPage)).keys(),
    ].map((e) => e + 1);
  });

  #params: ReadonlyReactiveValue<any>;

  constructor() {
    super();
    // watch
    this.#currentPage = reactive(1).bind((value) => {
      this.#params.value.filters.offset = (value - 1) * this.itemsPerPage;
      this.#fetchArticles();
    }, {
      noFirstRun: true,
    });
    this.#tag = reactive(this.tag).bind(() => {
      this.#resetPagination();
      this.#fetchArticles();
    }, {
      noFirstRun: true,
    });
    this.#favorited = reactive<boolean, unknown>(this.favorited ?? false).bind(
      () => {
        this.#resetPagination();
        this.#fetchArticles();
      },
      {
        noFirstRun: true,
      },
    );

    // Depends on other data
    this.#params = computed(() => {
      const { type } = this;
      const filters: any = {
        offset: (this.#currentPage.value - 1) * this.itemsPerPage,
        limit: this.itemsPerPage,
      };
      if (this.#author.value) {
        filters.author = this.#author.value;
      }
      if (this.#tag.value) {
        filters.tag = this.#tag.value;
      }
      if (this.#favorited.value) {
        filters.favorited = this.#favorited.value;
      }
      return {
        type,
        filters,
      };
    });
  }

  async connectedCallback() {
    this.itemsPerPage = this.itemsPerPage ?? 10;
    await this.#fetchArticles();
  }

  async #fetchArticles() {
    this.#isLoading.value = true;
    await fetchArticles(this.#params.value.filters);
    this.#isLoading.value = false;
  }

  #resetPagination() {
    this.#currentPage.value = 1;
  }

  // TODO :: We're passing pages here, but i dont think its being reactive, its still being sent as [1]
  override template = this.html(html`
        <div>
        ${
    this.#isLoading.truthy(
      html`
            <p class="article-preview">Loading articles...</p>
        `,
      html`
            ${
        computed(() => {
          if (!articles.value.length) {
            return html`
                <p class="article-preview">
                    No articles are here... yet.
                </p>`;
          }
          return html`
                ${
            articles.value.map(article =>
              html`
                <${ArticlePreview}
                    prop:article=${article}
                />
                `
            )
          }
              `;
        })
      }
          
              <${Pagination} prop:pages=${this.#pages} prop:currentPage=${this.#currentPage} />
        `,
    )
  }
        </div>
    `);
}
