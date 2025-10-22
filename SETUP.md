# Tauri Starter - Setup Documentation

This project is a Tauri + React starter template with modern development tools and best practices.

## Features

### TanStack Query (React Query)
- **Version**: v5.90.5
- **Devtools**: Enabled in development (controlled via `.env`)
- **Configuration**: Custom defaults set in `src/main.tsx`
  - Retry: 1 attempt
  - Stale time: 5 minutes
  - Refetch on window focus: disabled

#### Usage Examples
- **Query Hook**: See `src/hooks/useGreeting.ts` for Tauri command integration
- **Database Hooks**: See `src/hooks/useDatabase.ts` for SQLite integration

### SQLite Database
- **Plugin**: `tauri-plugin-sql` v2.3.0
- **Location**: Database files stored in app data directory
- **Setup**: Initialized in `src/lib/database.ts`
- **Example Tables**: Users table with CRUD operations

#### Database API
```typescript
import { initDatabase, getUsers, insertUser } from './lib/database'

// Initialize database (happens automatically on first use)
await initDatabase()

// Get all users
const users = await getUsers()

// Insert a user
await insertUser('John Doe', 'john@example.com')
```

### ESLint
- **Version**: 9.38.0 (flat config format)
- **Configuration**: `eslint.config.js`
- **Plugins**:
  - TypeScript ESLint
  - React
  - React Hooks
  - React Refresh
  - Prettier integration

#### Scripts
```bash
bun run lint        # Check for linting errors
bun run lint:fix    # Auto-fix linting errors
```

### Prettier
- **Version**: 3.6.2
- **Configuration**: `.prettierrc`
- **Settings**:
  - No semicolons
  - Single quotes
  - Tab width: 2 spaces
  - Trailing commas: ES5
  - Line width: 80

#### Scripts
```bash
bun run format       # Format all files
bun run format:check # Check formatting without changes
```

### Environment Variables

#### Frontend (.env)
Variables must be prefixed with `VITE_` to be exposed to the client:

```env
VITE_API_URL=http://localhost:3000
VITE_ENABLE_DEVTOOLS=true
VITE_APP_TITLE=Tauri Starter
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

#### Backend (src-tauri/.env)
```env
DATABASE_URL=sqlite:./data.db
APP_NAME=Tauri Starter
LOG_LEVEL=info
```

Access in Rust:
```rust
use std::env;
let db_url = env::var("DATABASE_URL").unwrap_or_default();
```

## Project Structure

```
tauri-starter/
├── src/
│   ├── hooks/              # React Query hooks
│   │   ├── useGreeting.ts  # Example Tauri command hooks
│   │   └── useDatabase.ts  # SQLite database hooks
│   ├── lib/                # Utility libraries
│   │   └── database.ts     # SQLite database setup
│   ├── App.tsx
│   └── main.tsx            # React Query setup
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs          # Tauri setup, plugins, .env loading
│   │   └── main.rs
│   └── .env                # Backend environment variables
├── .env                    # Frontend environment variables
├── .prettierrc             # Prettier configuration
├── eslint.config.js        # ESLint configuration
└── package.json
```

## Development Scripts

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Type checking
bun run type-check

# Linting
bun run lint
bun run lint:fix

# Formatting
bun run format
bun run format:check

# Tauri commands
bun run tauri dev    # Start Tauri in development mode
bun run tauri build  # Build Tauri application
```

## Getting Started

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   cp src-tauri/.env.example src-tauri/.env
   ```

3. **Start development**
   ```bash
   bun run tauri dev
   ```

4. **Open TanStack Query Devtools**
   - Press the React Query icon in the bottom-left corner
   - Or set `VITE_ENABLE_DEVTOOLS=true` in `.env`

## TanStack Query + Tauri Examples

### Using a Mutation
```typescript
import { useGreetMutation } from './hooks/useGreeting'

function MyComponent() {
  const greetMutation = useGreetMutation()

  const handleGreet = () => {
    greetMutation.mutate('John', {
      onSuccess: (data) => {
        console.log('Greeting:', data)
      },
    })
  }

  return (
    <button onClick={handleGreet} disabled={greetMutation.isPending}>
      {greetMutation.isPending ? 'Loading...' : 'Greet'}
    </button>
  )
}
```

### Using a Query
```typescript
import { useUsers } from './hooks/useDatabase'

function UserList() {
  const { data: users, isLoading, error } = useUsers()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name} - {user.email}</li>
      ))}
    </ul>
  )
}
```

## TypeScript

The project uses TypeScript with strict mode enabled. Type checking runs as part of the build process.

## Notes

- **Database**: SQLite database is created automatically on first use
- **Devtools**: TanStack Query Devtools only load when enabled via environment variable
- **Linting**: Pre-configured with sensible defaults for React + TypeScript
- **Formatting**: Prettier runs automatically on save (if configured in your editor)
