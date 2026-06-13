# calendar-sync — Calendar Event Management

Manages calendar events with CRUD operations. Currently returns mock data (Google Calendar integration placeholder).

## Tools

| Tool | Description |
|------|-------------|
| `listEvents` | List calendar events (returns mock events) |
| `createEvent` | Create a new event with `--summary`, optional `--start` and `--end` |
| `updateEvent` | Update an event by `--id` |
| `deleteEvent` | Delete an event by `--id` |

## Usage

```bash
node modules/calendar-sync/run.mjs listEvents
node modules/calendar-sync/run.mjs createEvent --summary "Team Meeting" --start "2024-01-01T10:00:00Z"
node modules/calendar-sync/run.mjs updateEvent --id 1
node modules/calendar-sync/run.mjs deleteEvent --id 1
```

## Notes

- Currently returns mock data — Google Calendar API not yet integrated
- Uses caching (60s TTL)
