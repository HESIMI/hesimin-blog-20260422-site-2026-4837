# Data Model (SQLite)

## Tag
- `id`: Int, primary key, auto increment
- `name`: String, unique
- `count`: Int, vote count
- `isDefault`: Boolean, whether this is a built-in tag
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Message
- `id`: Int, primary key, auto increment
- `type`: Enum (`SUGGESTION` | `WHISPER`)
- `content`: String
- `isAnonymous`: Boolean
- `isRead`: Boolean
- `createdAt`: DateTime
