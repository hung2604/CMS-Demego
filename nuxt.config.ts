// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap'
        }
      ]
    }
  },

  build: {
    transpile: ['iconify-icon-picker']
  },

  vite: {
    optimizeDeps: {
      include: [
        '@tiptap/vue-3',
        '@tiptap/starter-kit',
        '@tiptap/extension-table',
        '@tiptap/extension-table-row',
        '@tiptap/extension-table-cell',
        '@tiptap/extension-table-header',
        '@tiptap/extension-image',
        '@tiptap/extension-link',
        '@tiptap/extension-placeholder',
        '@tiptap/extension-character-count',
        '@tiptap/extension-text-align',
        '@tiptap/extension-underline',
        '@tiptap/extension-subscript',
        '@tiptap/extension-superscript',
        '@tiptap/extension-highlight',
        '@tiptap/extension-color',
        '@tiptap/extension-text-style'
      ]
    }
  },

  modules: ['@nuxt/ui', '@nuxtjs/seo', '@nuxtjs/i18n', 'nuxt-auth-utils'],

  css: ['~/assets/css/main.css'],

  i18n: {
    locales: [
      { code: 'vi', name: 'Tiếng Việt', file: 'vi.json' },
      { code: 'en', name: 'English', file: 'en.json' }
    ],
    defaultLocale: 'vi',
    strategy: 'no_prefix'
  },

  site: {
    url: 'https://cms-demego.com',
    name: 'CMS Demego'
  },

  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || '',
    mongodbDb: process.env.MONGODB_DB || 'cms',
    /** Vercel Blob — upload logo/favicon (chỉ server) */
    blobReadWriteToken: process.env.BLOB_READ_WRITE_TOKEN || '',
    /** POST /api/seed trên production: bắt buộc gửi body.token trùng giá trị này */
    seedToken: process.env.SEED_TOKEN || '',
    /** Bật POST /api/auth/register (nên false trên production) */
    adminAllowRegister: process.env.ADMIN_ALLOW_REGISTER === 'true'
  }
})
