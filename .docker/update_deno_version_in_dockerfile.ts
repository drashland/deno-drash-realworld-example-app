const fetchRes = await fetch("https://cdn.deno.land/deno/meta/versions.json");
const versions: {
  latest: string;
  versions: string[];
} = await fetchRes.json(); // eg { latest: "v1.3.3", versions: ["v1.3.2", ...] }
const latestDenoVersion = versions.latest.replace("v", "");

let dockerfileContent = new TextDecoder().decode(
  await Deno.readFile("./.docker/drash.dockerfile"),
);
dockerfileContent = dockerfileContent.replace(
  /-s v[0-9.]+[0-9.]+[0-9]/g,
  `-s v${latestDenoVersion}`,
);
await Deno.writeFile(
  "./.docker/drash.dockerfile",
  new TextEncoder().encode(dockerfileContent),
);
