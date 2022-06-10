import { Component, css, html, reactive, ReactiveArray } from "./deps.ts";

/**
 * Taken from https://github.com/RevillWeb/rebel-tag-input/blob/master/lib/rebel-tag-input.js
 * and adapted to TS and destiny
 */

export interface TagInput {
  tags: ReactiveArray<string>;
  class?: string;
  placeholder?: string;
}
export class TagInput extends Component {
  tags = this.tags ?? reactive([]);

  static styles = css`
    .rebel-tag-input {
        font-family: 'Helvetica Neue', 'Lucida Grande', sans-serif;
        max-width: 100%;
        display: flex;
        align-content: flex-start;
        flex-wrap: wrap;
        background-color: #FFF;
        border: solid 1px #CCC;
        border-radius: 2px;
        min-height: 33px;
        padding: 0 5px;
    }
    #tag-input {
        flex-grow: 1;
        display: inline-block;
        order: 200;
        border: none;
        height: 33px;
        line-height: 33px;
        font-size: 14px;
        margin: 0;
    }
    #tag-input:focus {
        outline: none;
    }
    .rebel-tag-input div.tag {
        display: inline-block;
        flex-grow: 0;
        margin: 5px 5px 5px 0;
        padding: 0 10px;
        height: 25px;
        line-height: 25px;
        background-color: #E1E1E1;
        color: #333;
        font-size: 14px;
        order: 100;
        border-radius: 2px;
        position: relative;
        overflow: hidden;
    }
    .rebel-tag-input div.tag.duplicate {
        background-color: rgba(255, 64, 27, 0.71);
        transition: all 0.3s linear;
    }
    .rebel-tag-input div.tag:last-child {
        margin-right: 5px;
    }
    .rebel-tag-input div.tag .remove {
        display: inline-block;
        background-color: rgba(255, 64, 27, 0.71);
        color: #FFF;
        position: absolute;
        right: -20px;
        width: 20px;
        text-align: center;
        border-top-right-radius: 2px;
        border-bottom-right-radius: 2px;
        transition: all 0.3s ease;
        cursor: pointer;
    }
    .rebel-tag-input div.tag:hover .remove {
        right: 0;
    }`;

  #value = reactive("");

  addTag() {
    const tag = this.#value.value;
    if (!tag.length) {
      return;
    }
    if (!this.tags.value.includes(tag)) {
      this.tags.push(tag);
      this.#value.value = "";
      this.render();
      return;
    }
    const $element = this.shadowRoot!.querySelector(
      '[data-index="' + this.tags.indexOf(tag) + '"]',
    );
    if ($element) {
      $element.className = $element.className + " duplicate";
      setTimeout(function () {
        $element.className = $element.className.replace("duplicate", "");
      }, 500);
    }
  }

  empty() {
    this.clear();
    this.tags.value = [];
  }
  deleteTag(index: number) {
    const newTags: string[] = [];
    this.tags.forEach((tag, idx) => {
      if (idx !== index) {
        newTags.push(tag);
      }
    });
    this.tags.value = newTags;
    this.render();
  }

  render() {
    this.clear();
    this.tags.forEach((tag, idx) => {
      const $tag = document.createElement("div");
      $tag.className = "tag";
      const $remove = document.createElement("div");
      $remove.className = "remove";
      $remove.innerHTML = "x";
      $remove.addEventListener("click", () => {
        this.deleteTag(idx);
      });
      $tag.dataset.index = idx.toString();
      $tag.innerHTML = tag;
      $tag.appendChild($remove);
      this.shadowRoot!.querySelector(".rebel-tag-input")!.appendChild($tag);
    });
  }

  clear() {
    for (const elem of this.shadowRoot!.querySelectorAll(".tag") ?? []) {
      this.shadowRoot!.querySelector(".rebel-tag-input")!.removeChild(
        elem,
      );
    }
  }

  #allowDelete = false;

  #onKeydown(event: KeyboardEvent) {
    const tag = this.#value.value;
    if (event.keyCode === 13) {
      this.addTag();
    } else if (event.keyCode === 188) {
      event.preventDefault();
      this.addTag();
    } else if (event.keyCode === 8 && tag.length === 0) {
      if (this.#allowDelete) {
        this.deleteTag(this.tags.length.value - 1);
        this.#allowDelete = false;
      } else {
        this.#allowDelete = true;
      }
    }
  }

  override template = this.html(html`
        <div class="rebel-tag-input">
            <input class=${
    "form-control " + this.class ?? ""
  } type="text" placeholder=${
    this.placeholder ?? "Tags..."
  } id="tag-input" on:keydown=${(e: KeyboardEvent) =>
    this.#onKeydown(e)} prop:value=${this.#value} />
            ${
    this.tags.map((tag, i) =>
      html`
                <div class="tag" data-index=${i}>
                    ${tag}
                    <div class="remove" on:click=${() =>
        this.deleteTag(i.value)}>
                        x
                    </div>
                </div>
            `
    )
  }
        </div>
    `);
}
