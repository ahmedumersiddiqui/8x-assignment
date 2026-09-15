PRODUCT_LIST_TTL_SECONDS = 60
PRODUCT_DETAIL_TTL_SECONDS = 300
CATEGORY_TREE_TTL_SECONDS = 900

REVIEWS_PAGE_SIZE_DEFAULT = 4
REVIEWS_PAGE_SIZE_MAX = 50

AUTH_RATE_LIMIT = 10
AUTH_RATE_WINDOW_SECONDS = 60

# The promise shown in the buy box before a delivery option has been chosen.
DEFAULT_DELIVERY_OPTION = "standard"

# Signing is cheap, but each ticket is a licence to write to the bucket.
UPLOAD_RATE_LIMIT = 30
UPLOAD_RATE_WINDOW_SECONDS = 60

STORE_LISTINGS_PAGE_SIZE_DEFAULT = 20
STORE_LISTINGS_PAGE_SIZE_MAX = 50

# Multiple storefronts per account is the point, but an unbounded number of them turns
# the store picker into a scroll and the "my stores" response into a page of its own.
STORES_PER_USER_MAX = 10

# A storefront's name and listing count change far less often than its products do.
STOREFRONT_TTL_SECONDS = 300
