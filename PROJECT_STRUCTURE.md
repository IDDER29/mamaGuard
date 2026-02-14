# MamaGuard - Project Structure

## 📁 Directory Overview

```
mama_ai/
├── app/                      # Next.js App Router
│   ├── (marketing)/         # Route group for marketing pages
│   │   └── page.tsx         # Landing page
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles & Tailwind config
│   └── favicon.ico
│
├── components/              # All React components
│   ├── common/              # Shared layout components
│   │   ├── Navigation.tsx
│   │   └── Footer.tsx
│   ├── sections/            # Landing page sections
│   │   ├── HeroSection.tsx
│   │   ├── ProblemSection.tsx
│   │   ├── SolutionSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   └── CTASection.tsx
│   └── ui/                  # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       └── index.ts         # Barrel exports
│
├── lib/                     # Utility functions & helpers
│   ├── utils.ts            # Common utilities (cn, formatters)
│   └── constants.ts        # App constants & config
│
├── types/                   # TypeScript type definitions
│   └── index.ts            # Shared types
│
├── hooks/                   # Custom React hooks (future)
│
├── public/                  # Static assets
│   └── images/
│
└── package.json

```

## 🎯 Key Principles

### 1. **Route Groups**
- `(marketing)` - Groups marketing pages without affecting URL structure
- Future: Add `(dashboard)`, `(auth)` groups as needed

### 2. **Component Organization**
- **`components/common/`** - Layout components used across multiple pages (Nav, Footer)
- **`components/sections/`** - Page-specific sections (Hero, CTA, etc.)
- **`components/ui/`** - Generic, reusable UI components (Button, Card, Input)

### 3. **Absolute Imports**
All imports use the `@/` alias for cleaner paths:
```tsx
import Button from "@/components/ui/Button";
import { formatPhoneNumber } from "@/lib/utils";
import type { Patient } from "@/types";
```

### 4. **Type Safety**
- All shared types live in `types/index.ts`
- Component-specific types can be co-located in component files

### 5. **Utilities & Constants**
- `lib/utils.ts` - Helper functions (cn, formatters, validators)
- `lib/constants.ts` - App-wide constants and configuration

## 🚀 Next Steps for Growth

When you're ready to add these features, here's the structure:

### Dashboard
```
app/
  dashboard/
    page.tsx              # Dashboard home
    patients/
      page.tsx           # Patient list
      [id]/page.tsx      # Patient details
    alerts/
      page.tsx           # Alerts view
    layout.tsx           # Dashboard layout
```

### Authentication
```
app/
  (auth)/
    signin/page.tsx
    signup/page.tsx
    layout.tsx           # Auth layout
```

### API Routes
```
app/
  api/
    patients/
      route.ts           # GET /api/patients
      [id]/route.ts      # GET /api/patients/:id
    vitals/
      route.ts
```

### Custom Hooks
```
hooks/
  useAuth.ts             # Authentication state
  usePatients.ts         # Patient data fetching
  useVitals.ts           # Vitals monitoring
```

## 📦 Dependencies

### Production
- `next` - React framework
- `react` & `react-dom` - UI library
- `clsx` & `tailwind-merge` - Utility for merging Tailwind classes

### Development
- `tailwindcss` (v4) - Styling framework
- `typescript` - Type safety
- `eslint` - Code linting

## 🎨 Styling Architecture

Using **Tailwind CSS v4** with CSS-based configuration:
- Theme configuration in `app/globals.css` using `@theme` directive
- Custom colors defined with oklch + hex fallbacks
- Utility classes explicitly defined for custom colors
- Dark mode enabled by default

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Notes

- Currently optimized for the landing page
- Structure scales easily for dashboard, auth, and API routes
- Follow the established patterns when adding new features
- Keep components small and focused on single responsibilities
