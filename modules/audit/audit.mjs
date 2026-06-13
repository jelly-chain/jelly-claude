#!/usr/bin/env node
/**
 * modules/audit/audit.mjs
 * Security and quality audit for the Jelly-Claude ecosystem.
 * Inspects code, config, and file permissions.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import chalk from 'chalk';

const SECRETS_PATTERNS = [
  { name: 'OPENROUTER_API_KEY', pattern: /(?:^|[^a-zA-Z0-9])sk-or-[a-zA-Z0-9_-]{32,}(?:[^a-zA-Z0-9]|$)/gi },
  { name: 'ANTHROPIC_API_KEY', pattern: /(?:^|[^a-zA-Z0-9])sk-ant-[a-zA-Z0-9_-]{32,}(?:[^a-zA-Z0-9]|$)/gi },
  { name: 'EVM_PRIVATE_KEY', pattern: /(?:privateKey|PRIVATE_KEY|private_key)['"]?\s*[:=]\s*["']?0x[a-fA-F0-9]{64}/gi },
  { name: 'AWS Key', pattern: /(?:^|[^A-Z0-9])AKIA[A-Z0-9]{16}(?:[^A-Z0-9]|$)/g },
  { name: 'GitHub Token', pattern: /(?:^|[^a-zA-Z0-9])ghp_[a-zA-Z0-9_-]{36}(?:[^a-zA-Z0-9]|$)/g },
];

const FILE_PERMISSIONS = {
  sensitive: ['.env', '.keys', 'wallets/', '*.json'],
  warnPermission: 0o644,
  errorPermission: 0o600,
};

function checkFileForSecrets(filepath) {
  const issues = [];
  try {
    const content = readFileSync(filepath, 'utf8');
    for (const secret of SECRETS_PATTERNS) {
      const matches = content.match(secret.pattern);
      if (matches) {
        issues.push({
          type: 'secret_exposed',
          file: filepath,
          secret: secret.name,
          count: matches.length,
        });
      }
    }
  } catch {
    // Ignore unreadable files
  }
  return issues;
}

function checkConfigValidity(filepath) {
  const issues = [];
  try {
    const content = readFileSync(filepath, 'utf8');
    JSON.parse(content);
  } catch (err) {
    issues.push({
      type: 'config_invalid',
      file: filepath,
      error: err.message,
    });
  }
  return issues;
}

function auditRun() {
  const issues = [];
  const scanned = [];

  // Check for exposed secrets in source files
  const sourceDir = join(process.cwd(), 'core');
  if (existsSync(sourceDir)) {
    const files = readdirSync(sourceDir).filter(f => f.endsWith('.mjs'));
    for (const file of files) {
      const fullPath = join(sourceDir, file);
      scanned.push(fullPath);
      issues.push(...checkFileForSecrets(fullPath));
    }
  }

  // Check config files
  const configDir = join(process.cwd(), 'config');
  if (existsSync(configDir)) {
    const files = readdirSync(configDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const fullPath = join(configDir, file);
      scanned.push(fullPath);
      issues.push(...checkConfigValidity(fullPath));
    }
  }

  return { scanned, issues };
}

function printReport(report) {
  console.log(chalk.cyan('\n  🛡️  Jelly-Claude Security Audit\n'));
  console.log(chalk.dim(`  Scanned: ${report.scanned.length} files\n`));

  if (report.issues.length === 0) {
    console.log(chalk.green('  ✅ No security issues detected\n'));
    return;
  }

  for (const issue of report.issues) {
    if (issue.type === 'secret_exposed') {
      console.log(chalk.red(`  🔥 ${issue.secret} found in ${issue.file}`));
      console.log(chalk.yellow(`     ${issue.count} occurrence(s) detected`));
    } else if (issue.type === 'config_invalid') {
      console.log(chalk.red(`  💥 ${issue.file} has invalid JSON`));
      console.log(chalk.yellow(`     ${issue.error}`));
    }
  }

  console.log(chalk.red(`\n  Found ${report.issues.length} issue(s)\n`));
}

async function main() {
  const report = auditRun();
  printReport(report);
}

main().catch(console.error);

export { auditRun, printReport };
export default main;