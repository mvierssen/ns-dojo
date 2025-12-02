import tailwind from "@tailwindcss/vite";
import {defineConfig} from "astro/config";
import Unfonts from "unplugin-fonts/astro";
import {FileSystemIconLoader} from "unplugin-icons/loaders";
import Icons from "unplugin-icons/vite";

export default defineConfig({
  integrations: [
    Unfonts({
      google: {families: ["Inter:wght@300;400;500;600;700"], display: "swap"},
    }),
  ],
  vite: {
    plugins: [
      // @ts-expect-error - https://github.com/withastro/astro/issues/14030
      tailwind(),
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
    resolve: {conditions: ["source"]},
  },
});
