'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { useMaterialsStore } from '@/stores/materials'
import type { Material, MaterialType, Topic } from '@/types'

interface MaterialFormProps {
  userId: string
  topics: Topic[]
  material?: Material
  topicId?: string
  onSubmit: () => void
  onCancel: () => void
}

const materialTypes: MaterialType[] = ['pdf', 'video_link', 'video_upload']

export function MaterialForm({ userId, topics, material, topicId, onSubmit, onCancel }: MaterialFormProps) {
  const t = useTranslations('materials')
  const common = useTranslations('common')
  const { add, update } = useMaterialsStore()

  const [title, setTitle] = useState(material?.title ?? '')
  const [type, setType] = useState<MaterialType>(material?.type ?? 'pdf')
  const [selectedTopicId, setSelectedTopicId] = useState(material?.topic_id ?? topicId ?? '')
  const [url, setUrl] = useState(material?.url ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const isEditing = !!material
  const sortedTopics = [...topics].sort((a, b) => a.name.localeCompare(b.name))

  async function uploadFileToStorage(fileToUpload: File): Promise<{ url: string; path: string }> {
    const supabase = createClient()
    const path = `${userId}/${crypto.randomUUID()}-${fileToUpload.name}`

    const { error } = await supabase.storage.from('materials').upload(path, fileToUpload)
    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from('materials').getPublicUrl(path)

    return { url: publicUrl, path }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim()) return
    if (!selectedTopicId) return

    let materialUrl: string | null = null
    let filePath: string | null = material?.file_path ?? null

    try {
      if (type === 'video_link') {
        if (!url.trim()) return
        materialUrl = url.trim()
        filePath = null
      } else if (file) {
        setUploading(true)
        const result = await uploadFileToStorage(file)
        materialUrl = result.url
        filePath = result.path
      } else if (isEditing) {
        materialUrl = material.url
      } else {
        return
      }
    } catch {
      setUploading(false)
      return
    } finally {
      setUploading(false)
    }

    const now = new Date().toISOString()

    if (isEditing) {
      await update(material.id, {
        title: title.trim(),
        type,
        topic_id: selectedTopicId,
        url: materialUrl,
        file_path: filePath,
      })
    } else {
      await add({
        id: crypto.randomUUID(),
        user_id: userId,
        topic_id: selectedTopicId,
        type,
        title: title.trim(),
        url: materialUrl,
        file_path: filePath,
        created_at: now,
        updated_at: now,
      })
    }

    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border p-4">
      <h3 className="text-lg font-semibold">{isEditing ? t('editMaterial') : t('newMaterial')}</h3>

      <div className="space-y-2">
        <Label htmlFor="material-title">{common('search')}</Label>
        <Input
          id="material-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('title')}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="material-type">{t('selectType')}</Label>
        <select
          id="material-type"
          value={type}
          onChange={(e) => setType(e.target.value as MaterialType)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {materialTypes.map((mt) => (
            <option key={mt} value={mt}>
              {t(`type.${mt}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="material-topic">{t('selectTopic')}</Label>
        <select
          id="material-topic"
          value={selectedTopicId}
          onChange={(e) => setSelectedTopicId(e.target.value)}
          required
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="" disabled>
            {t('selectTopic')}
          </option>
          {sortedTopics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))}
        </select>
      </div>

      {type === 'video_link' ? (
        <div className="space-y-2">
          <Label htmlFor="material-url">{t('url')}</Label>
          <Input
            id="material-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            required
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="material-file">{t('uploadFile')}</Label>
          <Input
            id="material-file"
            type="file"
            accept={type === 'pdf' ? 'application/pdf' : 'video/*'}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required={!isEditing}
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {common('cancel')}
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? common('loading') : isEditing ? common('save') : common('create')}
        </Button>
      </div>
    </form>
  )
}
