import { defineConfig } from 'vitepress';
import typedocSidebar from '../docs/api/typedoc-sidebar.json';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'LFZ Forms Package',
  description: 'A VitePress Site',
  srcDir: 'docs',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: 'API', link: '/docs/api/' }],
    sidebar: [
      {
        text: 'API',
        items: typedocSidebar,
      },
    ],
    // socialLinks: [
    //   { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    // ]
  },
});
