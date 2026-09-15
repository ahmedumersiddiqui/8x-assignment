import { Text } from '@/components/ui/text'

export function UploadsUnavailable() {
  return (
    <div className="mb-4 border border-deal bg-white p-4" role="status">
      <Text bold className="mb-1">
        Image uploads are not configured
      </Text>
    </div>
  )
}
