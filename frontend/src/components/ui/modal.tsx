import { useEffect, useRef } from 'react'

import { CloseIcon, IconSize } from '@/components/icons'

import { ModalPlacement } from './constants'

export function Modal({
  isOpen,
  onClose,
  title,
  placement = 'side',
  children,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  placement?: keyof typeof ModalPlacement
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label={title}
      className={`bg-white p-0 text-ink backdrop:bg-black/60 ${ModalPlacement[placement]}`}
    >
      <div className="flex items-center justify-between bg-nav-sub px-5 py-3 text-white">
        <h2 className="text-lg">{title}</h2>
        <button type="button" onClick={onClose} className="p-1 text-white" aria-label="Close">
          <CloseIcon size={IconSize.md} aria-hidden="true" />
        </button>
      </div>
      <div className={placement === 'side' ? 'h-[calc(100%-52px)] overflow-y-auto' : ''}>
        {children}
      </div>
    </dialog>
  )
}
