"""
Jelly x402 BNB SDK — Error Classes
"""

from typing import Optional, Any, Dict


class X402Error(Exception):
    def __init__(
        self,
        message: str,
        code: str,
        status_code: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(message={self.message!r}, code={self.code!r})"


class InsufficientBalanceError(X402Error):
    def __init__(self, required: float, available: float, currency: str = 'BNB'):
        super().__init__(
            f"Insufficient balance: need {required} {currency}, have {available} {currency}",
            'INSUFFICIENT_BALANCE',
            402,
        )
        self.required = required
        self.available = available
        self.currency = currency


class InsufficientGasError(X402Error):
    def __init__(self, required_bnb: float, available_bnb: float):
        super().__init__(
            f"Insufficient BNB for gas: need ~{required_bnb} BNB, have {available_bnb} BNB",
            'INSUFFICIENT_GAS',
            402,
        )
        self.required_bnb = required_bnb
        self.available_bnb = available_bnb


class PaymentExpiredError(X402Error):
    def __init__(self, reference: str, expired_at: Any):
        super().__init__(
            f"Payment window expired at {expired_at}",
            'PAYMENT_EXPIRED',
            410,
        )
        self.reference = reference
        self.expired_at = expired_at


class PaymentRejectedError(X402Error):
    def __init__(self, reason: str, tx_hash: Optional[str] = None):
        super().__init__(f"Payment rejected: {reason}", 'PAYMENT_REJECTED', 402)
        self.reason = reason
        self.tx_hash = tx_hash


class TransactionFailedError(X402Error):
    def __init__(self, message: str, tx_hash: Optional[str] = None, revert_reason: Optional[str] = None):
        super().__init__(message, 'TRANSACTION_FAILED', 500)
        self.tx_hash = tx_hash
        self.revert_reason = revert_reason


class InvalidAddressError(X402Error):
    def __init__(self, address: str):
        super().__init__(
            f"Invalid BNB Chain (EVM) address: {address}",
            'INVALID_ADDRESS',
            400,
        )
        self.address = address


class WrongChainError(X402Error):
    def __init__(self, expected_chain_id: int, actual_chain_id: int):
        super().__init__(
            f"Wrong chain: expected chainId {expected_chain_id}, got {actual_chain_id}",
            'WRONG_CHAIN',
            400,
        )
        self.expected_chain_id = expected_chain_id
        self.actual_chain_id = actual_chain_id


class RateLimitError(X402Error):
    def __init__(self, retry_after: int, limit: int = 0):
        super().__init__(
            f"Rate limit exceeded. Retry after {retry_after} seconds",
            'RATE_LIMITED',
            429,
        )
        self.retry_after = retry_after
        self.limit = limit


class NetworkError(X402Error):
    def __init__(self, message: str, original_error: Optional[Exception] = None):
        super().__init__(message, 'NETWORK_ERROR', 0)
        self.original_error = original_error


class MaxPaymentExceededError(X402Error):
    def __init__(self, requested: float, maximum: float):
        super().__init__(
            f"Payment amount {requested} exceeds maximum allowed {maximum}",
            'MAX_PAYMENT_EXCEEDED',
            402,
        )
        self.requested = requested
        self.maximum = maximum


class ConfigurationError(X402Error):
    def __init__(self, field: str, message: str):
        super().__init__(
            f"Configuration error for '{field}': {message}",
            'CONFIG_ERROR',
        )
        self.field = field
