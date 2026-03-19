import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog — Arena Infinity",
  description: "New updates and improvements to Arena Infinity",
};

interface DayEntry {
  date: string;
  updates: string[];
}

const changelog: DayEntry[] = [
  {
    date: "March 19, 2026",
    updates: [
      "Connect any block or channel on the canvas to your Are.na channels — or any open channel — via the new link icon in each node's toolbar.",
      "Connect search shows your channels first. A filter dropdown lets you limit results to your own channels only.",
      "Channel lists in the sidebar and connect panel now show colour-coded visibility dots: green for public, grey for closed, red for private.",
      "Rearrange now runs a free force-directed simulation with no anchors, producing a natural organic layout.",
      "Nodes animate in and out with a smooth scale and fade transition.",
      "Fixed: deleting a node via Backspace/Delete now correctly syncs removal to the store — no more ghost nodes reappearing.",
      "Sidebar search and filter redesigned: search and channel filter are stacked, both full width.",
      "Added Changelog page and credit footer to the sidebar.",
    ],
  },
  {
    date: "March 16, 2026",
    updates: [
      "Arena Infinity launches. Connect with your Are.na account, browse your channels in the sidebar, search Are.na, and expand any channel or block to explore its connections as an infinite graph.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="mb-20">
          <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
          <p className="mt-2 text-neutral-400 text-lg">New updates and improvements</p>
        </div>

        {/* Entries */}
        <div className="space-y-16">
          {changelog.map((entry) => (
            <article key={entry.date}>
              <p className="text-sm text-neutral-500 mb-4">{entry.date}</p>
              <ul className="space-y-2">
                {entry.updates.map((update, i) => (
                  <li key={i} className="flex gap-3 text-neutral-300 leading-relaxed">
                    <span className="text-neutral-600 mt-1.5 flex-shrink-0">—</span>
                    <span>{update}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-neutral-800">
          <a
            href="/canvas"
            className="text-sm text-neutral-500 hover:text-white transition-colors"
          >
            ← Back to canvas
          </a>
        </div>
      </div>
    </main>
  );
}
