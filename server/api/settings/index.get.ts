export default defineEventHandler(async () => {
  const db = await useMongoDb()
  const settings = await db.collection('settings').findOne({ _id: 'site' as any })

  return settings || {
    _id: 'site',
    siteName: 'CMS Demego',
    siteDescription: '',
    logo: '',
    favicon: '',
    footerText: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      github: '',
      youtube: ''
    }
  }
})
