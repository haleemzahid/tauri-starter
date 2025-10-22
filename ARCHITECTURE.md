# Vertical Slice Architecture

This project uses **Vertical Slice Architecture** for maximum modularity and ease of development.

## 🎯 Core Principles

1. **Each feature is a self-contained slice** - Everything related to a feature lives in one place
2. **Use cases are explicit** - Each folder represents a specific user action
3. **Minimal shared code** - Only truly global utilities go in `core/`
4. **Easy to add, easy to remove** - Adding/removing features doesn't affect other code

## 📁 Project Structure

```
src/
├── slices/                      # All features organized by domain
│   ├── todos/                   # Example: Todos domain
│   │   ├── list-todos/          # Use case: View all todos
│   │   │   ├── ListTodos.tsx    # Page component
│   │   │   ├── TodoTable.tsx    # Table component (if needed)
│   │   │   ├── useListTodos.ts  # React Query hook
│   │   │   └── index.ts         # Exports
│   │   │
│   │   ├── create-todo/         # Use case: Create new todo
│   │   │   ├── TodoForm.tsx
│   │   │   ├── useCreateTodo.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── update-todo/         # Use case: Edit todo
│   │   │   ├── useUpdateTodo.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── delete-todo/         # Use case: Delete todo
│   │   │   ├── useDeleteTodo.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── toggle-todo-status/  # Use case: Toggle complete
│   │   │   ├── useToggleTodoStatus.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── shared/              # Todo-specific shared code
│   │   │   ├── types.ts         # Todo types
│   │   │   ├── database.ts      # Todo DB operations
│   │   │   └── constants.ts     # Todo constants
│   │   │
│   │   ├── config.ts            # Navigation config
│   │   └── index.ts             # Public API
│   │
│   └── users/                   # Another domain
│       ├── list-users/
│       ├── create-user/
│       └── ...
│
├── core/                        # Minimal shared infrastructure
│   ├── database/
│   │   └── client.ts           # DB connection only
│   ├── ui/                     # Design system components
│   │   ├── Layout.tsx
│   │   ├── Button.tsx
│   │   └── ...
│   └── types/
│       └── common.ts           # Only truly global types
│
├── config/
│   └── nav-items.ts            # Navigation configuration
│
└── routes/                     # TanStack Router files
    ├── __root.tsx
    ├── index.tsx
    └── todos.tsx
```

## 🚀 Creating a New Slice (Feature)

### Automatic Generation (Recommended)

Use the slice generator script:

```bash
node scripts/create-slice.js <slice-name> <use-case-1> [use-case-2] ...
```

**Examples:**

```bash
# Create a users slice with common CRUD operations
node scripts/create-slice.js users list create update delete

# Create a products slice with view
node scripts/create-slice.js products list create update delete view

# Create a settings slice with custom use cases
node scripts/create-slice.js settings manage-theme manage-profile
```

The generator creates:
- ✅ Folder structure
- ✅ TypeScript types
- ✅ Database functions
- ✅ React Query hooks
- ✅ Component templates
- ✅ Route file
- ✅ Navigation config

### After Generation

1. **Add database table** to `src/core/database/client.ts`:
   ```typescript
   await db.execute(`
     CREATE TABLE IF NOT EXISTS users (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL,
       email TEXT UNIQUE NOT NULL,
       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
     )
   `)
   ```

2. **Add to navigation** in `src/config/nav-items.ts`:
   ```typescript
   import { usersConfig } from '../slices/users/config'

   export const navItems: NavItem[] = [
     todosConfig,
     usersConfig, // Add here
   ]
   ```

3. **Implement your components and logic** in the generated files

## 📝 Manual Creation Guide

If you prefer manual creation, follow these steps:

### 1. Create the slice folder structure

```bash
mkdir -p src/slices/users/{list-users,create-user,update-user,delete-user,shared}
```

### 2. Create types in `shared/types.ts`

