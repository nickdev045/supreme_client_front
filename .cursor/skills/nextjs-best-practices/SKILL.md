---
name: nextjs-best-practices
description: Primary guide for building production Next.js App Router applications with React component patterns, state management, performance, accessibility, testing, and routing.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Next.js Best Practices

> Principles for Next.js App Router development.

---

## 1. Server vs Client Components

### Decision Tree

```
Does it need...?
│
├── useState, useEffect, event handlers
│   └── Client Component ('use client')
│
├── Direct data fetching, no interactivity
│   └── Server Component (default)
│
└── Both? 
    └── Split: Server parent + Client child
```

### By Default

| Type | Use |
|------|-----|
| **Server** | Data fetching, layout, static content |
| **Client** | Forms, buttons, interactive UI |

### Component Discipline

- Keep one responsibility per component; prefer composition over inheritance.
- Keep client components small and place them beneath Server Component parents.
- Pass data down through typed props and send events upward through callbacks or server actions.
- Extract a custom hook only when behavior is reused or obscures the component's responsibility.
- Use compound components for related UI such as tabs, menus, and dialogs when they simplify the public API.

---

## 2. Data Fetching Patterns

### Fetch Strategy

| Pattern | Use |
|---------|-----|
| **Default** | Static (cached at build) |
| **Revalidate** | ISR (time-based refresh) |
| **No-store** | Dynamic (every request) |

### Data Flow

| Source | Pattern |
|--------|---------|
| Database | Server Component fetch |
| API | fetch with caching |
| User input | Client state + server action |

### State Selection

| Need | Default |
|------|---------|
| Component-local interaction | `useState` or `useReducer` |
| Shared subtree state | Context with a focused provider |
| Client-side server cache | TanStack Query or SWR |
| Complex cross-route client state | Zustand or Redux Toolkit |

Do not duplicate Server Component data in a client store. Use a client cache only when the browser must refetch, poll, update optimistically, or coordinate real-time state.

---

## 3. Routing Principles

### File Conventions

| File | Purpose |
|------|---------|
| `page.tsx` | Route UI |
| `layout.tsx` | Shared layout |
| `loading.tsx` | Loading state |
| `error.tsx` | Error boundary |
| `not-found.tsx` | 404 page |

### Route Organization

| Pattern | Use |
|---------|-----|
| Route groups `(name)` | Organize without URL |
| Parallel routes `@slot` | Multiple same-level pages |
| Intercepting `(.)` | Modal overlays |

---

## 4. API Routes

### Route Handlers

| Method | Use |
|--------|-----|
| GET | Read data |
| POST | Create data |
| PUT/PATCH | Update data |
| DELETE | Remove data |

### Best Practices

- Validate input with Zod
- Return proper status codes
- Handle errors gracefully
- Use Edge runtime only when its runtime constraints and dependencies are compatible

---

## 5. Performance Principles

### Image Optimization

- Use next/image component
- Set priority for above-fold
- Provide blur placeholder
- Use responsive sizes

### Bundle Optimization

- Dynamic imports for heavy components
- Route-based code splitting (automatic)
- Analyze with bundle analyzer
- Optimize only after measuring with React DevTools, Lighthouse, or production telemetry.

### Accessibility and Interaction

- Use semantic HTML before ARIA; every form control needs a visible label.
- Provide keyboard navigation, visible focus states, and meaningful loading, empty, and error states.
- Respect `prefers-reduced-motion` and prevent layout shift by reserving space for asynchronous content.

---

## 6. Metadata

### Static vs Dynamic

| Type | Use |
|------|-----|
| Static export | Fixed metadata |
| generateMetadata | Dynamic per-route |

### Essential Tags

- title (50-60 chars)
- description (150-160 chars)
- Open Graph images
- Canonical URL

---

## 7. Caching Strategy

### Cache Layers

| Layer | Control |
|-------|---------|
| Request | fetch options |
| Data | revalidate/tags |
| Full route | route config |

### Revalidation

| Method | Use |
|--------|-----|
| Time-based | `revalidate: 60` |
| On-demand | `revalidatePath/Tag` |
| No cache | `no-store` |

---

## 8. Server Actions

### Use Cases

- Form submissions
- Data mutations
- Revalidation triggers

### Best Practices

- Mark with 'use server'
- Validate all inputs
- Return typed responses
- Handle errors
- Use `useActionState` for submission state and `useOptimistic` only when rollback behavior is defined.
- Revalidate the affected path or tag after a successful mutation.

---

## 9. React Quality and Testing

- Type component props explicitly; avoid `any` and untyped server-action results.
- Use error boundaries for recoverable route failures and define a recovery path.
- Test business behavior with `javascript-testing-patterns`; cover critical browser journeys with `e2e-testing-patterns`.
- Keep selectors stable and test accessible roles and labels rather than implementation details.

---

## 10. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| 'use client' everywhere | Server by default |
| Fetch in client components | Fetch in server |
| Skip loading states | Use loading.tsx |
| Ignore error boundaries | Use error.tsx |
| Large client bundles | Dynamic imports |
| Duplicate server data in a global store | Use Server Components or a client query cache when browser behavior requires it |

---

## 11. Project Structure

```
app/
├── (marketing)/     # Route group
│   └── page.tsx
├── (dashboard)/
│   ├── layout.tsx   # Dashboard layout
│   └── page.tsx
├── api/
│   └── [resource]/
│       └── route.ts
└── components/
    └── ui/
```

---

> **Remember:** Server Components are the default for a reason. Start there, add client only when needed.
