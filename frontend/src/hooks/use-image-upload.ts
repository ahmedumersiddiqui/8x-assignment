import { useCallback, useState } from 'react'

import { APIEndpoints } from '@/constants/api-endpoints'
import type { UploadPolicy } from '@/schemas/store'
import { UploadTicketSchema } from '@/schemas/store'
import { API, getAPIErrorMessage } from '@/utils/api'
import { formatImageTypes, formatMegabytes } from '@/utils/format'

export type UploadedImage = { key: string; url: string }

/** Checked here for instant feedback. The server refuses to sign anything outside these
 *  bounds too, and the signature pins the exact byte count, so this is convenience
 *  rather than enforcement. */
const reject = (file: File, policy: UploadPolicy): string | null => {
  if (!policy.allowed_types.includes(file.type)) {
    return `${file.name} is not a supported image (${formatImageTypes(policy.allowed_types)})`
  }
  if (file.size > policy.max_bytes) {
    return `${file.name} is ${formatMegabytes(file.size)}, over the ${formatMegabytes(policy.max_bytes)} limit`
  }
  if (file.size === 0) return `${file.name} is empty`
  return null
}

export const useImageUpload = (storeId: number, policy: UploadPolicy | undefined) => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadOne = useCallback(
    async (file: File): Promise<UploadedImage> => {
      const ticket = await API.post(UploadTicketSchema, APIEndpoints.UploadSign, {
        store_id: storeId,
        content_type: file.type,
        size_bytes: file.size,
      })

      // Straight to R2, not through our API. Plain fetch on purpose: the signed URL is a
      // third-party origin, and the axios client attaches our session cookie to every
      // request it makes. Content-Length is set by the browser from the file and is part
      // of what was signed, so it must not be touched here.
      const response = await fetch(ticket.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
        credentials: 'omit',
      })
      if (!response.ok) {
        throw new Error(
          `Storage rejected ${file.name} (${response.status}). ` +
            'If this keeps happening the bucket may not allow uploads from this site.',
        )
      }

      return { key: ticket.key, url: ticket.public_url }
    },
    [storeId],
  )

  const upload = useCallback(
    async (files: File[], remainingSlots: number): Promise<UploadedImage[]> => {
      setError(null)
      if (!policy?.configured) {
        setError('Image uploads are not configured on this server')
        return []
      }
      if (files.length > remainingSlots) {
        setError(`You can add ${remainingSlots} more photo${remainingSlots === 1 ? '' : 's'}`)
        return []
      }

      const firstProblem = files.map((file) => reject(file, policy)).find(Boolean)
      if (firstProblem) {
        setError(firstProblem)
        return []
      }

      setIsUploading(true)
      try {
        return await Promise.all(files.map(uploadOne))
      } catch (cause) {
        setError(getAPIErrorMessage(cause, 'That upload did not finish. Please try again.'))
        return []
      } finally {
        setIsUploading(false)
      }
    },
    [policy, uploadOne],
  )

  return { upload, isUploading, error, clearError: () => setError(null) }
}
