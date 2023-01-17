// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Stoat',
  tagline: 'Easy and customizable dashboards for your build system.',
  url: 'https://docs.stoat.dev/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'stoat-dev', // Usually your GitHub org/username.
  projectName: 'stoat', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js')
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: false
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      })
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'light',
        disableSwitch: true,
        respectPrefersColorScheme: false
      },
      navbar: {
        title: 'Stoat Docs',
        logo: {
          alt: 'Stoat Logo',
          src: 'img/logo-128.png'
        },
        items: [
          // {
          //   type: 'doc',
          //   docId: 'intro',
          //   position: 'left',
          //   label: 'Get Started!'
          // },
          // { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/stoat-dev/stoat-action',
            label: 'GitHub',
            position: 'right'
          },
          {
            href: 'https://stoat.dev/',
            label: 'Stoat Homepage',
            position: 'right'
          }
        ]
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'What is Stoat?',
                to: '/docs/intro'
              },
              {
                label: 'Get Started!',
                to: '/docs/installation'
              },
              {
                label: 'Why Stoat?',
                to: '/docs/why-stoat'
              }
            ]
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Twitter',
                href: 'https://twitter.com/stoat_dev'
              },
              {
                label: 'Discord',
                href: 'https://discord.gg/MszYpbabna'
              }
            ]
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/stoat-dev/'
              },
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/@stoat-dev'
              },
              {
                label: 'Built with Docusaurus',
                href: 'https://docusaurus.io/'
              }
            ]
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Stoat Dev.`
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      }
    })
};

// Uses VERCEL_ENV instead of NODE_ENV, so we can exclude previews from analytics collection.
// see https://vercel.com/docs/concepts/projects/environment-variables#system-environment-variables
const enableAnalytics = process.env.VERCEL_ENV === 'production';

if (enableAnalytics) {
  config['scripts'] = [
    {
      src: 'https://plausible.io/js/script.js',
      defer: true,
      'data-domain': 'docs.stoat.dev'
    }
  ];
}

module.exports = config;
