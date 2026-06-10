import { LoginForm } from '@/components/auth/LoginForm'
import { getTranslations } from 'next-intl/server'

export default async function LoginPage() {
  const t = await getTranslations('auth')
  return <LoginForm title={t('loginTitle')} subtitle={t('loginSubtitle')} />
}
