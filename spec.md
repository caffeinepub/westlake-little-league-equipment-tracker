# Westlake Little League Equipment Tracker

## Current State
- Full equipment tracking app with Dashboard, Inventory, Issue, Returns, Reports pages
- Layout.tsx has a "WL" text circle placeholder in the header instead of a real logo
- manifest.json references a generated PWA icon (pwa-icon.dim_512x512.png)
- Equipment categories are a fixed enum (helmet, bat, glove, etc.) with display labels in CATEGORY_LABELS in helpers.ts
- No settings page exists

## Requested Changes (Diff)

### Add
- Logo image in the top header (replacing the "WL" circle div) and in the sidebar footer area
- A Settings page (`/settings`) accessible via a gear icon in the sidebar/nav
- Settings page has a "Equipment Categories" section to:
  - Rename any category's display label (editing text inline)
  - Hide/remove categories from dropdowns (toggle visibility)
  - Add new custom categories (stored as "other" backend type with custom label)
- Category customizations persist in localStorage
- Settings link added to sidebar nav and bottom mobile nav

### Modify
- Layout.tsx header: replace the `<div>WL</div>` circle with `<img src="/assets/uploads/gemini_generated_image_5j6l4b5j6l4b5j6l-019d3531-a5fa-75ff-8e99-4828ec3a6f02-1.png" />` logo, sized ~32px height
- manifest.json: update `icons` to use the uploaded logo path `/assets/uploads/gemini_generated_image_5j6l4b5j6l4b5j6l-019d3531-a5fa-75ff-8e99-4828ec3a6f02-1.png` for the PWA icon
- App.tsx: add a settings route `/settings`
- helpers.ts: export a `getCategoryLabels()` function that reads from localStorage if customizations exist, falling back to CATEGORY_LABELS defaults
- Inventory.tsx and IssueEquipment.tsx: use `getCategoryLabels()` instead of `CATEGORY_LABELS` directly so renamed/hidden categories are respected

### Remove
- The hardcoded `<div className="w-7 h-7 rounded-full ...">WL</div>` in Layout.tsx header

## Implementation Plan
1. Update Layout.tsx:
   - Replace "WL" circle with the logo image
   - Add Settings nav item (with Settings/gear icon) to NAV_ITEMS, sidebar, and bottom mobile nav
2. Update App.tsx: add `/settings` route
3. Create `src/frontend/src/pages/Settings.tsx`:
   - Shows list of all default categories with current labels
   - Inline edit to rename label
   - Toggle switch to hide/show category
   - "Add custom category" button (adds a new entry that maps to `EquipmentCategory.other` backend value with custom display name, stored as a custom label key)
   - All changes saved to localStorage key `wll_category_settings`
4. Update helpers.ts:
   - Add `getCategoryLabels()` that merges localStorage customizations with defaults
   - Add `getVisibleCategories()` that returns only non-hidden categories
5. Update manifest.json to use the real logo as PWA icon
6. Update Inventory.tsx and IssueEquipment.tsx to use `getCategoryLabels()` and `getVisibleCategories()`
