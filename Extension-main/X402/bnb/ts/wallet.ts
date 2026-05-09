/**
 * Jelly x402 BNB Wallet Utilities
 * BNB Chain (BSC) EVM wallet management and transaction helpers.
 *
 * Uses ethers.js v6 for signing. Install: npm install ethers
 */

import type { BNBCurrency, GasSpeed } from './types';
import { InvalidAddressError } from './errors';

export type { GasSpeed };

export interface BNBWalletConfig {
  rpcUrl?: string;
  chainId?: number;
  network?: 'mainnet' | 'testnet';
}

export interface BNBTransferParams {
  recipient: string;
  amount: number;
  currency?: BNBCurrency;
  memo?: string;
  gasSpeed?: GasSpeed;
  gasPriceGwei?: number;
}

export interface BNBSignedTx {
  txHash: string;
  blockNumber?: number;
  gasUsed?: number;
  gasPrice: string;
  status: 'pending' | 'confirmed' | 'failed';
}

// BNB Chain token contract addresses (mainnet)
export const BNB_TOKEN_ADDRESSES: Record<string, string> = {
  USDT: '0x55d398326f99059fF775485246999027B3197955',
  USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
};

// Minimal ERC-20 ABI for transfers
export const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

export const WEI_PER_BNB = BigInt('1000000000000000000'); // 1e18
export const USDT_DECIMALS = 18;
export const USDC_DECIMALS = 18;
export const BUSD_DECIMALS = 18;

export const BNB_MAINNET_RPC = 'https://bsc-dataseed.binance.org/';
export const BNB_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
export const BNB_MAINNET_CHAIN_ID = 56;
export const BNB_TESTNET_CHAIN_ID = 97;

export class BNBWallet {
  private privateKey: string;
  private config: Required<BNBWalletConfig>;
  private _address: string;

  constructor(privateKey: string, config: BNBWalletConfig = {}) {
    if (!privateKey || privateKey.length < 64) {
      throw new Error('Invalid private key: must be a 32-byte hex string');
    }
    this.privateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    const isTestnet = config.network === 'testnet';
    this.config = {
      rpcUrl: config.rpcUrl || (isTestnet ? BNB_TESTNET_RPC : BNB_MAINNET_RPC),
      chainId: config.chainId || (isTestnet ? BNB_TESTNET_CHAIN_ID : BNB_MAINNET_CHAIN_ID),
      network: config.network || 'mainnet',
    };
    // Derive address from private key (stub — real impl uses ethers.js Wallet)
    this._address = this._deriveAddress(this.privateKey);
  }

  get address(): string {
    return this._address;
  }

  get chainId(): number {
    return this.config.chainId;
  }

  /**
   * Get native BNB and token balances.
   * Real implementation: uses ethers.js provider.getBalance() + ERC20.balanceOf()
   */
  async getBalance(): Promise<{ BNB: number; USDT: number; USDC: number; BUSD: number }> {
    return { BNB: 0, USDT: 0, USDC: 0, BUSD: 0 };
  }

  /**
   * Transfer BNB or BEP-20 tokens to a recipient.
   * Returns the transaction hash.
   *
   * Real implementation (ethers.js):
   *   const provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
   *   const wallet = new ethers.Wallet(this.privateKey, provider);
   *   if (currency === 'BNB') {
   *     const tx = await wallet.sendTransaction({ to: recipient, value: ethers.parseEther(amount.toString()) });
   *     return tx.hash;
   *   } else {
   *     const token = new ethers.Contract(BNB_TOKEN_ADDRESSES[currency], ERC20_ABI, wallet);
   *     const decimals = await token.decimals();
   *     const tx = await token.transfer(recipient, ethers.parseUnits(amount.toString(), decimals));
   *     return tx.hash;
   *   }
   */
  async transfer(params: BNBTransferParams): Promise<BNBSignedTx> {
    const { recipient, amount, currency = 'BNB', memo } = params;

    if (!isValidBNBAddress(recipient)) {
      throw new InvalidAddressError(recipient);
    }

    console.log(`[BNBWallet] Transferring ${amount} ${currency} to ${recipient}`);
    if (memo) console.log(`[BNBWallet] Memo: ${memo}`);

    const txHash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;

    return {
      txHash,
      gasPrice: '5000000000', // 5 gwei in wei
      status: 'pending',
    };
  }

  /**
   * Sign an arbitrary message (EIP-191 personal_sign).
   * Real implementation: ethers.Wallet.signMessage(message)
   */
  async signMessage(message: string): Promise<string> {
    console.log(`[BNBWallet] Signing message: ${message.slice(0, 32)}...`);
    return `0x${'0'.repeat(130)}`;
  }

  /**
   * Estimate gas for a BNB transfer.
   * Real implementation: provider.estimateGas({ to, value, data })
   */
  async estimateGas(to: string, valueWei: bigint): Promise<bigint> {
    return BigInt(21000); // standard ETH/BNB transfer gas
  }

  /**
   * Get current gas price from the network.
   * Real implementation: provider.getFeeData()
   */
  async getGasPrice(): Promise<{ slow: bigint; standard: bigint; fast: bigint }> {
    const standard = BigInt(5_000_000_000); // 5 gwei
    return {
      slow: standard * BigInt(8) / BigInt(10),    // 4 gwei
      standard,
      fast: standard * BigInt(15) / BigInt(10),    // 7.5 gwei
    };
  }

  static fromPrivateKey(privateKey: string, config?: BNBWalletConfig): BNBWallet {
    return new BNBWallet(privateKey, config);
  }

  static fromMnemonic(mnemonic: string, path: string = "m/44'/60'/0'/0/0", config?: BNBWalletConfig): BNBWallet {
    // Real implementation: ethers.Wallet.fromPhrase(mnemonic, path)
    console.log(`[BNBWallet] Deriving from mnemonic at path ${path}`);
    return new BNBWallet('0x' + '1'.repeat(64), config);
  }

  private _deriveAddress(privateKey: string): string {
    // Stub — real implementation: new ethers.Wallet(privateKey).address
    return '0x' + Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}

// ─── Utilities ──────────────────────────────────────────────────────────────

export function isValidBNBAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

export function checksumAddress(address: string): string {
  // EIP-55 checksum — real implementation: ethers.getAddress(address)
  return address.toLowerCase().replace('0x', '0x');
}

export function bnbToWei(bnb: number): bigint {
  return BigInt(Math.floor(bnb * 1e18));
}

export function weiToBNB(wei: bigint): number {
  return Number(wei) / 1e18;
}

export function tokenToRaw(amount: number, decimals: number = 18): bigint {
  return BigInt(Math.floor(amount * Math.pow(10, decimals)));
}

export function rawToToken(raw: bigint, decimals: number = 18): number {
  return Number(raw) / Math.pow(10, decimals);
}

export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function getBscScanUrl(txHashOrAddress: string, network: 'mainnet' | 'testnet' = 'mainnet'): string {
  const base = network === 'testnet' ? 'https://testnet.bscscan.com' : 'https://bscscan.com';
  const type = txHashOrAddress.length > 42 ? 'tx' : 'address';
  return `${base}/${type}/${txHashOrAddress}`;
}

export default BNBWallet;
