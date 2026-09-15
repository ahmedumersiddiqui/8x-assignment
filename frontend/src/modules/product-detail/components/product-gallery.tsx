import { useState } from 'react'

/**
 * Hover or focus swaps the main image, as on Amazon -- no click required.
 *
 * `min-w-0` on the image is load-bearing: a flex item will not shrink below its intrinsic
 * width without it, so a 640px source would push the detail column off the grid.
 */
export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [selected, setSelected] = useState(0)
  const main = images[selected] ?? images[0]

  return (
    <div className="flex min-w-0 gap-3">
      {images.length > 1 && (
        <ul className="flex shrink-0 flex-col gap-2">
          {images.map((image, index) => (
            <li key={image}>
              <button
                type="button"
                onMouseEnter={() => setSelected(index)}
                onFocus={() => setSelected(index)}
                onClick={() => setSelected(index)}
                aria-label={`View image ${index + 1} of ${images.length}`}
                aria-current={index === selected}
                className={`block border p-0.5 ${index === selected ? 'border-teal' : 'border-line'}`}
              >
                <img src={image} alt="" width={48} height={48} className="h-12 w-12 object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <img
        src={main ?? ''}
        alt={title}
        width={500}
        height={500}
        className="h-[420px] min-w-0 flex-1 object-contain"
      />
    </div>
  )
}
