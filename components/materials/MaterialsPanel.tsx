'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { DeleteMaterialDialog } from '@/components/materials/DeleteMaterialDialog'
import { MaterialCard } from '@/components/materials/MaterialCard'
import { MaterialForm } from '@/components/materials/MaterialForm'
import { createClient } from '@/lib/supabase/client'
import { useMaterialsStore } from '@/stores/materials'
import type { Material, MaterialType } from '@/types'

interface MaterialsPanelProps {
  topicId: string
  userId: string
}

interface MaterialFormValues {
  type: MaterialType
  title: string
  url: string
  file: File | null
}

function getExtension(file: File, type: MaterialType) {
  if (type === 'pdf') return 'pdf'
  const extension = file.name.split('.').pop()
  return extension || 'mp4'
}

export function MaterialsPanel({ topicId, userId }: MaterialsPanelProps) {
  const t = useTranslations('materials')
  const { materials, isLoaded, loadByTopic, add, remove } = useMaterialsStore()
  const [isCreating, setIsCreating] = useState(false)
  const [deletingMaterialId, setDeletingMaterialId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    loadByTopic(topicId)
  }, [loadByTopic, topicId])

  const topicMaterials = useMemo(
    () =>
      materials
        .filter((material) => material.topic_id === topicId)
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [materials, topicId]
  )
  const deletingMaterial = topicMaterials.find((material) => material.id === deletingMaterialId)

  async function uploadFile(file: File, type: MaterialType) {
    if (!navigator.onLine) {
      throw new Error(t('uploadRequiresConnection'))
    }

    const supabase = createClient()
    const filePath = `${userId}/${crypto.randomUUID()}.${getExtension(file, type)}`
    const { error } = await supabase.storage.from('materials').upload(filePath, file, {
      contentType: file.type,
    })

    if (error) throw error
    return filePath
  }

  async function handleCreate(values: MaterialFormValues) {
    setFormError(null)
    try {
      let filePath: string | null = null
      if (values.type !== 'video_link') {
        if (!values.file) return
        filePath = await uploadFile(values.file, values.type)
      }

      const now = new Date().toISOString()
      const material: Material = {
        id: crypto.randomUUID(),
        user_id: userId,
        topic_id: topicId,
        type: values.type,
        title: values.title,
        url: values.type === 'video_link' ? values.url : null,
        file_path: filePath,
        created_at: now,
        updated_at: now,
      }

      await add(material)
      setIsCreating(false)
    } catch {
      setFormError(t('saveError'))
    }
  }

  async function handleDelete() {
    if (!deletingMaterial) return

    if (deletingMaterial.file_path && navigator.onLine) {
      const supabase = createClient()
      await supabase.storage.from('materials').remove([deletingMaterial.file_path])
    }

    await remove(deletingMaterial.id)
    setDeletingMaterialId(null)
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <Button type="button" variant="outline" onClick={() => setIsCreating((value) => !value)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('newMaterial')}
        </Button>
      </div>

      {isCreating ? <MaterialForm onSubmit={handleCreate} onCancel={() => setIsCreating(false)} /> : null}
      {formError ? <p className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">{formError}</p> : null}

      {isLoaded && topicMaterials.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {t('noMaterials')}
        </div>
      ) : null}

      <div className="space-y-3">
        {topicMaterials.map((material) => (
          <MaterialCard
            key={material.id}
            material={material}
            onDelete={() => setDeletingMaterialId(material.id)}
          />
        ))}
      </div>

      {deletingMaterial ? (
        <DeleteMaterialDialog
          material={deletingMaterial}
          isOpen={!!deletingMaterial}
          onCancel={() => setDeletingMaterialId(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </section>
  )
}
