'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { MaterialCard } from '@/components/materials/MaterialCard'
import { MaterialForm } from '@/components/materials/MaterialForm'
import { DeleteMaterialDialog } from '@/components/materials/DeleteMaterialDialog'
import { useMaterialsStore } from '@/stores/materials'
import { useTopicsStore } from '@/stores/topics'
import type { Material } from '@/types'

interface MaterialsClientProps {
  userId: string
}

export function MaterialsClient({ userId }: MaterialsClientProps) {
  const t = useTranslations('materials')
  const common = useTranslations('common')
  const { materials, isLoaded, load } = useMaterialsStore()
  const { topics, load: loadTopics } = useTopicsStore()
  const [isCreating, setIsCreating] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null)

  useEffect(() => {
    load()
    loadTopics()
  }, [load, loadTopics])

  const topicNameMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const topic of topics) {
      map[topic.id] = topic.name
    }
    return map
  }, [topics])

  const sortedMaterials = useMemo(
    () => [...materials].sort((a, b) => a.title.localeCompare(b.title)),
    [materials]
  )

  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('noMaterials')}</p>
        </div>
        <Button type="button" onClick={() => { setIsCreating((v) => !v); setEditingMaterial(null) }}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('newMaterial')}
        </Button>
      </div>

      {isCreating ? (
        <MaterialForm
          userId={userId}
          topics={topics}
          onSubmit={() => setIsCreating(false)}
          onCancel={() => setIsCreating(false)}
        />
      ) : null}

      {editingMaterial ? (
        <MaterialForm
          userId={userId}
          topics={topics}
          material={editingMaterial}
          onSubmit={() => setEditingMaterial(null)}
          onCancel={() => setEditingMaterial(null)}
        />
      ) : null}

      {!isLoaded ? (
        <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
          {common('loading')}
        </div>
      ) : sortedMaterials.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="font-medium">{t('noMaterials')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sortedMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              topicName={topicNameMap[material.topic_id]}
              onEdit={setEditingMaterial}
              onDelete={setDeletingMaterial}
            />
          ))}
        </div>
      )}

      <DeleteMaterialDialog
        material={deletingMaterial!}
        isOpen={deletingMaterial !== null}
        onCancel={() => setDeletingMaterial(null)}
        onConfirm={async () => {
          if (!deletingMaterial) return
          const { remove } = useMaterialsStore.getState()
          await remove(deletingMaterial.id)
          setDeletingMaterial(null)
        }}
      />
    </div>
  )
}
