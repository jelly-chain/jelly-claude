"""
X402 Flask Middleware
Protect your API endpoints with 402 Payment Required responses.
"""

import time
import functools
from typing import Optional, Callable, Any, Dict, Set
from datetime import datetime

from flask import request, jsonify, Response

from .client import X402Client
from .types import PaymentInfo


_used_references: Set[str] = set()


class X402Middleware:
    """Flask middleware for X402 payment protection."""
    
    def __init__(
        self,
        api_key: str,
        recipient: str,
        base_url: str = "https://api.jellychain.fun",
        verify_payments: bool = True,
        on_payment_received: Optional[Callable[[PaymentInfo], None]] = None,
        on_payment_failed: Optional[Callable[[Exception], None]] = None,
    ):
        self.client = X402Client(api_key=api_key, base_url=base_url)
        self.recipient = recipient
        self.verify_payments = verify_payments
        self.on_payment_received = on_payment_received
        self.on_payment_failed = on_payment_failed
    
    def require_payment(
        self,
        amount: float,
        currency: str = "SOL",
        recipient: Optional[str] = None,
        expires_in: int = 600,
        memo: Optional[str] = None,
    ) -> Callable:
        """Decorator to require payment for an endpoint."""
        
        def decorator(f: Callable) -> Callable:
            @functools.wraps(f)
            def wrapped(*args, **kwargs):
                payment_signature = request.headers.get("X-402-Payment-Signature")
                payment_reference = request.headers.get("X-402-Payment-Reference")
                
                actual_recipient = recipient or self.recipient
                
                if payment_signature and payment_reference:
                    if payment_reference in _used_references:
                        return jsonify({
                            "error": "Payment reference already used",
                            "code": "REPLAY_ATTACK",
                        }), 402
                    
                    if self.verify_payments:
                        try:
                            from .types import VerifyRequest
                            verification = self.client.verify(VerifyRequest(
                                signature=payment_signature,
                                reference=payment_reference,
                                expected_amount=amount,
                                expected_recipient=actual_recipient,
                            ))
                            
                            if not verification.verified:
                                if self.on_payment_failed:
                                    self.on_payment_failed(Exception("Verification failed"))
                                return jsonify({
                                    "error": "Payment verification failed",
                                    "code": "VERIFICATION_FAILED",
                                }), 402
                            
                            _used_references.add(payment_reference)
                            
                            payment_info = PaymentInfo(
                                signature=payment_signature,
                                reference=payment_reference,
                                amount=verification.transaction.amount,
                                currency=verification.transaction.currency,
                                sender=verification.transaction.sender,
                                verified_at=datetime.now(),
                            )
                            
                            request.x402_payment = payment_info
                            
                            if self.on_payment_received:
                                self.on_payment_received(payment_info)
                            
                            return f(*args, **kwargs)
                            
                        except Exception as e:
                            if self.on_payment_failed:
                                self.on_payment_failed(e)
                            return jsonify({
                                "error": "Payment verification error",
                                "code": "VERIFICATION_ERROR",
                                "message": str(e),
                            }), 402
                    else:
                        _used_references.add(payment_reference)
                        request.x402_payment = PaymentInfo(
                            signature=payment_signature,
                            reference=payment_reference,
                            amount=amount,
                            currency=currency,
                            verified_at=datetime.now(),
                        )
                        return f(*args, **kwargs)
                
                reference = _generate_reference()
                expires = int(time.time()) + expires_in
                
                response = jsonify({
                    "error": "Payment Required",
                    "code": "PAYMENT_REQUIRED",
                    "payment": {
                        "amount": amount,
                        "currency": currency,
                        "recipient": actual_recipient,
                        "reference": reference,
                        "expires": expires,
                        "memo": memo,
                    },
                    "instructions": "Send payment to the recipient address and retry with X-402-Payment-Signature and X-402-Payment-Reference headers",
                })
                response.status_code = 402
                response.headers["X-402-Version"] = "1.0"
                response.headers["X-402-Amount"] = str(amount)
                response.headers["X-402-Currency"] = currency
                response.headers["X-402-Recipient"] = actual_recipient
                response.headers["X-402-Reference"] = reference
                response.headers["X-402-Expires"] = str(expires)
                
                return response
            
            return wrapped
        return decorator


def create_x402_middleware(
    api_key: str,
    recipient: str,
    base_url: str = "https://api.jellychain.fun",
    verify_payments: bool = True,
) -> X402Middleware:
    """Create an X402 middleware instance."""
    return X402Middleware(
        api_key=api_key,
        recipient=recipient,
        base_url=base_url,
        verify_payments=verify_payments,
    )


def require_payment(
    amount: float,
    currency: str = "SOL",
    recipient: Optional[str] = None,
    expires_in: int = 600,
) -> Callable:
    """Standalone decorator for requiring payment (requires middleware to be initialized)."""
    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        def wrapped(*args, **kwargs):
            reference = _generate_reference()
            expires = int(time.time()) + expires_in
            
            payment_signature = request.headers.get("X-402-Payment-Signature")
            
            if payment_signature:
                return f(*args, **kwargs)
            
            response = jsonify({
                "error": "Payment Required",
                "code": "PAYMENT_REQUIRED",
                "payment": {
                    "amount": amount,
                    "currency": currency,
                    "recipient": recipient or "RECIPIENT_ADDRESS",
                    "reference": reference,
                    "expires": expires,
                },
            })
            response.status_code = 402
            response.headers["X-402-Version"] = "1.0"
            response.headers["X-402-Amount"] = str(amount)
            response.headers["X-402-Currency"] = currency
            response.headers["X-402-Reference"] = reference
            response.headers["X-402-Expires"] = str(expires)
            
            return response
        
        return wrapped
    return decorator


def _generate_reference() -> str:
    """Generate a unique payment reference."""
    import random
    import string
    timestamp = hex(int(time.time()))[2:]
    random_part = ''.join(random.choices(string.ascii_lowercase + string.digits, k=12))
    return f"pay_{timestamp}{random_part}"


def get_payment_info() -> Optional[PaymentInfo]:
    """Get payment info from the current request."""
    return getattr(request, 'x402_payment', None)


def is_paid() -> bool:
    """Check if the current request has a valid payment."""
    return hasattr(request, 'x402_payment') and request.x402_payment is not None
