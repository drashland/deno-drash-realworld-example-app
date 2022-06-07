import { Component, computed, html } from "./deps.ts";
import { deleteComment, user } from "../state.ts";

export interface Comment {
  id: string;
  comment: any;
}
export class Comment extends Component {
  #isCurrentUser = computed(() => {
    if (user.username.value && this.comment.author_username) {
      return this.comment.author_username === user.username.value;
    }
    return false;
  });

  #destroy(id: number | string, commentId: number) {
    deleteComment({
      id,
      commentId,
    });
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
      <span class="date-posted">${this.date(this.comment.created_at)}</span>
      ${
    this.#isCurrentUser.truthy(html`
      <span class="mod-options">
        <i class="ion-trash-a" on:click=${() =>
      this.#destroy(this.id, this.comment.id)}></i>
      </span>
      `)
  }
    </div>
  </div>
    `);
}
