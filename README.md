# Arena Infinity

An infinite canvas for exploring [Are.na](https://www.are.na) as a graph. Browse your channels, expand blocks and channels to reveal their connections, and navigate the web of associations across your Are.na world.

**[arena-infinity.vercel.app](https://arena-infinity.vercel.app)**

---

## What it does

- **Browse your channels** in the sidebar — filter by your own or search all of Are.na
- **Expand any channel** to see its blocks laid out on the canvas
- **Expand any block** to see every channel it's been connected to
- **Connect** blocks or channels to your Are.na channels directly from the canvas
- **Rearrange** the graph into an organic force-directed layout at any time
- **Minimap** for navigating large graphs

## Stack

- [Next.js](https://nextjs.org) — App Router
- [React Flow](https://reactflow.dev) — canvas and graph rendering
- [d3-force](https://github.com/d3/d3-force) — organic layout simulation
- [Dagre](https://github.com/dagrejs/dagre) — hierarchical layout
- [Zustand](https://zustand-demo.pmnd.rs) — state management
- [Tailwind CSS](https://tailwindcss.com)
- [Are.na API v3](https://www.are.na/developers)

## Running locally

```bash
npm install
npm run dev
```

Create a `.env.local` with your Are.na OAuth credentials:

```
ARENA_CLIENT_ID=
ARENA_CLIENT_SECRET=
ARENA_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

Register an OAuth app at [dev.are.na](https://dev.are.na) to get credentials.

---

By [Ravi Vasavan](https://www.are.na/ravi-vasavan)
