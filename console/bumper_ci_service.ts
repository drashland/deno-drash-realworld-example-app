import { BumperService } from "https://raw.githubusercontent.com/drashland/services/v0.0.1/ci/bumper_service.ts";

const b = new BumperService("realworld");

b.bump([
  {
    filename: "./.docker/drash.dockerfile",
    replaceTheRegex: /-s v[0-9.]+[0-9.]+[0-9]/g,
    replaceWith: "-s v{{ latestDenoVersion }}",
  },
]);
