import { defineConfig } from 'vitepress';
import typedocSidebar from '../docs/api/typedoc-sidebar.json';

type SidebarItem = {
  text: string;
  link?: string;
  collapsed?: boolean;
  items?: SidebarItem[];
};

const LF_FORM_TYPES_CATEGORY_ORDER = [
  'LFForm Main API',
  'LFForm API',
  'LFForm Identifiers',
  'LFForm Properties',
  'LFForm Getters',
  'LFForm Methods',
  'LFForm Events',
  'Field Types',
  'Field Settings',
  'Form Settings',
  'Utilities',
  'Other',
];

const categoryRank = new Map(
  LF_FORM_TYPES_CATEGORY_ORDER.map((name, idx) => [name, idx]),
);

function buildApiSidebar(items: SidebarItem[]): SidebarItem[] {
  const sidebar = JSON.parse(JSON.stringify(items)) as SidebarItem[];
  const lfFormTypesPkg = sidebar.find((item) => item.text === '@lf/lf-form-types');
  const lfFormTypesIndex = lfFormTypesPkg?.items?.find(
    (item) => item.text === 'index',
  );

  if (!lfFormTypesIndex?.items) {
    return sidebar;
  }

  lfFormTypesIndex.items.sort((a, b) => {
    const aRank = categoryRank.get(a.text) ?? Number.MAX_SAFE_INTEGER;
    const bRank = categoryRank.get(b.text) ?? Number.MAX_SAFE_INTEGER;

    if (aRank !== bRank) {
      return aRank - bRank;
    }

    return a.text.localeCompare(b.text);
  });

  const mainApiCategory = lfFormTypesIndex.items.find(
    (item) => item.text === 'LFForm Main API',
  );
  if (mainApiCategory) {
    mainApiCategory.collapsed = false;
  }

  return sidebar;
}

const apiSidebarItems = buildApiSidebar(typedocSidebar as SidebarItem[]);

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'LF Form Builder',
  description: 'Laserfiche Forms builder toolkit — guides, recipes, and API reference',
  srcDir: 'docs',
  base: process.env.NODE_ENV === 'production' ? '/lf-form-toolkit/' : '/',
  ignoreDeadLinks: [
    /\.\.\/README$/,
    /\.\/README$/,
    /\.\.\/\.\.\/README\.MD$/,
    /\.\.\/\.\.\/\.env\.example$/,
    /\.\.\/\.\.\/packages\/examples\/src\/Forms\/Empower2026\/Laserfiche%20Process$/,
    /_media\/template$/,
    /_media\/LICENSE$/,
    /\.\/(show-hide-fields|block-submission-validation|add-table-rows|table-entry-document-links|dynamic-labels|localize-labels|cancel-lookup|reset-fields|typescript-types|payment-gateways)$/,
    /\.\/@lf\/(form-builder-examples|lf-form-builder|lf-form-types)\/index$/,
  ],
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
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
            { text: 'LFForm API Navigation', link: '/guide/lfform-api-navigation' },
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
            {
              text: 'Payments',
              collapsed: false,
              items: [
                { text: 'Payment Gateways', link: '/recipes/payment-gateways' },
              ],
            },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: apiSidebarItems,
        },
      ],
    },
    search: {
      provider: 'local',
    },
  },
});
