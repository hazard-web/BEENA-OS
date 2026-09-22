import Link from "next/link";
import { DataPanel, PageHeader, TextLink } from "@/components/ui";
import { OS_MODULES } from "@/lib/types";

export default function HomePage() {
  return (
    <div>
      <PageHeader
        title="Home"
        actions={<TextLink href="/pipeline">Open pipeline</TextLink>}
      />

      <DataPanel title="All 12 operating systems">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="table-head">
              <tr>
                <th>#</th>
                <th>Operating system</th>
                <th>Phase</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {OS_MODULES.map((os) => (
                <tr key={os.n} className="row-hover border-t border-line">
                  <td className="px-4 py-3 tabular-nums text-slate">{os.n}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{os.name}</td>
                  <td className="px-4 py-3 text-slate">{os.phase}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={os.href}
                      className="text-[12px] font-semibold text-green-mid hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataPanel>
    </div>
  );
}
