// Server-rendered fallback page. Fully PlugU-branded (black + gold) so a
// failed render never shows an unbranded or platform-branded screen.
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>PlugU — this page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="color-scheme" content="dark" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <style>
      :root { color-scheme: dark; }
      body { font: 15px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
        background: #0a0a0a; color: #f5f2ea; display: grid; place-items: center; min-height: 100vh; margin: 0;
        padding: max(24px, env(safe-area-inset-top)) 24px max(24px, env(safe-area-inset-bottom)); }
      .card { max-width: 26rem; width: 100%; text-align: center; }
      .brand { letter-spacing: 0.26em; font-weight: 800; font-size: 22px; color: #f4c96a; margin: 0 0 18px; }
      h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
      p { color: #b9b3a6; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.6rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.85rem 1.4rem; border-radius: 999px; font: inherit; font-weight: 700; cursor: pointer;
        text-decoration: none; border: 1px solid transparent; min-height: 44px; }
      .primary { background: linear-gradient(180deg, #f4c96a, #c9973f); color: #0a0a0a; }
      .secondary { background: transparent; color: #f5f2ea; border-color: rgba(244,201,106,0.4); }
    </style>
  </head>
  <body>
    <div class="card">
      <p class="brand">PLUGU</p>
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. Nothing on your account is affected — try again or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
