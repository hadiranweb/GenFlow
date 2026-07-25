# GenFlow DB

Database client library for GenFlow applications.

## Usage

```typescript
import { createDbClient } from '@genflow/db'

const db = createDbClient({
  url: process.env.DATABASE_URL,
  maxConnections: 10
})

await db.query('SELECT * FROM users')
```
