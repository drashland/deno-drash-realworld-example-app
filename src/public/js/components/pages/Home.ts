import { classNames, Component, HashRouter, html, reactive } from "../deps.ts";
import { fetchTags, isAuthenticated } from "../../state.ts";
import { Global } from "./Home/Global.ts";
import { Tag } from "../Tag.ts";
import { MyFeed } from "./Home/MyFeed.ts";

export interface Home {
  pathParams: {
    tag?: string;
  };
}
export class Home extends Component {
  #tags = reactive<string[]>([]);

  #tag: any = this.pathParams.tag;

  #pages = [
    {
      path: "/",
      content: Global,
    },
    {
      path: "/my-feed",
      content: MyFeed,
    },
    {
      path: "/tag/:tag",
      content: Tag,
    },
  ];

  async connectedCallback() {
    this.#tags.value = await fetchTags();
  }
  #getClassName(uri: string) {
    return classNames({
      "nav-link": true,
      "active": window.location.pathname === uri,
    });
  }
  override template = this.html(html`
        <div class="home-page">
            <div class="banner">
                <div class="container">
                    <h1 class="logo-font">conduit</h1>
                    <p>A place to share your knowledge.</p>
                </div>
            </div>
            <div class="container page">
                <div class="row">
                    <div class="col-md-8">
                        <div class="feed-toggle">
                            <ul class="nav nav-pills outline-active">
                            ${
    isAuthenticated.truthy(html`
                                <li class="nav-item">
                                    <a
                                    href="/my-feed"
                                    class=${this.#getClassName("/my-feed")}
                                    >
                                    Your Feed
                                    </a>
                                </li>
                            `)
  }
                                <li class="nav-item">

                                    <a
                                    href="/"
                                    class=${this.#getClassName("/")}
                                    >
                                    Global Feed
                                    </a>
                                </li>
                                ${
    this.pathParams.tag
      ? html`
                                <li class="nav-item" v-if="tag">
                                    <a
                                    href=${"/tag/" + this.pathParams.tag}
                                    class=${
        this.#getClassName("/tag/" + this.pathParams.tag)
      }
                                    >
                                    <i class="ion-pound"></i> ${this.pathParams.tag}
                                    </a>
                                </li>
                                `
      : ""
  }
                            </ul>
                        </div>
                        <${HashRouter} prop:routes=${this.#pages} />
                    </div>
                    <div class="col-md-3">
                        <div class="sidebar">
                            <p>Popular Tags</p>
                            <div class="tag-list">
                            ${
    this.#tags.map((tag) =>
      html`
                                <${Tag} prop:name=${tag} />
                            `
    )
  }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `);
}
