# Matager Surfaces — Device Screenshots Specification

This directory holds the 8 screenshot assets for the 4 devices in the fluid panoramic row:
1. `mobile`
2. `tablet`
3. `desktop`
4. `pos`

---

## 1. Directory & File Structure

Assets follow this naming pattern:

```text
public/surfaces/{lang}/{device}.webp
```

The 8 target files:
- `/public/surfaces/en/mobile.webp` (390 × 844 px)
- `/public/surfaces/en/tablet.webp` (768 × 1024 px)
- `/public/surfaces/en/desktop.webp` (1600 × 1000 px)
- `/public/surfaces/en/pos.webp` (1024 × 768 px)
- `/public/surfaces/ar/mobile.webp` (390 × 844 px, RTL layout)
- `/public/surfaces/ar/tablet.webp` (768 × 1024 px, RTL layout)
- `/public/surfaces/ar/desktop.webp` (1600 × 1000 px, RTL layout)
- `/public/surfaces/ar/pos.webp` (1024 × 768 px, RTL layout)

---

## 2. Checklist & Fallback Rule

| Device | Slot ID | Target Pixels | EN File | AR File |
| :--- | :--- | :--- | :---: | :---: |
| **Mobile Phone** | `mobile` | 390 × 844 | [ ] | [ ] |
| **Tablet** | `tablet` | 768 × 1024 | [ ] | [ ] |
| **Desktop Monitor** | `desktop` | 1600 × 1000 | [ ] | [ ] |
| **POS Terminal** | `pos` | 1024 × 768 | [ ] | [ ] |

- If an Arabic asset (`ar`) is not yet provided, the system automatically falls back to the English (`en`) variant.
- If both are `null`, the screen renders a clean dark empty surface using existing tokens with zero layout shift.

---

## 3. How to Activate an Image

Open `src/config/surfaces.config.ts` and set the `src` string for the device and language:

```typescript
// Example:
DEVICES_CONFIG.mobile.variants.ar.src = "/surfaces/ar/mobile.webp";
```
