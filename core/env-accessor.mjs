// core/env-accessor.mjs — safe, validated environment access
// Replaces direct process.env access throughout the codebase

import { validateSecret } from './secret-validator.mjs';
import { createLogger } from './logger.mjs';

const log = createLogger('env-accessor');

// Safe getters that validate on access
export function safeEnv(key, fallback = undefined) {
  const value = process.env[key];
  if (value === undefined) return fallback;
  
  // Validate known secrets
  const validation = validateSecret(key);
  if (!validation.ok) {
    log.warn(`Environment validation warning for ${key}`, { error: validation.error });
  }
  
  return value;
}

export function safeRequireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  const validation = validateSecret(key);
  if (!validation.ok) {
    log.error(`Invalid ${key} format: ${validation.error}`);
    // Still return the value - let caller decide if fatal
  }
  
  return value;
}

// Specific safe accessors for critical keys
export function getOpenRouterKey() {
  return safeEnv('OPENROUTER_API_KEY', '');
}

export function getAnthropicKey() {
  return safeEnv('ANTHROPIC_API_KEY', '');
}

export function getTelegramToken() {
  return safeEnv('TELEGRAM_BOT_TOKEN', '');
}

export function getTelegramChatId() {
  return safeEnv('TELEGRAM_CHAT_ID', '');
}

export function getAlchemyKey() {
  return safeEnv('ALCHEMY_API_KEY', '');
}

// Initialize and validate on import
export function initEnvValidation() {
  const critical = ['OPENROUTER_API_KEY', 'ANTHROPIC_API_KEY', 'ALCHEMY_API_KEY'];
  const warnings = [];
  
  for (const key of critical) {
    const val = process.env[key];
    if (val) {
      const validation = validateSecret(key);
      if (!validation.ok) warnings.push(`${key}: ${validation.error}`);
    }
  }
  
  if (warnings.length > 0) {
    log.warn('Environment validation warnings on startup', { warnings });
  }
}

// Auto-initialize
initEnvValidation();

export default { safeEnv, safeRequireEnv, getOpenRouterKey, getAnthropicKey };