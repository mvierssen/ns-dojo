import base from "@ns-dojo/vite-config-base";
import react from "@vitejs/plugin-react";
import AutoImport from "unplugin-auto-import/vite";
import Unfonts from "unplugin-fonts/vite";
import {FileSystemIconLoader} from "unplugin-icons/loaders";
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import {mergeConfig} from "vite";

export default mergeConfig(base, {
  plugins: [
    react(),
    Unfonts({
      google: {
        families: ["Inter:wght@300;400;500;600;700"],
        display: "swap",
      },
    }),
    Icons({
      compiler: "jsx",
      jsx: "react",
      autoInstall: true,
      customCollections: {
        app: FileSystemIconLoader("src/assets/icons", (svg: string) =>
          svg.replace(/^<svg /, '<svg fill="currentColor" '),
        ),
      },
    }),
    AutoImport({
      resolvers: [IconsResolver({prefix: "Icon", extension: "jsx"})],
    }),
  ],
});
