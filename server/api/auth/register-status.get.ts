export default defineEventHandler(() => {
  const { adminAllowRegister } = useRuntimeConfig()
  return { allowed: !!adminAllowRegister }
})
