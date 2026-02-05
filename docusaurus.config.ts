import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Strata',
  tagline: 'An embedded database for AI agents — six primitives, branch isolation, and deterministic replay.',
  favicon: 'img/favicon.ico',

  url: 'https://stratadb.org',
  baseUrl: '/',

  organizationName: 'stratadb-labs',
  projectName: 'stratadb.org',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    format: 'detect',
  },

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'architecture',
        path: 'docs-architecture',
        routeBasePath: 'architecture',
        sidebarPath: undefined,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Strata',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/architecture/',
          label: 'Architecture',
          position: 'left',
        },
        {
          href: 'https://github.com/stratadb-labs/strata-core',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started/',
            },
            {
              label: 'Guides',
              to: '/docs/guides/',
            },
            {
              label: 'API Reference',
              to: '/docs/reference/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Architecture',
              to: '/architecture/',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/stratadb-labs/strata-core',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} StrataDB. Apache 2.0 License.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['rust', 'toml', 'bash'],
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
