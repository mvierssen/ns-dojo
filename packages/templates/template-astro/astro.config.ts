// @ts-check
import baseConfig from "@ns-dojo/astro-config-react-cloudflare";
import {defineConfig, mergeConfig} from "astro/config";
import Unfonts from "unplugin-fonts/astro";
import {FileSystemIconLoader} from "unplugin-icons/loaders";
import Icons from "unplugin-icons/vite";

// https://astro.build/config
export default defineConfig(
  mergeConfig(baseConfig, {
    integrations: [
      Unfonts({
        google: {
          families: ["Inter"],
          display: "swap",
        },
      }),
    ],
    vite: {
      plugins: [
        // @ts-expect-error - https://github.com/withastro/astro/issues/14030
        Icons({
          compiler: "astro",
          autoInstall: true,
          customCollections: {
            app: FileSystemIconLoader("src/assets/icons", (svg: string) =>
              svg.replace(/^<svg /, '<svg fill="currentColor" '),
            ),
          },
        }),
      ],
      resolve: {
        conditions: ["source"],
      },
    },
  }),
);
