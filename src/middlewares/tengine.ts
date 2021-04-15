import { Tengine } from "../deps.ts";

export const tengine = Tengine({
  render: (..._args: unknown[]): boolean => {
    console.log("tengine is being called");
    return false;
  },
  views_path: "./public/views",
});
