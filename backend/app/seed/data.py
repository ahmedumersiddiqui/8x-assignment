"""Seed taxonomy. Everything the generator needs to make 300 plausible products."""

RANDOM_SEED = 8
PRODUCTS_PER_SUBCATEGORY = 11
IMAGES_PER_PRODUCT = 4
# Images are generated, not fetched -- see app/seed/images.py for why.

COLORS = ["Midnight Black", "Glacier White", "Graphite", "Deep Blue", "Sand"]
SIZES = ["S", "M", "L", "XL"]
STORAGE = ["128GB", "256GB", "512GB", "1TB"]
CAPACITY = ["Single", "2-Pack", "4-Pack"]

# (name, slug, noun, brands, price_range_cents, variant_axis)
SUBCATEGORIES = {
    "electronics": [
        (
            "Headphones",
            "headphones",
            "Wireless Noise Cancelling Headphones",
            ["Sonvex", "Aurelia", "Kestrel Audio", "Nomad"],
            (4999, 39999),
            ("Color", COLORS),
        ),
        (
            "Laptops",
            "laptops",
            "Thin and Light Laptop",
            ["Halcyon", "Torix", "Nimbus", "Vantor"],
            (49999, 249999),
            ("Storage", STORAGE),
        ),
        (
            "Smartphones",
            "smartphones",
            "5G Smartphone",
            ["Torix", "Aurelia", "Meridian"],
            (29999, 129999),
            ("Storage", STORAGE),
        ),
        (
            "Cameras",
            "cameras",
            "Mirrorless Camera Body",
            ["Kestrel Optics", "Lumeo", "Vantor"],
            (59999, 299999),
            ("Color", COLORS[:3]),
        ),
        (
            "Smart Home",
            "smart-home",
            "Smart Speaker",
            ["Nimbus", "Halcyon", "Meridian"],
            (2999, 24999),
            ("Color", COLORS[:4]),
        ),
    ],
    "home-kitchen": [
        (
            "Cookware",
            "cookware",
            "Nonstick Cookware Set",
            ["Ferrata", "Hearthline", "Copperfield"],
            (3999, 29999),
            ("Size", ["8-Piece", "12-Piece"]),
        ),
        (
            "Coffee",
            "coffee",
            "Espresso Machine",
            ["Barrista", "Hearthline", "Cremio"],
            (7999, 89999),
            ("Color", COLORS[:3]),
        ),
        (
            "Vacuums",
            "vacuums",
            "Cordless Stick Vacuum",
            ["Gustline", "Nimbus", "Ferrata"],
            (12999, 59999),
            ("Color", COLORS[:3]),
        ),
        (
            "Bedding",
            "bedding",
            "Cotton Sheet Set",
            ["Loomwell", "Hearthline"],
            (2999, 14999),
            ("Size", ["Twin", "Queen", "King"]),
        ),
    ],
    "books": [
        (
            "Fiction",
            "fiction",
            "Novel (Paperback)",
            ["Harrowgate Press", "Blue Lantern", "Fenn & Co"],
            (899, 2999),
            ("Format", ["Paperback", "Hardcover", "Audiobook"]),
        ),
        (
            "Technology",
            "technology-books",
            "Programming Guide",
            ["Harrowgate Press", "Compile Press"],
            (2499, 6999),
            ("Format", ["Paperback", "Hardcover", "eBook"]),
        ),
        (
            "Cookbooks",
            "cookbooks",
            "Cookbook",
            ["Hearthline Books", "Blue Lantern"],
            (1599, 4999),
            ("Format", ["Paperback", "Hardcover"]),
        ),
    ],
    "fashion": [
        (
            "Men's Clothing",
            "mens-clothing",
            "Merino Crew Sweater",
            ["Loomwell", "Northbank", "Alder"],
            (2999, 14999),
            ("Size", SIZES),
        ),
        (
            "Women's Clothing",
            "womens-clothing",
            "Relaxed Linen Shirt",
            ["Loomwell", "Marisol", "Alder"],
            (2999, 15999),
            ("Size", SIZES),
        ),
        (
            "Shoes",
            "shoes",
            "Everyday Running Shoe",
            ["Strider", "Northbank", "Kestrel"],
            (5999, 21999),
            ("Size", ["8", "9", "10", "11"]),
        ),
        (
            "Watches",
            "watches",
            "Automatic Watch",
            ["Meridian", "Alder", "Corvin"],
            (9999, 79999),
            ("Color", COLORS[:3]),
        ),
    ],
    "sports": [
        (
            "Fitness",
            "fitness",
            "Adjustable Dumbbell Set",
            ["Strider", "Ironmark", "Vantor"],
            (7999, 49999),
            ("Size", ["25 lb", "52 lb", "90 lb"]),
        ),
        (
            "Outdoors",
            "outdoors",
            "4-Season Tent",
            ["Northbank", "Kestrel", "Basalt"],
            (9999, 69999),
            ("Size", ["2P", "3P", "4P"]),
        ),
        (
            "Cycling",
            "cycling",
            "Carbon Road Bike Helmet",
            ["Strider", "Corvin", "Basalt"],
            (4999, 29999),
            ("Size", ["S", "M", "L"]),
        ),
    ],
    "toys-games": [
        (
            "Board Games",
            "board-games",
            "Strategy Board Game",
            ["Tessera", "Blue Lantern", "Fenn & Co"],
            (1999, 7999),
            ("Edition", ["Base", "Deluxe"]),
        ),
        (
            "Building Sets",
            "building-sets",
            "Building Block Set",
            ["Brickway", "Tessera"],
            (1499, 19999),
            ("Size", ["300 pc", "800 pc", "1500 pc"]),
        ),
        (
            "Puzzles",
            "puzzles",
            "Jigsaw Puzzle",
            ["Tessera", "Brickway"],
            (999, 3999),
            ("Size", ["500 pc", "1000 pc", "2000 pc"]),
        ),
    ],
    "beauty": [
        (
            "Skincare",
            "skincare",
            "Hydrating Serum",
            ["Marisol", "Lumeo", "Verdant"],
            (1299, 8999),
            ("Size", ["30ml", "50ml"]),
        ),
        (
            "Hair Care",
            "hair-care",
            "Repair Shampoo",
            ["Marisol", "Verdant"],
            (999, 4999),
            ("Size", ["250ml", "500ml"]),
        ),
        (
            "Fragrance",
            "fragrance",
            "Eau de Parfum",
            ["Marisol", "Corvin", "Lumeo"],
            (3999, 18999),
            ("Size", ["30ml", "50ml", "100ml"]),
        ),
    ],
    "grocery": [
        (
            "Coffee & Tea",
            "coffee-tea",
            "Whole Bean Coffee",
            ["Cremio", "Barrista", "Verdant"],
            (999, 3999),
            ("Size", ["12 oz", "2 lb", "5 lb"]),
        ),
        (
            "Snacks",
            "snacks",
            "Protein Bars",
            ["Ironmark", "Verdant"],
            (1299, 4999),
            ("Pack", CAPACITY),
        ),
    ],
}

