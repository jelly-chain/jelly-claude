"""
X402 SDK Error Classes
"""

from typing import Optional, Dict, Any
from datetime import datetime


class X402Error(Exception):
    """Base exception for all X402 errors."""
    
    def __init__(
        self,
        message: str,
        code: str = "X402_ERROR",
        status_code: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}


class InsufficientBalanceError(X402Error):
    """Raised when wallet balance is insufficient for payment."""
    
    def __init__(self, required: float, available: float, currency: str = "SOL"):
        super().__init__(
            f"Insufficient balance: need {required} {currency}, have {available} {currency}",
            code="INSUFFICIENT_BALANCE",
            status_code=402
        )
        self.required = required
        self.available = available
        self.currency = currency


class PaymentExpiredError(X402Error):
    """Raised when payment window has expired."""
    
    def __init__(self, reference: str, expired_at: datetime):
        super().__init__(
            f"Payment window expired at {expired_at.isoformat()}",
            code="PAYMENT_EXPIRED",
            status_code=410
        )
        self.reference = reference
        self.expired_at = expired_at


class PaymentRejectedError(X402Error):
    """Raised when payment is rejected by the server."""
    
    def __init__(self, reason: str, signature: Optional[str] = None):
        super().__init__(
            f"Payment rejected: {reason}",
            code="PAYMENT_REJECTED",
            status_code=402
        )
        self.reason = reason
        self.signature = signature


class TransactionFailedError(X402Error):
    """Raised when a blockchain transaction fails."""
    
    def __init__(
        self,
        message: str,
        signature: Optional[str] = None,
        logs: Optional[list] = None
    ):
        super().__init__(message, code="TRANSACTION_FAILED", status_code=500)
        self.signature = signature
        self.logs = logs or []


class InvalidSignatureError(X402Error):
    """Raised when a transaction signature is invalid."""
    
    def __init__(self, signature: str):
        super().__init__(
            f"Invalid transaction signature: {signature}",
            code="INVALID_SIGNATURE",
            status_code=400
        )
        self.signature = signature


class RateLimitError(X402Error):
    """Raised when rate limit is exceeded."""
    
    def __init__(self, retry_after: int, limit: int = 0):
        super().__init__(
            f"Rate limit exceeded. Retry after {retry_after} seconds",
            code="RATE_LIMITED",
            status_code=429
        )
        self.retry_after = retry_after
        self.limit = limit


class NetworkError(X402Error):
    """Raised when a network error occurs."""
    
    def __init__(self, message: str, original_error: Optional[Exception] = None):
        super().__init__(message, code="NETWORK_ERROR", status_code=0)
        self.original_error = original_error


class ConfigurationError(X402Error):
    """Raised when configuration is invalid."""
    
    def __init__(self, field: str, message: str):
        super().__init__(
            f"Configuration error for '{field}': {message}",
            code="CONFIG_ERROR"
        )
        self.field = field


class MaxPaymentExceededError(X402Error):
    """Raised when payment amount exceeds maximum allowed."""
    
    def __init__(self, requested: float, maximum: float):
        super().__init__(
            f"Payment amount {requested} exceeds maximum allowed {maximum}",
            code="MAX_PAYMENT_EXCEEDED",
            status_code=402
        )
        self.requested = requested
        self.maximum = maximum


def is_x402_error(error: Exception) -> bool:
    """Check if an exception is an X402 error."""
    return isinstance(error, X402Error)
