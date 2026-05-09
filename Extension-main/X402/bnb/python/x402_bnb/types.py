"""
Jelly x402 BNB SDK — Type Definitions
"""

from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List, Literal

BNBCurrency = Literal['BNB', 'USDT', 'USDC', 'BUSD']
BNBNetwork = Literal['mainnet', 'testnet']
GasSpeed = Literal['slow', 'standard', 'fast']


@dataclass
class BNBConfig:
    api_key: str
    base_url: str = 'https://api.jellychain.fun'
    network: BNBNetwork = 'mainnet'
    rpc_url: Optional[str] = None
    chain_id: int = 56
    max_payment_per_request: float = 0.01   # BNB
    gas_speed: GasSpeed = 'standard'
    gas_price_gwei: Optional[float] = None
    timeout: int = 30
    retry_attempts: int = 3
    retry_delay: float = 1.0


@dataclass
class BNBPaymentRequest:
    amount: float
    recipient: str
    currency: BNBCurrency = 'BNB'
    memo: Optional[str] = None
    reference: Optional[str] = None
    expires_in: int = 600


@dataclass
class BNBPaymentResponse:
    reference: str
    amount: float
    currency: BNBCurrency
    recipient: str
    expires: int
    chain_id: int
    headers: Dict[str, str] = field(default_factory=dict)


@dataclass
class BNBVerifyRequest:
    tx_hash: str
    reference: str
    expected_amount: float
    expected_recipient: str
    currency: BNBCurrency = 'BNB'


@dataclass
class BNBTransactionDetails:
    tx_hash: str
    block_number: int
    amount: float
    currency: BNBCurrency
    sender: str
    recipient: str
    confirmed_at: str
    gas_used: int
    gas_price: str
    network_fee: str
    chain_id: int


@dataclass
class BNBVerifyResponse:
    verified: bool
    transaction: BNBTransactionDetails


@dataclass
class BNBBalanceResponse:
    address: str
    balances: Dict[str, float] = field(default_factory=lambda: {
        'BNB': 0.0,
        'USDT': 0.0,
        'USDC': 0.0,
        'BUSD': 0.0,
    })


@dataclass
class BNBTransactionHistoryRequest:
    address: str
    limit: Optional[int] = None
    before: Optional[str] = None
    after: Optional[str] = None
    currency: Optional[BNBCurrency] = None


@dataclass
class BNBTransactionHistoryResponse:
    transactions: List[BNBTransactionDetails] = field(default_factory=list)
    has_more: bool = False
    next_cursor: Optional[str] = None


@dataclass
class BNBPaymentRequirement:
    amount: float
    currency: BNBCurrency
    recipient: str
    reference: str
    expires: int
    chain_id: int
    network: Optional[str] = None


@dataclass
class BNBResponse:
    data: Any
    status: int
    headers: Dict[str, str] = field(default_factory=dict)
    payment_made: Optional[Dict[str, Any]] = None


@dataclass
class BNBGasEstimate:
    slow_gwei: float = 3.0
    standard_gwei: float = 5.0
    fast_gwei: float = 7.0
    slow_seconds: int = 30
    standard_seconds: int = 10
    fast_seconds: int = 3
