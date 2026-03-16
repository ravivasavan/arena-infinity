export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">Arena Infinity</h1>
        <p className="mt-4 text-lg text-neutral-400">
          Explore Are.na as an infinite graph
        </p>
      </div>
      <a
        href="/api/auth/login"
        className="rounded-full bg-white px-8 py-3 text-lg font-medium text-black transition hover:bg-neutral-200"
      >
        Connect with Are.na
      </a>
    </main>
  );
}
