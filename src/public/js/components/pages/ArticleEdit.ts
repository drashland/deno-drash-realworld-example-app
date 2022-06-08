import { Component, computed, html, reactive, ReactiveValue, swal, TReactiveProperties } from "../deps.ts";
import { ListErrors } from "../ListErrors.ts";
import { TagInput } from "../TagInput.ts";
import {
  article,
  createArticle,
  fetchArticle,
  setArticle,
  setTags,
  unsetArticle,
  updateArticle,
  Article
} from "../../state.ts";

export interface ArticleEdit {
  pathParams: {
    id?: number;
  };
}
export class ArticleEdit extends Component {
  #article: TReactiveProperties<Article> = Object.create(article);

  #new = window.location.search.includes("new=true");

  #loading = reactive(this.#new === false);

  #publishing_article = reactive(false);

  #errors = reactive<{
    [key: string]: string[];
  }>({});

  connectedCallback() {
    if (this.#new) {
      unsetArticle();
      setTags([]);
    }
    if (this.pathParams.id) {
      fetchArticle(Number(this.pathParams.id)).then(() => {
        this.#article = reactive(article);
        this.#loading.value = false;
      });
    }
  }

  async #onPublish(id: ReactiveValue<number>) {
    // If the article has a id, then it already exists in the database; and
    // that means we're updating the article--not creating a new one.
    swal({
      text: "Please wait...",
      buttons: false,
    });
    this.#publishing_article.value = true;
    const response = id && id.value
      ? await updateArticle(this.#article)
      : await createArticle(this.#article);
    swal.close();
    this.#publishing_article.value = false;
    unsetArticle();
    if (response.article) {
      setArticle(response.article);
      return window.location.href = `/articles/${response.article.id}`;
    }
    let error = "";
    for (const key in response.errors) {
      error += `${response.errors[key]} `;
    }
    swal({
      title: "Oops!",
      text: error,
      icon: "error",
    });
  }

  override template = computed(() => {
    if (this.#loading.value) {
      return this.html(html`
          <p class="article-page">Loading...</p>
        `);
    }
    return this.html(html`
    <div class="editor-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-10 offset-md-1 col-xs-12">
          <${ListErrors} prop:errors=${this.#errors.value} />
          <form>
            <fieldset prop:disabled=${this.#publishing_article.value === true}>
              <fieldset class="form-group">
                <input
                  type="text"
                  class="form-control"
                  prop:value=${this.#article.title}
                  placeholder="Article Title"
                />
              </fieldset>
              <fieldset class="form-group">
                <input
                  type="text"
                  class="form-control"
                  prop:value=${this.#article.description}
                  placeholder="What's this article about?"
                />
              </fieldset>
              <fieldset class="form-group">
                <textarea
                  class="form-control"
                  rows="8"
                  prop:value=${this.#article.body}
                  placeholder="Write your article (in markdown)"
                >
                </textarea>
              </fieldset>
              <fieldset class="form-group">
                <${TagInput} prop:tags=${this.#article.tags} />
              </fieldset>
            </fieldset>
            <button
              prop:disabled=${this.#publishing_article.value === true}
              class="btn btn-lg pull-xs-right btn-primary"
              type="button"
              on:click=${() => this.#onPublish(this.#article.id)}
            >
              Publish Article
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
    `);
  });
}
