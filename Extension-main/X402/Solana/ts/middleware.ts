/**
 * X402 Express Middleware
 * Protect your API endpoints with 402 Payment Required responses.
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { X402Headers } from './types';
import { X402Client } from './client';

export interface PaymentConfig {
  amount: number;
  currency?: 'SOL' | 'USDC';
  recipient: string;
  expiresIn?: number;
  memo?: string;
}

export interface MiddlewareConfig {
  apiKey: string;
  baseUrl?: string;
  recipient: string;
  verifyPayments?: boolean;
  onPaymentReceived?: (payment: PaymentInfo, req: Request) => void | Promise<void>;
  onPaymentFailed?: (error: Error, req: Request) => void | Promise<void>;
}

export interface PaymentInfo {
  signature: string;
  reference: string;
  amount: number;
  currency: string;
  sender?: string;
  verifiedAt: Date;
}

const usedReferences = new Set<string>();

export function createX402Middleware(config: MiddlewareConfig) {
  const client = new X402Client({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
  });

  function requirePayment(amount: number, options: Partial<PaymentConfig> = {}): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const paymentSignature = req.headers['x-402-payment-signature'] as string;
      const paymentReference = req.headers['x-402-payment-reference'] as string;

      if (paymentSignature && paymentReference) {
        if (usedReferences.has(paymentReference)) {
          return res.status(402).json({
            error: 'Payment reference already used',
            code: 'REPLAY_ATTACK',
          });
        }

        if (config.verifyPayments !== false) {
          try {
            const verification = await client.verify({
              signature: paymentSignature,
              reference: paymentReference,
              expectedAmount: amount,
              expectedRecipient: options.recipient || config.recipient,
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

            usedReferences.add(paymentReference);

            const paymentInfo: PaymentInfo = {
              signature: paymentSignature,
              reference: paymentReference,
              amount: verification.transaction.amount,
              currency: verification.transaction.currency,
              sender: verification.transaction.sender,
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
          usedReferences.add(paymentReference);
          (req as any).x402Payment = {
            signature: paymentSignature,
            reference: paymentReference,
            amount,
            currency: options.currency || 'SOL',
            verifiedAt: new Date(),
          };
          return next();
        }
      }

      const reference = generateReference();
      const expiresIn = options.expiresIn || 600;
      const expires = Math.floor(Date.now() / 1000) + expiresIn;

      const headers: X402Headers = {
        'X-402-Version': '1.0',
        'X-402-Amount': amount.toString(),
        'X-402-Currency': options.currency || 'SOL',
        'X-402-Recipient': options.recipient || config.recipient,
        'X-402-Reference': reference,
        'X-402-Expires': expires.toString(),
      };

      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      return res.status(402).json({
        error: 'Payment Required',
        code: 'PAYMENT_REQUIRED',
        payment: {
          amount,
          currency: options.currency || 'SOL',
          recipient: options.recipient || config.recipient,
          reference,
          expires,
          memo: options.memo,
        },
        instructions: 'Send payment to the recipient address and retry with X-402-Payment-Signature and X-402-Payment-Reference headers',
      });
    };
  }

  function optionalPayment(amount: number, options: Partial<PaymentConfig> = {}): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const paymentSignature = req.headers['x-402-payment-signature'] as string;
      
      if (paymentSignature) {
        return requirePayment(amount, options)(req, res, next);
      }

      (req as any).x402Payment = null;
      (req as any).x402PaymentAvailable = {
        amount,
        currency: options.currency || 'SOL',
        recipient: options.recipient || config.recipient,
      };
      
      return next();
    };
  }

  return {
    requirePayment,
    optionalPayment,
    client,
  };
}

function generateReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `pay_${timestamp}${random}`;
}

export function getPaymentInfo(req: Request): PaymentInfo | null {
  return (req as any).x402Payment || null;
}

export function isPaid(req: Request): boolean {
  return !!(req as any).x402Payment;
}
