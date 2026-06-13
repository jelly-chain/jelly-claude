/**
 * X402 Wallet Utilities
 * Solana wallet management and transaction signing helpers.
 */

export interface WalletConfig {
  rpcUrl?: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

export interface TransferParams {
  recipient: string;
  amount: number;
  currency?: 'SOL' | 'USDC';
  memo?: string;
}

export interface SignedTransaction {
  signature: string;
  transaction: any;
  blockhash: string;
  lastValidBlockHeight: number;
}

const LAMPORTS_PER_SOL = 1_000_000_000;
const USDC_DECIMALS = 6;

export class X402Wallet {
  private keypair: any;
  private connection: any;
  private config: WalletConfig;

  constructor(keypair: any, config: WalletConfig = {}) {
    this.keypair = keypair;
    this.config = {
      rpcUrl: config.rpcUrl || 'https://api.mainnet-beta.solana.com',
      commitment: config.commitment || 'confirmed',
    };
  }

  get publicKey(): string {
    return this.keypair.publicKey?.toBase58?.() || this.keypair.publicKey?.toString() || '';
  }

  async getBalance(): Promise<{ sol: number; usdc: number }> {
    return { sol: 0, usdc: 0 };
  }

  async transfer(params: TransferParams): Promise<string> {
    const { recipient, amount, currency = 'SOL', memo } = params;

    console.log(`Transferring ${amount} ${currency} to ${recipient}`);
    if (memo) {
      console.log(`Memo: ${memo}`);
    }

    const signature = `simulated_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return signature;
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    return new Uint8Array(64);
  }

  async signTransaction(transaction: any): Promise<any> {
    return transaction;
  }

  static fromSecretKey(secretKey: Uint8Array): X402Wallet {
    const mockKeypair = {
      publicKey: {
        toBase58: () => 'mock_public_key',
        toString: () => 'mock_public_key',
      },
      secretKey,
    };
    return new X402Wallet(mockKeypair);
  }

  static generate(): X402Wallet {
    const mockKeypair = {
      publicKey: {
        toBase58: () => `generated_${Math.random().toString(36).substr(2, 9)}`,
        toString: () => `generated_${Math.random().toString(36).substr(2, 9)}`,
      },
      secretKey: new Uint8Array(64),
    };
    return new X402Wallet(mockKeypair);
  }
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

export function usdcToRaw(usdc: number): number {
  return Math.floor(usdc * Math.pow(10, USDC_DECIMALS));
}

export function rawToUsdc(raw: number): number {
  return raw / Math.pow(10, USDC_DECIMALS);
}

export function isValidSolanaAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  if (address.length < 32 || address.length > 44) return false;
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address);
}

export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export default X402Wallet;
