import { createFileRoute } from '@tanstack/react-router'

import { Checkout } from '@/modules/checkout'

export const Route = createFileRoute('/_protected/_layout/checkout')({
  component: Checkout,
})
