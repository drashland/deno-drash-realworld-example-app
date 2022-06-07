import { Component, html, reactive } from "./deps.ts"
import { createArticleComment } from "../state.ts"
import { ListErrors} from "./ListErrors.ts"

export interface CommentEditor {
    id: string,
    content?: string
    userImage?: string
}
export class CommentEditor  extends Component {

    #comment = reactive(this.content || null)

    #errors = reactive<any>([]);

    async #onSubmit() {
      const comment = this.#comment.value ?? ''
      const id = Number(this.id)
        const res = await createArticleComment({
            id,
            comment
        });
        if (res.errors) {
            this.#errors.value = res.errors
            return;
        }
        this.#comment.value = ""
        this.#errors.value = []
      }

    override template = this.html(html`
    <div>
    <${ListErrors} prop:errors=${this.#errors.value} />
    <form class="card comment-form">
      <div class="card-block">
        <textarea
          class="form-control"
          prop:value=${this.#comment}
          placeholder="Write a comment..."
          rows="3"
        >
        </textarea>
      </div>
      <div class="card-footer">
        <img prop:src=${this.userImage} class="comment-author-img" />
        <button type="button" on:click=${() => this.#onSubmit()} class="btn btn-sm btn-primary">Post Comment</button>
      </div>
    </form>
  </div>
    `)
}