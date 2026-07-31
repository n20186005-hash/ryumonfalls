import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const site = "";
const hasSite = site.trim().length > 0;

export default defineConfig({
  site: hasSite ? site : undefined,
  output: "server",
  trailingSlash: "always",
  adapter: cloudflare({
    imageService: "passthrough"
  }),
  integrations: hasSite ? [sitemap()] : [],
  vite: {
    plugins: [tailwindcss()]
  }
});
