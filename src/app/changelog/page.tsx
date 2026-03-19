import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog — Arena Infinity",
  description: "New updates and improvements to Arena Infinity",
};

interface Entry {
  date: string;
  title: string;
  description: string;
}

interface Group {
  date: string;
  entries: Entry[];
}

const changelog: Group[] = [
  {
    date: "March 19, 2026",
    entries: [
      {
        date: "March 19, 2026",
        title: "Connect blocks and channels to your channels",
        description:
          "You can now connect any block or channel on the canvas to one of your Are.na channels — or any open channel. Click the connect icon in the node toolbar to open a search panel that shows your channels first, then the rest of Are.na. Channels are colour-coded by visibility: green for public, red for private, and grey for closed.",
      },
      {
        date: "March 19, 2026",
        title: "Visibility indicators on channel lists",
        description:
          "Both the sidebar and the connect panel now show a small coloured dot next to every channel — green for public, grey for closed, red for private — matching Are.na's own colour conventions.",
      },
      {
        date: "March 19, 2026",
        title: "Organic rearrange",
        description:
          "The rearrange button now runs a force-directed simulation across the whole graph, pulling connected nodes together and pushing unrelated ones apart for a more natural layout.",
      },
      {
        date: "March 19, 2026",
        title: "Tree layout with animated transitions",
        description:
          "Nodes animate in and out with a smooth scale and fade when added or removed from the canvas. A dagre-powered hierarchical layout was added and is available via the rearrange button.",
      },
      {
        date: "March 19, 2026",
        title: "Ghost node fix",
        description:
          "Pressing Backspace or Delete to remove a node now correctly syncs the removal back to the store, so nodes no longer reappear after being deleted.",
      },
    ],
  },
  {
    date: "March 16, 2026",
    entries: [
      {
        date: "March 16, 2026",
        title: "Arena Infinity launches",
        description:
          "An infinite canvas for exploring Are.na. Connect with your Are.na account, browse your channels in the sidebar, search Are.na, and expand any channel or block to see its connections as an interactive graph.",
      },
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
          {changelog.map((group) =>
            group.entries.map((entry, i) => (
              <article key={`${group.date}-${i}`} className="group">
                <p className="text-sm text-neutral-500 mb-3">{entry.date}</p>
                <h2 className="text-xl font-semibold text-white mb-3">{entry.title}</h2>
                <p className="text-neutral-400 leading-relaxed">{entry.description}</p>
              </article>
            ))
          )}
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
