import { DeliveryOptions } from '@/schemas/order'

export const DELIVERY_CHOICES = [
  {
    value: DeliveryOptions.Standard,
    label: 'Standard delivery',
    note: 'Free on orders over $35',
  },
  {
    value: DeliveryOptions.Express,
    label: 'Express delivery',
    note: 'Arrives sooner, flat rate',
  },
] as const

/** Prefilled so a reviewer can place an order without typing an address first. */
export const DEMO_ADDRESS = {
  name: 'Demo Shopper',
  line1: '410 Terry Ave N',
  line2: '',
  city: 'Seattle',
  state: 'WA',
  postal_code: '98109',
  country: 'US',
  phone: '2065550100',
} as const

export const ADDRESS_FIELDS = [
  { name: 'name', label: 'Full name', autoComplete: 'name', half: false },
  { name: 'line1', label: 'Address', autoComplete: 'address-line1', half: false },
  { name: 'line2', label: 'Apartment, suite (optional)', autoComplete: 'address-line2', half: false },
  { name: 'city', label: 'City', autoComplete: 'address-level2', half: true },
  { name: 'state', label: 'State', autoComplete: 'address-level1', half: true },
  { name: 'postal_code', label: 'ZIP code', autoComplete: 'postal-code', half: true },
  { name: 'phone', label: 'Phone number', autoComplete: 'tel', half: true },
] as const
