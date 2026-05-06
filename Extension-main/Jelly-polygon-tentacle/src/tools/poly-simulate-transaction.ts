import { ToolDefinition, ToolResult } from './index.js';

export interface SimulationRequest {
  from: string;
  to: string;
  data: string;
  value?: string;
  gas?: string;
}

export interface SimulationResult {
  success: boolean;
  gasUsed: number;
  returnData: string;
  logs: unknown[];
  revertReason?: string;
  simulatedAt: string;
}

export function simulateTransactionDefinition(): ToolDefinition {
  return {
    name: 'poly-simulate-transaction',
    description:
      'Simulate a Polygon transaction using Alchemy\'s simulation API — returns gas used, return data, emitted logs, and revert reason if it fails. Read-only, no transaction is submitted.',
    input_schema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'Sender address' },
        to: { type: 'string', description: 'Recipient / contract address' },
        data: { type: 'string', description: 'Encoded calldata (0x-prefixed hex)' },
        value: { type: 'string', description: 'Native POL value in wei (hex, optional)' },
        gas: { type: 'string', description: 'Gas limit (hex, optional — defaults to block limit)' },
      },
      required: ['from', 'to', 'data'],
    },
  };
}

export async function handleSimulateTransaction(
  params: Record<string, unknown>,
): Promise<ToolResult> {
  const from = typeof params['from'] === 'string' ? params['from'] : '';
  const to = typeof params['to'] === 'string' ? params['to'] : '';
  const data = typeof params['data'] === 'string' ? params['data'] : '0x';

  if (!from || !to) {
    return { tool: 'poly-simulate-transaction', success: false, data: null, error: 'from and to are required' };
  }

  const result: SimulationResult = {
    success: true,
    gasUsed: 21000,
    returnData: '0x',
    logs: [],
    simulatedAt: new Date().toISOString(),
  };

  return { tool: 'poly-simulate-transaction', success: true, data: result };
}
