// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

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
    url: 'https://cms.demego.vn',
    name: 'CMS Demepro'
  },

  /**
   * Font chữ tự host qua @nuxt/fonts (đi kèm @nuxt/ui) thay cho <link> Google Fonts chặn render.
   * Manrope/Inter là variable font nên nhiều weight vẫn chỉ tải chung một file cho mỗi subset.
   */
  fonts: {
    defaults: {
      subsets: ['vietnamese', 'latin-ext', 'latin']
    },
    families: [
      { name: 'Manrope', provider: 'google', weights: [400, 500, 600, 700, 800], styles: ['normal'] },
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] }
    ]
  },

  /**
   * Icon SVG render sẵn khi SSR — không còn phụ thuộc font Material Symbols (hiện chữ "chevron_right"
   * trước khi font tải xong) hay gọi api.iconify.design lúc render.
   */
  icon: {
    serverBundle: {
      collections: ['lucide']
    },
    clientBundle: {
      icons: [
        'lucide:file-text',
        'material-symbols:arrow-back',
        'material-symbols:arrow-downward',
        'material-symbols:arrow-forward',
        'material-symbols:arrow-upward',
        'material-symbols:chevron-right',
        'material-symbols:close',
        'material-symbols:dark-mode-outline',
        'material-symbols:edit-outline',
        'material-symbols:expand-more',
        'material-symbols:library-books-outline',
        'material-symbols:light-mode-outline',
        'material-symbols:menu-book-outline',
        'material-symbols:menu-open',
        'material-symbols:newspaper',
        'material-symbols:north-west',
        'material-symbols:search'
      ]
    },
    /** Icon ngoài bundle (vd. icon menu chọn từ bộ khác trong admin) chỉ lấy qua /api/_nuxt_icon */
    fallbackToApi: 'server-only'
  },

  /** Không dùng ảnh OG động — tắt để bỏ satori/resvg khỏi server bundle và endpoint /_og */
  ogImage: { enabled: false },

  sitemap: {
    exclude: ['/admin/**']
  },

  robots: {
    disallow: ['/admin']
  },

  nitro: {
    vercel: {
      functions: {
        /**
         * MongoDB đặt tại Hà Nội — chạy function ở Hong Kong thay vì mặc định iad1 (Mỹ)
         * để mỗi truy vấn không phải vượt Thái Bình Dương.
         */
        regions: ['hkg1']
      }
    }
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
