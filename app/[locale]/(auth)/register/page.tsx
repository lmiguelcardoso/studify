import { RegisterForm } from '@/components/auth/RegisterForm'
import { getTranslations } from 'next-intl/server'

export default async function RegisterPage() {
  const t = await getTranslations('auth')
  return <RegisterForm title={t('registerTitle')} />
}
