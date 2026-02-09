import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
// TODO: Re-enable when sitemap plugin compatibility with Astro 5 is fixed
// import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://stratadb.org',
  integrations: [
    mdx({
      shikiConfig: {
        theme: 'github-light',
        langs: ['bash', 'rust', 'python', 'javascript', 'typescript', 'json', 'toml', 'yaml'],
        wrap: true,
      },
    }),
    react(),
    // sitemap({
    //   filter: (page) => !page.includes('/404'),
    // }),
    tailwind(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      langs: ['bash', 'rust', 'python', 'javascript', 'typescript', 'json', 'toml', 'yaml'],
      wrap: true,
    },
  },
  vite: {
    ssr: {
      noExternal: ['framer-motion'],
    },
  },
});
