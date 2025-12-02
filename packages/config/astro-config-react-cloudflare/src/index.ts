import cloudflare from "@ns-dojo/astro-config-cloudflare";
import react from "@ns-dojo/astro-config-react";
import {mergeConfig} from "astro/config";

export default mergeConfig(react, cloudflare);
