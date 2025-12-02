import {writeFile} from "node:fs/promises";
import {EOL} from "node:os";
import {fileURLToPath} from "node:url";
import cloudflare from "@astrojs/cloudflare";
import base from "@ns-dojo/astro-config-base";
import {mergeConfig} from "astro/config";

const isDocker =
  process.env.NODE_ENV === "development" && process.env.DOCKER_ENV;

export default mergeConfig(base, {
  adapter: isDocker
    ? undefined
    : cloudflare({
        imageService: "passthrough",
        platformProxy: {
          configPath: "wrangler.json",
          enabled: true,
          persist: {path: "./.cache/wrangler/v3"},
        },
      }),
  integrations: [
    isDocker
      ? undefined
      : {
          hooks: {
            "astro:build:done": async ({dir}: {dir: URL}) => {
              const outFile = fileURLToPath(new URL(".assetsignore", dir));
              await writeFile(outFile, ["_worker.js"].join(EOL) + EOL);
            },
          },
          name: "Create .assetsignore",
        },
  ].filter(Boolean),
});
