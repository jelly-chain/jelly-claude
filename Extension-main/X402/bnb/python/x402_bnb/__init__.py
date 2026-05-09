"""
Jelly x402 BNB SDK — Python
HTTP 402 autonomous payments on BNB Chain (BSC)

Quick start:
    from x402_bnb import BNBX402Client, BNBWallet

    wallet = BNBWallet.from_private_key(os.environ['BNB_PRIVATE_KEY'])
    client = BNBX402Client(api_key=os.environ['JELLY_API_KEY'])
    client.set_wallet(wallet)

    response = client.request('https://api.example.com/premium')
    print(response.data)

Chain:     BNB Chain (Binance Smart Chain)
Chain ID:  56 (mainnet) | 97 (testnet)
Tokens:    BNB (native), USDT, USDC, BUSD (BEP-20)
Explorer:  https://bscscan.com
"""

from .client import BNBX402Client, AsyncBNBX402Client
from .wallet import BNBWallet
from .types import (
    BNBConfig,
    BNBPaymentRequest,
    BNBPaymentResponse,
    BNBVerifyRequest,
    BNBVerifyResponse,
    BNBBalanceResponse,
    BNBTransactionHistoryRequest,
    BNBTransactionHistoryResponse,
    BNBPaymentRequirement,
    BNBResponse,
    BNBTransactionDetails,
)
from .errors import (
    X402Error,
    InsufficientBalanceError,
    InsufficientGasError,
    PaymentExpiredError,
    PaymentRejectedError,
    TransactionFailedError,
    InvalidAddressError,
    WrongChainError,
    RateLimitError,
    NetworkError,
    MaxPaymentExceededError,
    ConfigurationError,
)
from .middleware import create_bnb_middleware, get_payment_info, is_paid

__version__ = '1.0.0'
__all__ = [
    'BNBX402Client',
    'AsyncBNBX402Client',
    'BNBWallet',
    'BNBConfig',
    'BNBPaymentRequest',
    'BNBPaymentResponse',
    'BNBVerifyRequest',
    'BNBVerifyResponse',
    'BNBBalanceResponse',
    'BNBTransactionHistoryRequest',
    'BNBTransactionHistoryResponse',
    'BNBPaymentRequirement',
    'BNBResponse',
    'BNBTransactionDetails',
    'X402Error',
    'InsufficientBalanceError',
    'InsufficientGasError',
    'PaymentExpiredError',
    'PaymentRejectedError',
    'TransactionFailedError',
    'InvalidAddressError',
    'WrongChainError',
    'RateLimitError',
    'NetworkError',
    'MaxPaymentExceededError',
    'ConfigurationError',
    'create_bnb_middleware',
    'get_payment_info',
    'is_paid',
]
