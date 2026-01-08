# V2.0 Spec: Collections

**Goal:** User-curated quote bundles. Create, share, discover.

---

## Collections: Core Feature

### What Is A Collection?
A curated set of quotes around a theme, mood, or purpose.

Examples:
- "Quotes for hard days"
- "Morning motivation"
- "On letting go"
- "Best of Seneca"

### Data Model
```typescript
interface Collection {
  id: string;
  userId: string;
  title: string;
  description?: string;
  quoteIds: string[];
  visibility: 'private' | 'public';
  createdAt: Date;
  updatedAt: Date;
}

interface CollectionFollow {
  userId: string;
  collectionId: string;
  followedAt: Date;
}
```

### Database Schema
```sql
create table collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  quote_ids text[] not null default '{}',
  visibility text default 'private',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table collection_follows (
  user_id uuid references auth.users,
  collection_id uuid references collections,
  followed_at timestamptz default now(),
  primary key (user_id, collection_id)
);

-- Public collections are readable by all
create policy "Public collections are viewable"
  on collections for select
  using (visibility = 'public');

create policy "Users own their collections"
  on collections for all
  using (auth.uid() = user_id);
```

---

## UX Flow

### Creating a Collection
```
From any quote:
┌─────────────────────────────────────────┐
│  "We suffer more in imagination..."     │
│                                         │
│  [♡] [✎] [→] [+]  ← Add to collection   │
└─────────────────────────────────────────┘

Tap [+]:
┌─────────────────────────────────────────┐
│  Add to Collection                      │
│                                         │
│  ○ Quotes for hard days                 │
│  ○ Morning motivation                   │
│  ○ Best of Seneca                       │
│                                         │
│  [+ New Collection]                     │
└─────────────────────────────────────────┘

New Collection:
┌─────────────────────────────────────────┐
│  New Collection                         │
│                                         │
│  Title: [_____________________]         │
│  Description: [_______________]         │
│                                         │
│  ○ Private (just me)                    │
│  ● Public (anyone can find)             │
│                                         │
│  [Create]                               │
└─────────────────────────────────────────┘
```

### Managing Collections
```
Settings > My Collections:
┌─────────────────────────────────────────┐
│  My Collections                         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Quotes for hard days     🔒     │   │
│  │ 12 quotes                       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Morning motivation       🌐     │   │
│  │ 8 quotes · 23 followers         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [+ New Collection]                     │
└─────────────────────────────────────────┘
```

### Browsing Public Collections
```
Discover tab:
┌─────────────────────────────────────────┐
│  Discover Collections                   │
│                                         │
│  Popular                                │
│  ┌─────────────────────────────────┐   │
│  │ Stoic Essentials                │   │
│  │ by @marcus · 156 followers      │   │
│  │ The best of stoic philosophy    │   │
│  │                      [Follow]   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  New                                    │
│  ┌─────────────────────────────────┐   │
│  │ Quotes on Grief                 │   │
│  │ by @sarah · 12 followers        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Using a Collection
```
From My Collections or Following:
┌─────────────────────────────────────────┐
│  ← Quotes for hard days                 │
│  12 quotes · Private                    │
│                                         │
│  [▶ Start Journey]  [⋮ Options]         │
│                                         │
│  "Quote 1 preview..."                   │
│  "Quote 2 preview..."                   │
│  "Quote 3 preview..."                   │
└─────────────────────────────────────────┘

"Start Journey" = use this collection as a custom journey
```

---

## Integration with Journeys

Collections can become personal journeys:

```typescript
interface Journey {
  // ... existing fields
  type: 'preset' | 'collection';
  collectionId?: string;  // If type === 'collection'
}
```

When starting a journey from collection:
- Duration = number of quotes in collection
- One quote per day from collection
- Same journey tracking as preset journeys

---

## User Stories (Ralph-able)

### Core
- US-C01: Create collections table in Supabase
- US-C02: Create collection_follows table in Supabase
- US-C03: Add "Add to collection" button on quote display
- US-C04: Create "Add to collection" modal
- US-C05: Create "New collection" form
- US-C06: Create My Collections page
- US-C07: Create Collection detail page
- US-C08: Implement add quote to collection
- US-C09: Implement remove quote from collection
- US-C10: Implement delete collection
- US-C11: Implement edit collection (title, description, visibility)

### Discovery
- US-C12: Create Discover page
- US-C13: Implement popular collections query
- US-C14: Implement new collections query
- US-C15: Implement follow collection
- US-C16: Implement unfollow collection
- US-C17: Show followed collections in My Collections

### Journey Integration
- US-C18: Extend Journey type for collections
- US-C19: Add "Start Journey" button on collection
- US-C20: Implement collection-based journey flow

---

## Future Maybe (Parked)

These are interesting but not V2.0:

### Quote Submissions
- Users submit quotes for approval
- Auto-approve with community reporting
- Moderation queue for flagged quotes

### Public Journals
- Anonymous reflection sharing
- "See what others wrote about this quote"
- Opt-in per reflection or account-wide

### Admin Panel
- Quote CRUD
- User management
- Analytics dashboard
- Moderation tools

---

## Open Questions

- Display name for public collections? (username, anon ID, or real name)
- Minimum quotes for public collection? (prevent spam)
- Featured/staff-picked collections?
