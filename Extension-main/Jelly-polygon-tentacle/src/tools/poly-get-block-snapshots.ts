import { ToolDefinition, ToolResult } from './index.js';
import { WalletService } from '../services/wallet-service.js';

export interface BlockSnapshot {
  blockNumber: number;
  timestamp: string;
  transactionCount: number;
  gasUsed: string;
  baseFeeGwei: number;
  polygonPrice?: number;
}

export function getBlockSnapshotsDefinition(): ToolDefinition {
  return {
    name: 'poly-get-block-snapshots',
    description:
      'Fetch Polygon block header snapshots for a range of recent blocks — block number, timestamp, tx count, gas usage, and base fee.',
    input_schema: {
      type: 'object',
      properties: {
        fromBlock: { type: 'string', description: 'Starting block number (hex or decimal)' },
        toBlock: { type: 'string', description: 'Ending block number (hex or decimal, or "latest")' },
        count: { type: 'string', description: 'Number of recent blocks to fetch if fromBlock/toBlock omitted (default 10)' },
      },
      required: [],
    },
  };
}

export async function handleGetBlockSnapshots(
  params: Record<string, unknown>,
  service: WalletService,
): Promise<ToolResult> {
  const count = typeof params['count'] === 'string' ? parseInt(params['count'], 10) : 10;

  try {
    const snapshots = await service.getRecentBlockSnapshots(count);
    return { tool: 'poly-get-block-snapshots', success: true, data: snapshots };
  } catch (err) {
    return { tool: 'poly-get-block-snapshots', success: false, data: [], error: String(err) };
  }
}
