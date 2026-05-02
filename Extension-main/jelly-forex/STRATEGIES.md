# Jelly-Forex — Trading Strategy Playbooks

Step-by-step strategies that combine multiple agents and skills.  
Each playbook shows exactly which agents to invoke and in what order.

**Paper/practice trading applies to all playbooks by default. Confirm live trading intent explicitly.**

---

## Strategy 1: Earnings Momentum Play

**Goal:** Buy a stock 2–3 days before earnings after confirming 3+ consecutive beats, take profit on the gap.

**Agents:** `fundamentals-analyst` → `stock-trader`

**Steps:**
1. Start `fundamentals-analyst` and ask: *"Show me the last 8 quarters of earnings for [SYMBOL]. How many consecutive beats? What's the average surprise %?"*
2. If 3+ consecutive beats with average surprise > 5%, this is a candidate.
3. Check the technicals: *"Is the stock above the 50 SMA and is RSI between 40–65?"*
4. Ask `fundamentals-analyst`: *"When is the next earnings date?"*
5. If earnings are 2–5 days away, switch to `stock-trader`.
6. Calculate position size: 1% risk with stop at 5% below entry.
7. Place bracket order: buy at market, stop –5%, target +8%.
8. Decide: hold through earnings (gap risk) or sell day before (safer).

**Key rules:**
- Never hold through earnings without explicit intent — implied move can work against you
- Check IV via `options-scanner` before earnings — if IV is already elevated, the stock may be "priced in"
- Close the position if the stock gaps down more than 3% before earnings

---

## Strategy 2: Forex Momentum + SMA Crossover

**Goal:** Ride a currency trend using daily SMA crossover confirmation with H1 entry.

**Agents:** `forex-trader`

**Steps:**
1. Start `forex-trader` (practice mode) and ask: *"What is the SMA crossover signal on EUR/USD, GBP/USD, and USD/JPY on the daily chart?"*
2. Select the pair with the cleanest trend (20 SMA clearly above/below 50 SMA).
3. Zoom to H1: *"Show me the H1 candles — is there a pullback to the 20 SMA? Is RSI between 40–60?"*
4. Wait for the H1 pullback entry: *"Place a limit buy at the H1 20 SMA level with a 25-pip stop."*
5. Position size: 1% account risk.
6. Target: 2× risk (50 pips if stop is 25 pips).
7. Trail the stop to break-even once trade is +20 pips in profit.

**Key rules:**
- Only trade in the direction of the daily trend — never fight the higher timeframe
- Avoid trading within 30 minutes of major news events (NFP, FOMC, CPI)
- Check the spread before entry — avoid trading EUR/USD at the Sunday open when spreads are 5–10 pips

---

## Strategy 3: Covered Call Writing

**Goal:** Generate income from an existing stock position by selling call options against it.

**Agents:** `options-scanner` → `stock-trader`

**Steps:**
1. In `stock-trader`, confirm you hold at least 100 shares of a stock (one covered call = 100 shares minimum).
2. Switch to `options-scanner`: *"Show me the options chain for [SYMBOL] expiring in 25–35 days. What is the delta 0.30 call?"*
3. The delta 0.30 call represents approximately a 30% chance of assignment — a good balance of premium vs risk.
4. Check the premium: *"What is the bid/ask on the [STRIKE] call for [EXPIRY]? What is the annualised yield?"*
5. If premium > 1% of stock price per month (12% annualised), this is worth considering.
6. Before selling: confirm you're comfortable being called away at the strike price.
7. Use `stock-trader` to place the covered call sell order.
8. Set a reminder to manage or roll the position 7 days before expiry.

**Key rules:**
- Only sell calls against shares you genuinely want to hold long-term
- Don't sell calls into earnings — IV spike rewards the option buyer, not seller
- If the stock rallies sharply past the strike, roll the call up and out rather than letting it expire assigned unless you want to sell

---

## Strategy 4: Fundamental Value Screener

**Goal:** Find quality stocks trading below fair value using a combination of P/E, earnings growth, and DCF.

**Agents:** `fundamentals-analyst`

**Steps:**
1. Start `fundamentals-analyst` and ask: *"Screen these 20 stocks [list] for P/E under 20, forward P/E under 18, and 3-year revenue CAGR above 10%."*
2. For any stock that passes the screen, run a full analysis: *"Build a DCF for [SYMBOL] using 10% FCF growth and 9% WACC."*
3. Calculate margin of safety: *"Current price is $X. If intrinsic value is $Y, margin of safety = (Y−X)/Y × 100%."*
4. Target stocks with > 20% margin of safety.
5. Confirm earnings trend: *"Has [SYMBOL] beaten earnings estimates in 3+ of the last 4 quarters?"*
6. Check the balance sheet: *"Is debt/equity below 1.0? Does the company have positive free cash flow?"*
7. If all checks pass, shortlist as a buy candidate and move to `stock-trader` to size and enter.

**Key rules:**
- Value traps are real — a cheap stock can stay cheap for years; require a near-term catalyst
- Never initiate a position within 2 weeks of earnings unless the thesis is specifically an earnings play
- Use the 1% risk rule regardless of how confident you are in the fundamental case
- Set a 12-month price target and re-evaluate at each quarterly earnings report
