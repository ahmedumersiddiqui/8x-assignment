export function SpecTable({ specs }: { specs: Record<string, string> }) {
  const rows = Object.entries(specs)
  if (rows.length === 0) return null

  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Product details</caption>
      <tbody>
        {rows.map(([name, value]) => (
          <tr key={name} className="border-b border-line last:border-b-0">
            <th scope="row" className="w-[40%] py-2 pr-4 text-left align-top">
              {name}
            </th>
            <td className="py-2 align-top text-muted">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
