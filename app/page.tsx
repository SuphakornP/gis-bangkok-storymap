export default function Page() {
  return (
    <main className="site-shell" aria-label="Bangkok GIS map prototype">
      <iframe
        className="map-frame"
        src="/index-static.html"
        title="Bangkok GIS risk and accessibility prototype"
      />
    </main>
  );
}
