# SDK Integration Guide

Jelly-Claude v2 integrates the `market-prediction-sdk-v2` (package: `wmarket-prediction-sdk`) through the `core/` layer.

## Architecture

```
Claude Code session
       │
       ▼
  /agent jelly-predictions-agent
       │
       ▼
  modules/prediction-markets/run.mjs   ← any module
       │
       ▼
  core/prediction.mjs   ←─────────────── JellyPredictor
  core/signals.mjs      ←─────────────── KeywordTrigger / ThresholdTrigger / EventTrigger
  core/anomaly.mjs      ←─────────────── VolumeSpikeDetector / TVLShockDetector
  core/risk.mjs         ←─────────────── RiskAssessor / ConfidenceEngine
  core/audit.mjs        ←─────────────── AuditLog
  core/metrics.mjs      ←─────────────── MetricsCollector
  core/events.mjs       ←─────────────── JellyEventBus
  core/cache.mjs        ←─────────────── CacheManager
  core/circuit-breaker.mjs ←──────────── CircuitBreaker
  core/queue.mjs        ←─────────────── TaskQueue / RetryQueue
```

## Using `predict` in any module

```javascript
import { predict } from '../../core/prediction.mjs';

const result = await predict({
  text:   'Solana TVL surge breakout ath',
  chain:  'solana',
  market: 'polymarket-sol-tvl-q4',
});

console.log(result.jellyScore);  // 0–100
console.log(result.signal);      // 'bullish' | 'bearish' | 'neutral'
console.log(result.confidence);  // 0.0–1.0
console.log(result.riskScore);   // 0.0–1.0
console.log(result.suggestion);  // 'Full position on YES'
```

## Automated signal pipeline

```javascript
import { getKeywordTrigger } from '../../core/signals.mjs';
import { bus } from '../../core/events.mjs';

const trigger = getKeywordTrigger({ minScore: 65 });

// Auto-fire when Jelly Score >= 65
bus.onSignal(async signal => {
  if (signal.prediction.jellyScore >= 65) {
    // Hand off to predict-fun-trader or polymarket-trader agent
    console.log('Trade signal:', signal.prediction);
  }
});

// Evaluate any text
await trigger.evaluate('Solana ETF approval breakout', { chain: 'solana' });
```

## Risk-gating trades

```javascript
import { getRiskAssessor } from '../../core/risk.mjs';

const assessor = getRiskAssessor({ profile: 'balanced' });
const assessment = assessor.assess(prediction, { leverage: 1 });

if (assessment.ok) {
  console.log(`✅ Trade at ${assessment.sizePct}% position size`);
} else {
  console.log(`❌ Blocked: ${assessment.reason}`);
}
```

## Jelly Score → Strategy mapping

| Jelly Score | Action |
|-------------|--------|
| 80–100 | Full position size (up to 5% of balance) |
| 60–79 | Half position size (up to 2.5% of balance) |
| 0–59 | No trade |

This is enforced automatically by `RiskAssessor` using `config/strategies.json`.

## Adding the SDK package (optional)

If you have the `market-prediction-sdk-v2` built locally:

```bash
# From the jelly-claude directory
npm install ../market-prediction-sdk-v2
```

Then in `core/prediction.mjs`, replace the internal JellyPredictor with:

```javascript
import { WMarketPredictor } from 'wmarket-prediction-sdk';
```

The interface is identical — all modules continue to work without changes.
