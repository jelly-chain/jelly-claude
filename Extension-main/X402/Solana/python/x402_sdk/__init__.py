"""
Jelly x402 SDK for Python
Official SDK for integrating with the Jelly x402 autonomous payment protocol on Solana.
"""

from .client import X402Client
from .errors import (
    X402Error,
    InsufficientBalanceError,
    PaymentExpiredError,
    PaymentRejectedError,
    TransactionFailedError,
    InvalidSignatureError,
    RateLimitError,
    NetworkError,
    ConfigurationError,
    MaxPaymentExceededError,
)
from .types import (
    X402Config,
    PaymentRequest,
    PaymentResponse,
    VerifyRequest,
    VerifyResponse,
    BalanceResponse,
    TransactionDetails,
    PaymentRequirement,
)
from .middleware import create_x402_middleware, require_payment
from .wallet import X402Wallet, is_valid_solana_address

__version__ = "1.0.0"
__all__ = [
    "X402Client",
    "X402Error",
    "InsufficientBalanceError",
    "PaymentExpiredError",
    "PaymentRejectedError",
    "TransactionFailedError",
    "InvalidSignatureError",
    "RateLimitError",
    "NetworkError",
    "ConfigurationError",
    "MaxPaymentExceededError",
    "X402Config",
    "PaymentRequest",
    "PaymentResponse",
    "VerifyRequest",
    "VerifyResponse",
    "BalanceResponse",
    "TransactionDetails",
    "PaymentRequirement",
    "create_x402_middleware",
    "require_payment",
    "X402Wallet",
    "is_valid_solana_address",
]
