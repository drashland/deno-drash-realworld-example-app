import { Component, html, computed, reactive } from "./deps.ts"

export interface TagList {
    tags: string[]
}
export class TagList extends Component {

    #tags = reactive(this.tags)

    override template = this.html(html`
        ${computed(() => {
            if (!this.#tags.value.length) {
                return
            }
            return html`
                <ul class="tag-list">
                    ${this.#tags.value.map(tag => html`
                        <li class="tag-default tag-pill tag-outline">
                            <span>${tag}</span>
                        </li>
                        
                    `)}
                </ul>
            `
        })}
    `)
}