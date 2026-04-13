import { defineConfig } from 'vitepress';
import typedocSidebar from '../docs/api/typedoc-sidebar.json';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'LFZ Forms',
  description: 'Laserfiche Forms builder toolkit — guides, recipes, and API reference',
  srcDir: 'docs',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Guide', link: '/guide/quick-start' },
      { text: 'Recipes', link: '/recipes/' },
      { text: 'API', link: '/api/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'LFForm Quick Start', link: '/guide/quick-start' },
            { text: 'Template & Toolchain', link: '/guide/template-setup' },
            { text: 'Custom HTML & Sandbox', link: '/guide/custom-html' },
          ],
        },
      ],
      '/recipes/': [
        {
          text: 'Recipes',
          link: '/recipes/',
          items: [
            {
              text: 'Field Visibility',
              collapsed: false,
              items: [
                { text: 'Show/Hide from Dropdown', link: '/recipes/show-hide-fields' },
              ],
            },
            {
              text: 'Validation',
              collapsed: false,
              items: [
                { text: 'Block Submission', link: '/recipes/block-submission-validation' },
              ],
            },
            {
              text: 'Tables',
              collapsed: false,
              items: [
                { text: 'Add Rows & Populate', link: '/recipes/add-table-rows' },
                { text: 'Entry ID → Doc Links', link: '/recipes/table-entry-document-links' },
              ],
            },
            {
              text: 'Field Settings',
              collapsed: false,
              items: [
                { text: 'Dynamic Labels', link: '/recipes/dynamic-labels' },
                { text: 'Localize Labels', link: '/recipes/localize-labels' },
              ],
            },
            {
              text: 'Lookups',
              collapsed: false,
              items: [
                { text: 'Cancel Lookup', link: '/recipes/cancel-lookup' },
              ],
            },
            {
              text: 'Fields',
              collapsed: false,
              items: [
                { text: 'Reset Fields', link: '/recipes/reset-fields' },
              ],
            },
            {
              text: 'TypeScript',
              collapsed: false,
              items: [
                { text: 'Type-Safe Helpers', link: '/recipes/typescript-types' },
              ],
            },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: typedocSidebar,
        },
      ],
    },
    search: {
      provider: 'local',
    },
  },
});
