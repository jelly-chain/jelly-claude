/**
 * Jelly x402 BNB SDK for TypeScript/JavaScript
 *
 * HTTP 402 autonomous payments on BNB Chain (BSC).
 * Chain ID 56 (mainnet) | 97 (testnet)
 * Supports: BNB (native), USDT, USDC, BUSD (BEP-20)
 *
 * Quick start:
 *   import { BNBX402Client, BNBWallet } from '@jelly-chain/bnb-sdk';
 *
 *   const wallet = BNBWallet.fromPrivateKey(process.env.BNB_PRIVATE_KEY!);
 *   const client = new BNBX402Client({ apiKey: process.env.JELLY_API_KEY! });
 *   client.setWallet(wallet);
 *
 *   const response = await client.request('https://api.example.com/premium');
 *   console.log(response.data);
 *
 * @packageDocumentation
 */

export * from './client';
export * from './errors';
export * from './types';
export * from './middleware';
export * from './wallet';
