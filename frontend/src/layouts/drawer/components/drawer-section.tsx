export function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line px-5 py-4 last:border-b-0">
      <h3 className="mb-2 text-lg">{title}</h3>
      <ul className="space-y-1">{children}</ul>
    </section>
  )
}
