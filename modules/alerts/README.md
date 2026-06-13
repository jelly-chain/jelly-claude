# alerts module

Threshold alert system — fire, view, and configure alerts across all agents.

## Usage

```bash
node modules/alerts/run.mjs status
node modules/alerts/run.mjs test --type volume_spike --severity high --token SOL
node modules/alerts/run.mjs history --n 50
node modules/alerts/run.mjs config --minSeverity high
```
