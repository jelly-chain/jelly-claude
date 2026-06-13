# Jelly-Core Skill

This skill gives Claude knowledge of Jelly-Claude's core modules, Jelly Score system, and multi-chain trading framework.

## Jelly Score

The Jelly Score (0–100) is the primary signal quality metric:

| Score | Meaning | Action |
|-------|---------|--------|
| 80–100 | Strong signal | Full position size |
| 60–79 | Moderate signal | Half position size |
| 0–59 | Weak signal | Do not trade |

## Core Modules

- `core/prediction.mjs` — JellyPredictor: keyword scoring, confidence, edge score, market divergence
- `core/risk.mjs` — RiskAssessor + ConfidenceEngine: profile-based risk gating
- `core/proxy-guard.mjs` — Port management for the OpenRouter proxy
- `core/shell.mjs` — Cross-platform shell execution

## Supported Chains

solana, bnb, polygon, base, ethereum, arbitrum, avalanche

## Usage

```
/predict --text "Solana TVL surge" --chain solana
/score --market <market-id>
/risk --profile aggressive
```
