'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MaterialType } from '@/types'

interface MaterialFormValues {
  type: MaterialType
  title: string
  url: string
  file: File | null
}

interface MaterialFormProps {
  onSubmit: (values: MaterialFormValues) => Promise<void>
  onCancel?: () => void
}

export function MaterialForm({ onSubmit, onCancel }: MaterialFormProps) {
  const t = useTranslations('materials')
  const common = useTranslations('common')
  const [type, setType] = useState<MaterialType>('pdf')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const needsFile = type === 'pdf' || type === 'video_upload'
  const canSubmit = title.trim() && (needsFile ? file : url.trim())

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        type,
        title: title.trim(),
        url: url.trim(),
        file,
      })
      setTitle('')
      setUrl('')
      setFile(null)
      setType('pdf')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border bg-card p-4">
      <div className="grid gap-2">
        <Label htmlFor="material-type">{t('materialType')}</Label>
        <select
          id="material-type"
          value={type}
          onChange={(event) => {
            setType(event.target.value as MaterialType)
            setFile(null)
            setUrl('')
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="pdf">{t('type.pdf')}</option>
          <option value="video_link">{t('type.video_link')}</option>
          <option value="video_upload">{t('type.video_upload')}</option>
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="material-title">{t('titleField')}</Label>
        <Input
          id="material-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          maxLength={120}
        />
      </div>

      {type === 'video_link' ? (
        <div className="grid gap-2">
          <Label htmlFor="material-url">{t('url')}</Label>
          <Input
            id="material-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
          />
        </div>
      ) : (
        <div className="grid gap-2">
          <Label htmlFor="material-file">{type === 'pdf' ? t('uploadPdf') : t('uploadVideo')}</Label>
          <Input
            id="material-file"
            type="file"
            accept={type === 'pdf' ? '.pdf,application/pdf' : 'video/*'}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            required
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            {common('cancel')}
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting || !canSubmit}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {common('create')}
        </Button>
      </div>
    </form>
  )
}
