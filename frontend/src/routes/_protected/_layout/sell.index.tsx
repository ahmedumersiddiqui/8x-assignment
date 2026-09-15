import { createFileRoute } from '@tanstack/react-router'

import { Sell } from '@/modules/sell'

export const Route = createFileRoute('/_protected/_layout/sell/')({
  component: Sell,
})
