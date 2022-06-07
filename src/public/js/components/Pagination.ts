import { Component, html } from "./deps.ts";

export interface Pagination {
  pages: any[];
  currentPage: number;
}
export class Pagination extends Component {
  changePage(goToPage: number) {
    if (goToPage === this.currentPage) return;
    //this.$emit("update:currentPage", goToPage);
  }
  paginationClass(page: number) {
    return {
      "page-item": true,
      active: this.currentPage === page,
    };
  }

  override template = this.html(html`
        <ul class="pagination">
        ${
    this.pages.map((page) =>
      html`
            <li data-test=${`page-link-${page}`}
                class=${this.paginationClass(page)}
                on:click=${() => this.changePage(page)}
            >
                <a class="page-link" href="hh">
                    ${page}
                </a>
            </li>
        `
    )
  }
        </ul>
    `);
}
