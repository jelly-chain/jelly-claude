# Sports Betting Skill

Teach Claude to research sports markets and identify value bets on Polymarket/Kalshi.

## Supported Sports & Data Sources

| Sport | Provider | Free Tier |
|-------|----------|-----------|
| NBA, NFL, MLB, NHL | BallDontLie | 5 req/min |
| Football (soccer) | football-data.org | 10 req/min |
| All major sports | api-sports.io | 100 req/day |
| Odds (all sports) | The Odds API | 500 req/month |

## Workflow

1. Fetch live odds from The Odds API
2. Identify Polymarket/Kalshi equivalent markets
3. Compare implied probabilities across platforms
4. Apply Jelly prediction model to historical stats
5. Flag markets with edge ≥ 5 percentage points

## Required Keys

```
BALLDONTLIE_API_KEY=    # https://app.balldontlie.io
SPORTS_API_KEY=         # https://dashboard.api-sports.io
FOOTBALL_DATA_API_KEY=  # https://football-data.org
ODDS_API_KEY=           # https://the-odds-api.com
```

## Common Operations

```
/sports upcoming --sport nfl --hours 48
/sports odds --event "SuperBowl" --bookmakers draftkings,fanduel
/sports compare --event "ManCity vs Arsenal" --platforms polymarket,kalshi
/sports value --sport nba --minEdge 5
/sports score --eventId <id>
```