CATEGORIES = [
    ("Electronics", "electronics"),
    ("Home & Kitchen", "home-kitchen"),
    ("Books", "books"),
    ("Clothing, Shoes & Jewelry", "fashion"),
    ("Sports & Outdoors", "sports"),
    ("Toys & Games", "toys-games"),
    ("Beauty & Personal Care", "beauty"),
    ("Grocery", "grocery"),
]

# Marketplace sellers. Every product in the catalogue is listed by one of these stores --
# there is no anonymous house inventory, so "Sold by" on a PDP always names a real
# storefront with a page of its own. Each store covers one department, which is both how
# marketplace sellers actually specialise and what makes a storefront page look coherent.
# The first entry belongs to the demo account, and it has two stores: signing in as the
# demo user should land on a store picker with something in it.
STORES = [
    ("Northwind Electronics", "electronics", None),
    ("Northwind Outdoors", "sports", None),
    ("Hearth & Hob", "home-kitchen", ("hearth@example.com", "Marcus Hale")),
    ("Margin Notes Books", "books", ("margin@example.com", "Ines Barros")),
    ("Thread & Last", "fashion", ("thread@example.com", "Yara Sultan")),
    ("Brightside Toys", "toys-games", ("brightside@example.com", "Owen Deel")),
    ("Glow Theory", "beauty", ("brightside@example.com", "Owen Deel")),
    ("The Daily Pantry", "grocery", ("pantry@example.com", "Hana Kim")),
]

SERIES = ["Pro", "Max", "Air", "Studio", "Lite", "Ultra", "Core", "Edge", "Flex", "Prime"]
MODEL_NUMBERS = ["100", "200", "3", "5", "7", "X", "9000", "II", "Mk III", "One"]

BULLETS = [
    "Built from materials chosen to survive daily use, not a product photo",
    "Sets up in under five minutes with no extra tools",
    "Backed by a two-year limited warranty and real human support",
    "Independently tested for durability across 10,000 cycles",
    "Designed to work with what you already own",
]

SPECS = {
    "Manufacturer": "{brand}",
    "Model": "{series} {model}",
    "Country of Origin": "Vietnam",
    "Item Weight": "{weight} lb",
    "Warranty": "2 years",
}

REVIEW_TITLES = [
    "Exactly what I hoped for",
    "Good, with one caveat",
    "Would buy again",
    "Solid value for the money",
    "Not quite what the photos suggest",
]
REVIEW_BODIES = [
    "Three weeks in and it has held up to daily use without complaint.",
    "Does the job well. Packaging was more elaborate than it needed to be.",
    "Better build quality than the price suggests. Delivery was quick.",
    "Works fine, though the instructions could be clearer.",
    "Replaced a more expensive one that failed. No regrets so far.",
]
REVIEWER_NAMES = [
    "A. Whitfield", "Dana R.", "M. Okafor", "Priya S.", "Jonas T.", "Lee Q.",
    "Ines B.", "Tomas V.", "Nadia H.", "Callum F.", "Ruth A.", "Ivan P.",
    "Sofia M.", "Ken O.", "Marta L.", "Owen D.", "Yara S.", "Felix W.",
    "Hana K.", "Diego R.", "Nora T.", "Sam E.", "Amara J.", "Luca G.",
    "Beth C.", "Rafiq N.", "Elena V.", "Oscar B.", "Tara M.", "Niall S.",
    "Pia L.", "Hugo A.", "Zara Q.", "Milo F.", "Ada N.", "Bruno T.",
    "Iris D.", "Kwame O.", "Lena R.", "Viktor S.",
]

REVIEWS_PER_PRODUCT = (3, 12)
RATING_WEIGHTS = {5: 46, 4: 28, 3: 14, 2: 7, 1: 5}
