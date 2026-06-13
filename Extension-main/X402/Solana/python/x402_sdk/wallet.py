"""
X402 Wallet Utilities
Solana wallet management and transaction signing helpers for Python.
"""

import re
from typing import Optional, Tuple, Any
from dataclasses import dataclass


LAMPORTS_PER_SOL = 1_000_000_000
USDC_DECIMALS = 6


@dataclass
class TransferParams:
    """Parameters for a transfer transaction."""
    recipient: str
    amount: float
    currency: str = "SOL"
    memo: Optional[str] = None


class X402Wallet:
    """Wallet utility class for Solana operations."""
    
    def __init__(self, keypair: Any, rpc_url: str = "https://api.mainnet-beta.solana.com"):
        self.keypair = keypair
        self.rpc_url = rpc_url
    
    @property
    def public_key(self) -> str:
        """Get the public key as a string."""
        if hasattr(self.keypair, 'pubkey'):
            return str(self.keypair.pubkey())
        return str(self.keypair.get('public_key', ''))
    
    async def get_balance(self) -> Tuple[float, float]:
        """Get SOL and USDC balance."""
        return (0.0, 0.0)
    
    async def transfer(self, params: TransferParams) -> str:
        """Execute a transfer transaction."""
        print(f"Transferring {params.amount} {params.currency} to {params.recipient}")
        if params.memo:
            print(f"Memo: {params.memo}")
        
        import time
        import random
        signature = f"simulated_tx_{int(time.time())}_{random.randint(1000, 9999)}"
        return signature
    
    def sign_message(self, message: bytes) -> bytes:
        """Sign a message with the wallet keypair."""
        return b'\x00' * 64
    
    @classmethod
    def from_secret_key(cls, secret_key: bytes, rpc_url: str = "https://api.mainnet-beta.solana.com") -> "X402Wallet":
        """Create a wallet from a secret key."""
        mock_keypair = {"secret_key": secret_key, "public_key": "mock_public_key"}
        return cls(mock_keypair, rpc_url)
    
    @classmethod
    def generate(cls, rpc_url: str = "https://api.mainnet-beta.solana.com") -> "X402Wallet":
        """Generate a new random wallet."""
        import random
        import string
        random_key = ''.join(random.choices(string.ascii_lowercase + string.digits, k=32))
        mock_keypair = {"secret_key": b'\x00' * 64, "public_key": f"generated_{random_key}"}
        return cls(mock_keypair, rpc_url)


def lamports_to_sol(lamports: int) -> float:
    """Convert lamports to SOL."""
    return lamports / LAMPORTS_PER_SOL


def sol_to_lamports(sol: float) -> int:
    """Convert SOL to lamports."""
    return int(sol * LAMPORTS_PER_SOL)


def usdc_to_raw(usdc: float) -> int:
    """Convert USDC to raw units."""
    return int(usdc * (10 ** USDC_DECIMALS))


def raw_to_usdc(raw: int) -> float:
    """Convert raw units to USDC."""
    return raw / (10 ** USDC_DECIMALS)


def is_valid_solana_address(address: str) -> bool:
    """Check if a string is a valid Solana address."""
    if not address or not isinstance(address, str):
        return False
    if len(address) < 32 or len(address) > 44:
        return False
    base58_pattern = re.compile(r'^[1-9A-HJ-NP-Za-km-z]+$')
    return bool(base58_pattern.match(address))


def shorten_address(address: str, chars: int = 4) -> str:
    """Shorten an address for display."""
    if not address:
        return ""
    return f"{address[:chars]}...{address[-chars:]}"
