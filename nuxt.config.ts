// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // @nuxthub/core phải đứng trước nuxt-studio (media ngoài Git / video lớn)
  modules: ['@nuxtjs/tailwindcss', '@nuxt/content', '@nuxthub/core', 'nuxt-studio'],

  hub: {
    blob: true,
  },
  css: ['~/assets/css/editorial.css'],
  app: {
    head: {
      htmlAttrs: {
        lang: 'vi',
      },
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap',
        },
      ],
    },
  },
  // Production Studio: OAuth GitHub + env trên Vercel — xem docs/STUDIO_VERCEL.md
  studio: {
    repository: {
      provider: 'github',
      owner: 'hung2604',
      repo: 'CMS-Demego',
      branch: 'master',
    },
    /** Upload ảnh/video qua Blob (không commit file nặng vào Git). Giới hạn mặc định Studio là 10MB. */
    media: {
      external: true,
      // 500MB — chỉnh theo nhu cầu (bytes). Cần driver Blob/R2/S3 hợp lệ trên production.
      maxFileSize: 500 * 1024 * 1024,
    },
  },
})