/**
 * Fixed, pointer-events-none backdrop used on every screen: a faint
 * grid masked to fade at the edges, plus soft gold/blue glows. Kept
 * as a single component so the "void" atmosphere stays consistent
 * from the landing page all the way into the dashboard.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0 bg-grid-pattern bg-grid opacity-100"
        style={{
          maskImage:
            "radial-gradient(ellipse 70% 55% at 50% 0%, #000 40%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 55% at 50% 0%, #000 40%, transparent 90%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 420px at 15% 8%, rgba(200,155,60,0.14), transparent 60%), radial-gradient(650px 500px at 88% 18%, rgba(59,130,246,0.12), transparent 60%), radial-gradient(500px 500px at 50% 100%, rgba(200,155,60,0.06), transparent 60%)",
        }}
      />
    </div>
  );
}
