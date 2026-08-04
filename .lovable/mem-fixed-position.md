---
name: Fixed-position gotcha in AppShell pages
description: Bottom sheets/dialogs rendered inside page content render at document bottom, not viewport — use createPortal
type: constraint
---
`PullToRefresh` (and other transformed containers) apply CSS transforms, which makes `position: fixed` elements position relative to the transformed ancestor instead of the viewport. Any overlay rendered inside page content (bottom sheets, modals) MUST use `createPortal(..., document.body)`. **Why:** first Looking For sheet shipped without a portal and rendered at the bottom of the document, invisible behind the backdrop. **How to apply:** in any Sheet/Dialog component, return `createPortal(<div className="fixed inset-0 z-50">…</div>, document.body)` with a `typeof document === "undefined"` SSR guard.