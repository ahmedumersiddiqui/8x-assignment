TAX_BPS = 825
FREE_SHIPPING_THRESHOLD_CENTS = 3500
SHIPPING_CENTS = {"standard": 599, "express": 1299}
DELIVERY_BUSINESS_DAYS = {"standard": 5, "express": 2}

# ponytail: first ZIP digit -> extra transit days. A carrier rate card keyed on the full
# postal code is the real answer; this is the same shape at a hundredth of the effort.
DELIVERY_ZONE_EXTRA_DAYS = {
    "0": 1, "1": 0, "2": 1, "3": 1, "4": 1,
    "5": 2, "6": 2, "7": 2, "8": 3, "9": 3,
}
UNKNOWN_ZONE_EXTRA_DAYS = 0

FTS_CANDIDATE_LIMIT = 500

MAX_QTY_PER_LINE = 20

RATING_STARS = (5, 4, 3, 2, 1)

ORDER_STATUS_PLACED = "placed"

# Seller uploads. The cap is enforced three times on purpose: the browser checks it for
# instant feedback, the signer refuses to sign anything larger, and the signature binds
# Content-Length so R2 itself rejects a body that does not match what was signed.
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
MAX_IMAGES_PER_LISTING = 6
# Extension is chosen by us from the declared type, never taken from the client filename.
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
}
UPLOAD_URL_TTL_SECONDS = 300

MAX_VARIANTS_PER_LISTING = 8
