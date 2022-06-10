import { Component, computed, html, TReactiveProperties } from "./deps.ts";
import {
  authUser,
  Comment as TComment,
  deleteComment,
  Eventbus,
} from "../state.ts";

export interface Comment {
  id: string;
  comment: TReactiveProperties<TComment>;
  index: number;
}
export class Comment extends Component {
  #isCurrentUser = computed(() => {
    if (authUser.username.value && this.comment.author_username) {
      return this.comment.author_username.value === authUser.username.value;
    }
    return false;
  });

  async #onDelete(articleId: number, commentId: number) {
    const status = await deleteComment({
      id: articleId,
      commentId,
    });
    console.log(status);
    if (status) {
      Eventbus.emit("comment:deleted", commentId);
    }
  }

  override template = this.html(html`
    <div class="card">
    <div class="card-block">
      <p class="card-text">${this.comment.body}</p>
    </div>
    <div class="card-footer">
      <a href="" class="comment-author">
        <img prop:src=${this.comment.author_image} class="comment-author-img" />
      </a>
      <a
        href=${"/profile/" + this.comment.author_username}
        class="comment-author"
      >
        ${this.comment.author_username}
      </a>
      <span class="date-posted">${
    this.date(this.comment.created_at.value)
  }</span>
      ${
    this.#isCurrentUser.truthy(html`
      <span class="mod-options">
        <i class="ion-trash-a" on:click=${() =>
      this.#onDelete(Number(this.id), this.comment.id.value)}></i>
      </span>
      `)
  }
    </div>
  </div>
    `);
}