```typescript
export interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export interface CreateUserInput {
  name: string
  email: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
}
```

### 3. Create database functions in `shared/database.ts`

```typescript
import { getDatabase } from '../../../core/database/client'
import type { User, CreateUserInput, UpdateUserInput } from './types'

export async function getUsers() {
  const database = await getDatabase()
  return await database.select<User[]>(
    'SELECT * FROM users ORDER BY created_at DESC'
  )
}

export async function createUser(input: CreateUserInput) {
  const database = await getDatabase()
  return await database.execute(
    'INSERT INTO users (name, email) VALUES ($1, $2)',
    [input.name, input.email]
  )
}
// ... more functions
```

### 4. Create hooks for each use case

```typescript
// list-users/useListUsers.ts
import { useQuery } from '@tanstack/react-query'
import { getUsers } from '../shared/database'

export function useListUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })
}
```

### 5. Create components

```typescript
// list-users/ListUsers.tsx
import { useListUsers } from './useListUsers'

export default function ListUsers() {
  const { data: users = [], isLoading } = useListUsers()
  // ... component logic
}
```

### 6. Create public API in `index.ts`

```typescript
export { default as ListUsers } from './list-users/ListUsers'
export type { User, CreateUserInput, UpdateUserInput } from './shared/types'
export { useListUsers } from './list-users/useListUsers'
export { useCreateUser } from './create-user/useCreateUser'
```

### 7. Create config file

```typescript
// config.ts
import { Users } from 'lucide-react'

export const usersConfig = {
  label: 'Users',
  path: '/users',
  icon: Users,
}
```

### 8. Create route

```typescript
// src/routes/users.tsx
import { createFileRoute } from '@tanstack/react-router'
import { ListUsers } from '../slices/users'

export const Route = createFileRoute('/users')({
  component: ListUsers,
})
```

## 🎨 Benefits

### For AI Assistants
- Clear, predictable structure
- Each slice is independent
- Easy to find and modify code
- Minimal cross-file dependencies

### For Junior Developers
- No "where does this go?" questions
- Copy-paste a slice as template
- Each folder is self-documenting
- Safe to modify without breaking others

### For the Project
- Easy to add new features
- Easy to remove features (delete folder)
- Easy to understand what the app does
- Scales well as the project grows

## 📚 Examples

### Simple Slice (Settings)
```
settings/
├── manage-theme/
│   ├── ThemeSelector.tsx
│   └── useTheme.ts
├── manage-profile/
│   ├── ProfileForm.tsx
│   └── useUpdateProfile.ts
└── shared/
    └── types.ts
```

### Complex Slice (E-commerce Products)
```
products/
├── list-products/
│   ├── ListProducts.tsx
│   ├── ProductCard.tsx
│   ├── ProductFilters.tsx
│   └── useListProducts.ts
├── view-product/
│   ├── ViewProduct.tsx
│   ├── ProductDetails.tsx
│   └── useGetProduct.ts
├── create-product/
├── update-product/
├── delete-product/
├── manage-inventory/
└── shared/
    ├── types.ts
    ├── database.ts
    └── constants.ts
```

## 🔧 Tips

1. **Keep slices independent** - Don't import from other slices
2. **Only share what's truly global** - Most code stays in the slice
3. **Use descriptive use case names** - `list-todos` not just `list`
4. **One component per file** - Makes it easy to find things
5. **Keep the generator updated** - Modify it as your patterns evolve

## 🆘 Common Questions

**Q: Can I have nested slices?**
A: No, keep it flat. Use descriptive names instead: `orders-list`, `orders-refund`, etc.

**Q: Where do I put shared utilities?**
A: Only truly global ones go in `core/`. Slice-specific utilities go in `slices/[name]/shared/`.

**Q: Can slices talk to each other?**
A: Avoid it. If needed, move shared logic to `core/` or use events/state management.

**Q: What about shared components?**
A: Design system components go in `core/ui/`. Slice-specific components stay in the slice.
