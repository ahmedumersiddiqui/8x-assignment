/** The backend only issues "placed" today; the map is what turns that into a sentence. */
export const OrderStatusLabels: Record<string, string> = {
  placed: 'Order placed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}
