export const WORDMARK = 'emporia'

export const SubNavLinks = [
  { label: "Today's Deals", search: { sort: 'rating' as const } },
  { label: 'Electronics', search: { category: 'electronics' } },
  { label: 'Home & Kitchen', search: { category: 'home-kitchen' } },
  { label: 'Books', search: { category: 'books' } },
  { label: 'Fashion', search: { category: 'fashion' } },
  { label: 'Sports', search: { category: 'sports' } },
  { label: 'Toys & Games', search: { category: 'toys-games' } },
]

export const FooterColumns = [
  { title: 'Get to Know Us', links: ['About us', 'Careers', 'Press releases', 'Sustainability'] },
  { title: 'Make Money with Us', links: ['Sell products', 'Become an affiliate', 'Advertise'] },
  { title: 'Let Us Help You', links: ['Your account', 'Your orders', 'Shipping rates', 'Help'] },
  {
    title: 'Shop With Us',
    links: ['Gift cards', "Today's deals", 'Registry', 'Your saved lists'],
  },
]
