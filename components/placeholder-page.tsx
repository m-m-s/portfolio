export function PlaceholderPage({ name }: { name: string }) {
  return (
    <main className="flex-1 px-4 py-12 sm:px-8">
      <h1 className="text-4xl font-bold">[COPY: {name}]</h1>
    </main>
  );
}
