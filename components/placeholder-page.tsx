// Temporary stand-in for pages that haven't been built yet.
export function PlaceholderPage({ name }: { name: string }) {
  return (
    <main className="flex-1 p-4">
      <h1 className="text-2xl">{name}</h1>
      <p className="font-grotesk">[COPY: {name} page]</p>
    </main>
  );
}
