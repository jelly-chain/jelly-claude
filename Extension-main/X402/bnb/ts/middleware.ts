/**
 * Jelly x402 BNB Express Middleware
 * Protect API endpoints with HTTP 402 responses requiring BNB Chain payments.
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { BNBCurrency } from './types';
import { BNBX402Client } from './client';

export interface BNBPaymentConfig {
  amount: number;
  currency?: BNBCurrency;
  recipient: string;
  expiresIn?: number;
  memo?: string;
}

export interface BNBMiddlewareConfig {
  apiKey: string;
  baseUrl?: string;
  recipient: string;
  chainId?: number;
  network?: 'mainnet' | 'testnet';
  verifyPayments?: boolean;
  onPaymentReceived?: (payment: BNBPaymentInfo, req: Request) => void | Promise<void>;
  onPaymentFailed?: (error: Error, req: Request) => void | Promise<void>;
}

export interface BNBPaymentInfo {
  txHash: string;
  reference: string;
  amount: number;
  currency: BNBCurrency;
  sender?: string;
  chainId: number;
  verifiedAt: Date;
}

const usedReferences = new Set<string>();

export function createBNBMiddleware(config: BNBMiddlewareConfig) {
  const client = new BNBX402Client({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    chainId: config.chainId || 56,
    network: config.network || 'mainnet',
  });

  function requirePayment(
    amount: number,
    options: Partial<BNBPaymentConfig> = {}
  ): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const txHash = req.headers['x-402-payment-txhash'] as string;
      const reference = req.headers['x-402-payment-reference'] as string;
      const chainId = parseInt(req.headers['x-402-chain-id'] as string || '56', 10);

      if (txHash && reference) {
        if (usedReferences.has(reference)) {
          return res.status(402).json({
            error: 'Payment reference already used',
            code: 'REPLAY_ATTACK',
          });
        }

        if (config.verifyPayments !== false) {
          try {
            const verification = await client.verify({
              txHash,
              reference,
              expectedAmount: amount,
              expectedRecipient: options.recipient || config.recipient,
              currency: options.currency || 'BNB',
            });

            if (!verification.verified) {
              if (config.onPaymentFailed) {
                await config.onPaymentFailed(new Error('Payment verification failed'), req);
              }
              return res.status(402).json({
                error: 'Payment verification failed',
                code: 'VERIFICATION_FAILED',
              });
            }

            usedReferences.add(reference);

            const paymentInfo: BNBPaymentInfo = {
              txHash,
              reference,
              amount: verification.transaction.amount,
              currency: verification.transaction.currency,
              sender: verification.transaction.sender,
              chainId: verification.transaction.chainId,
              verifiedAt: new Date(),
            };

            (req as any).x402Payment = paymentInfo;

            if (config.onPaymentReceived) {
              await config.onPaymentReceived(paymentInfo, req);
            }

            return next();
          } catch (error) {
            if (config.onPaymentFailed) {
              await config.onPaymentFailed(error as Error, req);
            }
            return res.status(402).json({
              error: 'Payment verification error',
              code: 'VERIFICATION_ERROR',
              message: (error as Error).message,
            });
          }
        } else {
          usedReferences.add(reference);
          (req as any).x402Payment = {
            txHash,
            reference,
            amount,
            currency: options.currency || 'BNB',
            chainId,
            verifiedAt: new Date(),
          };
          return next();
        }
      }

      const ref = generateReference();
      const expiresIn = options.expiresIn || 600;
      const expires = Math.floor(Date.now() / 1000) + expiresIn;
      const resolvedChainId = config.chainId || 56;

      res.setHeader('X-402-Version', '1.0');
      res.setHeader('X-402-Amount', amount.toString());
      res.setHeader('X-402-Currency', options.currency || 'BNB');
      res.setHeader('X-402-Recipient', options.recipient || config.recipient);
      res.setHeader('X-402-Reference', ref);
      res.setHeader('X-402-Expires', expires.toString());
      res.setHeader('X-402-Chain-Id', resolvedChainId.toString());
      res.setHeader('X-402-Network', config.network || 'mainnet');

      return res.status(402).json({
        error: 'Payment Required',
        code: 'PAYMENT_REQUIRED',
        chain: 'BNB Chain (BSC)',
        chainId: resolvedChainId,
        payment: {
          amount,
          currency: options.currency || 'BNB',
          recipient: options.recipient || config.recipient,
          reference: ref,
          expires,
          memo: options.memo,
        },
        instructions: [
          '1. Send the exact payment to the recipient address on BNB Chain.',
          '2. Retry your request with headers:',
          '   X-402-Payment-TxHash: <your_tx_hash>',
          '   X-402-Payment-Reference: <reference>',
          '   X-402-Chain-Id: ' + resolvedChainId,
        ].join('\n'),
      });
    };
  }

  function optionalPayment(
    amount: number,
    options: Partial<BNBPaymentConfig> = {}
  ): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const txHash = req.headers['x-402-payment-txhash'] as string;
      if (txHash) {
        return requirePayment(amount, options)(req, res, next);
      }
      (req as any).x402Payment = null;
      (req as any).x402PaymentAvailable = {
        amount,
        currency: options.currency || 'BNB',
        recipient: options.recipient || config.recipient,
        chainId: config.chainId || 56,
      };
      return next();
    };
  }

  return { requirePayment, optionalPayment, client };
}

function generateReference(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 15);
  return `bnbpay_${ts}${rand}`;
}

export function getPaymentInfo(req: Request): BNBPaymentInfo | null {
  return (req as any).x402Payment || null;
}

export function isPaid(req: Request): boolean {
  return !!(req as any).x402Payment;
}
