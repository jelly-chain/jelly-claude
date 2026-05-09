"""
X402 SDK Type Definitions
"""

from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List, Literal, Callable
from datetime import datetime


@dataclass
class X402Config:
    """Configuration for the X402 client."""
    api_key: str
    base_url: str = "https://api.jellychain.fun"
    network: Literal["mainnet-beta", "devnet", "testnet"] = "mainnet-beta"
    rpc_url: Optional[str] = None
    max_payment_per_request: float = 0.1
    commitment: Literal["processed", "confirmed", "finalized"] = "confirmed"
    timeout: int = 30
    retry_attempts: int = 3
    retry_delay: float = 1.0
    logger: Optional[Callable[[str, str], None]] = None


@dataclass
class PaymentRequest:
    """Request to create a payment."""
    amount: float
    recipient: str
    currency: Literal["SOL", "USDC"] = "SOL"
    memo: Optional[str] = None
    reference: Optional[str] = None
    expires_in: int = 600


@dataclass
class X402Headers:
    """Headers for 402 responses."""
    version: str
    amount: str
    currency: str
    recipient: str
    reference: str
    expires: str
    network: Optional[str] = None


@dataclass
class PaymentResponse:
    """Response from creating a payment request."""
    reference: str
    amount: float
    currency: str
    recipient: str
    expires: int
    headers: Dict[str, str]


@dataclass
class VerifyRequest:
    """Request to verify a payment."""
    signature: str
    reference: str
    expected_amount: float
    expected_recipient: str


@dataclass
class TransactionDetails:
    """Details of a transaction."""
    signature: str
    amount: float
    currency: str
    sender: str
    recipient: str
    confirmed_at: str
    slot: int
    fee: Optional[float] = None


@dataclass
class VerifyResponse:
    """Response from payment verification."""
    verified: bool
    transaction: TransactionDetails


@dataclass
class BalanceResponse:
    """Response from balance query."""
    address: str
    balances: Dict[str, float]


@dataclass
class TransactionHistoryRequest:
    """Request for transaction history."""
    address: str
    limit: int = 10
    before: Optional[str] = None
    after: Optional[str] = None


@dataclass
class TransactionHistoryResponse:
    """Response with transaction history."""
    transactions: List[TransactionDetails]
    has_more: bool
    next_cursor: Optional[str] = None


@dataclass
class PaymentRequirement:
    """Payment requirement parsed from 402 response."""
    amount: float
    currency: Literal["SOL", "USDC"]
    recipient: str
    reference: str
    expires: int
    network: Optional[str] = None


@dataclass
class RequestOptions:
    """Options for making requests."""
    method: str = "GET"
    headers: Dict[str, str] = field(default_factory=dict)
    body: Optional[Any] = None
    timeout: Optional[int] = None
    max_payment: Optional[float] = None
    auto_sign: bool = True


@dataclass
class X402Response:
    """Response from X402 request."""
    data: Any
    status: int
    headers: Dict[str, str]
    payment_made: Optional[Dict[str, Any]] = None


@dataclass
class PaymentInfo:
    """Information about a completed payment."""
    signature: str
    reference: str
    amount: float
    currency: str
    sender: Optional[str] = None
    verified_at: Optional[datetime] = None


@dataclass
class AgentStats:
    """Statistics for an agent."""
    total_payments: int
    total_spent: Dict[str, float]
    last_24_hours: Dict[str, Any]
