export {
  classNames,
  computed,
  css,
  HashRouter,
  reactive,
  ReactiveArray,
  ReactiveValue,
  ReadonlyReactiveValue,
  Ref,
  register,
  Router,
} from "https://raw.githubusercontent.com/ebebbington/destiny/v0.4.2/src/mod.ts";
export type { TReactiveProperties } from "https://raw.githubusercontent.com/ebebbington/destiny/v0.4.2/src/mod.ts";
import {
  Component as C,
  html,
  TemplateResult,
} from "https://raw.githubusercontent.com/ebebbington/destiny/v0.4.2/src/mod.ts";
export class Component extends C {
  protected html(input: TemplateResult) {
    return html`
            <!-- Import Ionicon icons & Google Fonts our Bootstrap theme relies on -->
            <link href="//code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css" rel="stylesheet" type="text/css" />
            <link href="//fonts.googleapis.com/css?family=Titillium+Web:700|Source+Serif+Pro:400,700|Merriweather+Sans:400,700|Source+Sans+Pro:400,300,600,700,300italic,400italic,600italic,700italic"
                rel="stylesheet" type="text/css" />
            <!-- Import the custom Bootstrap 4 theme from our hosted CDN -->
            <link rel="stylesheet" href="https://demo.productionready.io/main.css" />
            ${input}
        `;
  }

  protected date(value: string) {
    return (new Date(value)).toLocaleDateString("en-US");
  }
}

export { html };
import swal from "https://cdn.skypack.dev/sweetalert@2.1.2";
export { swal };
export { marked } from "https://cdn.skypack.dev/marked@4.0.16";
