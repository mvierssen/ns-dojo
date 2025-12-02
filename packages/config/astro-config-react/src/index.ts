import react from "@astrojs/react";
import base from "@ns-dojo/astro-config-base";
import {mergeConfig} from "astro/config";

export default mergeConfig(base, {integrations: [react()]});
