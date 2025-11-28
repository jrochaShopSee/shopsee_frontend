# Shopsee Frontend

A modern shoppable video commerce platform built with Next.js 15 that transforms any video into a seamless shopping experience. ShopSee enables brands, influencers, and creators to embed interactive product links directly in videos, revolutionizing how consumers engage with content.

## Overview

ShopSee empowers video commerce by allowing viewers to discover and purchase products directly within videos. The platform includes:

- **Shoppable Video Player** - Embed purchasable products at specific timestamps
- **AI-Driven Product Recognition** - Automatic product tagging and suggestions
- **Comprehensive CMS** - Full admin dashboard for content, products, and analytics
- **E-Commerce Integration** - Order management, customer tracking, and inventory
- **Real-Time Analytics** - Customizable dashboards with 20+ metrics
- **Live Chat** - Real-time messaging via SignalR

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15.0.2 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 RC, Tailwind CSS 3.4 |
| State Management | Zustand 5.0 |
| Forms | React Hook Form + Zod validation |
| HTTP Client | Axios |
| Real-Time | Microsoft SignalR |
| Video | HLS.js (adaptive streaming) |
| Charts | Recharts |
| Maps | React Leaflet + Heatmaps |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 10.5+

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API URL
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://localhost:7093
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Project Structure

```
app/
├── layout.tsx              # Root layout with LayoutProvider
├── page.tsx                # Landing page with video showcase
│
├── cms/                    # Protected admin routes
│   ├── home/               # Admin dashboard
│   ├── admin/
│   │   ├── videos/         # Video management (upload, edit, map products)
│   │   ├── products/       # Product catalog management
│   │   ├── brands/         # Brand management
│   │   ├── locations/      # Location/store management
│   │   ├── consents/       # Consent template management
│   │   ├── analytics/      # Analytics dashboards
│   │   ├── users/          # Admin user management
│   │   ├── payouts/        # Payout processing
│   │   └── ...
│   ├── chat/               # Real-time messaging
│   └── ecommerce/          # Orders & customers
│
├── shop/                   # Public shop pages
├── video/                  # Public video player
├── profile/                # User profile
├── pricing/                # Pricing page
├── try-now/                # Signup flow
├── shopify/                # Shopify OAuth callback
│
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── cms/                # CMS-specific components
│   ├── analytics/          # Dashboard components
│   ├── chat/               # Chat components
│   └── shared/             # Shared components
│
├── services/               # API service clients
│   ├── videosApi.ts
│   ├── adminProductsApi.ts
│   ├── ecommerceApi.ts
│   ├── analyticsApi.ts
│   ├── chatApi.ts
│   └── ...
│
├── store/                  # Zustand state stores
│   ├── mainStore.ts        # Shopify context
│   └── dashboardStore.ts   # Analytics state
│
├── types/                  # TypeScript definitions
├── hooks/                  # Custom React hooks
├── utils/                  # Utility functions
└── css/                    # Global styles
```

## Key Features

### Video Management

- Upload videos with automatic HLS streaming conversion
- Map products to specific timestamps in videos
- Generate shareable links with time-limited access
- Control fast-forward permissions and privacy settings
- Integrate consent forms and surveys

### Product Management

- Full CRUD operations for products
- Support for physical, digital, and downloadable products
- Pricing options: base, sale, compare, and donation pricing
- Inventory tracking with backorder support
- Shopify product import/sync
- AI-powered description generation

### E-Commerce

- Order management with status tracking
- Customer profiles and purchase history
- Order notes (internal and customer-facing)
- Tracking information updates
- CSV export for orders and customers

### Analytics Dashboard

- Create multiple custom dashboards
- 20+ available metrics including:
  - Video views and engagement
  - Product performance and sales
  - Quiz completion rates
  - Consent signature tracking
  - Subscription analytics
- Drag-and-drop metric positioning
- Per-metric filter persistence
- Multiple chart types (cards, line, bar, pie)

### Real-Time Chat

- Live messaging with SignalR WebSockets
- Message history and read status
- User blocking capabilities
- Connection management

## Architecture

### Layout System

The app uses a smart layout routing system:

- **CMS Routes** (`/cms/*`) - Protected admin layout with sidebar navigation
- **Shop Routes** (`/shop/*`) - Standalone shop pages
- **Public Routes** - Marketing pages with navbar/footer

### Authentication

- JWT Bearer token authentication
- Tokens stored in HTTP-only cookies
- Automatic token injection via Axios interceptors
- 401 response handling with automatic logout

### State Management

Two Zustand stores handle application state:

1. **mainStore** - Shopify shop context (session storage)
2. **dashboardStore** - Analytics dashboard state with Redux DevTools support

### API Integration

All API calls go through typed service classes:

```typescript
// Example: Fetch videos
const videos = await videosApi.getVideos({ page: 1, pageSize: 20 });

// Example: Create product
const result = await adminProductsApi.createProduct(productData);
```

## Integrations

### Shopify

- OAuth authentication flow
- Product catalog import
- Shop ID tracking for multi-store support

### Azure Blob Storage

- Media file hosting
- Optimized image delivery via Next.js Image component

### DocuSign

- Digital signature integration for consent forms
- Document preview and tracking

## UI Components

The project includes a custom UI component library:

- `Button` - Primary, secondary, outline variants
- `Card` - Elevated, bordered styles with hover effects
- `Dialog` - Modal dialogs
- `Input` / `Select` - Form controls
- `DatePicker` - Date selection
- `InfiniteScrollList` - Virtualized scrolling lists
- `Container` / `SectionHeader` - Layout components

## Performance Optimizations

- Virtual scrolling for large lists (react-virtuoso)
- Infinite scroll pagination
- Image optimization via Next.js
- Bundle optimization for lucide-react
- HLS adaptive bitrate streaming for videos

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Configuration

### Next.js Config

- Custom output directory: `next/`
- Compression enabled
- Remote image patterns configured for Azure Blob Storage

### TypeScript

- Strict mode enabled
- Path alias: `@/*` maps to project root

### Tailwind

Custom theme with:
- Primary (purple), secondary (blue), accent (amber), success (green) color palettes
- Custom spacing, shadows, and animations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

HLS.js provides video playback with fallback to native HLS on Safari.

## License

Proprietary - All rights reserved
