import { createClient } from '@/lib/supabase/server'
import { MaterialsClient } from '@/components/materials/MaterialsClient'

export default async function MaterialsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <MaterialsClient userId={user!.id} />
}
