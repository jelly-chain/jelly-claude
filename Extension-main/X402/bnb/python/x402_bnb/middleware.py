"""
Jelly x402 BNB Flask/FastAPI Middleware
Protect API endpoints with HTTP 402 responses requiring BNB Chain payments.
"""

import time
import secrets
from typing import Optional, Callable, Any, Dict, Set
from functools import wraps

from .client import BNBX402Client
from .types import BNBVerifyRequest
from .errors import X402Error

# In-memory replay protection (use Redis in production)
_used_references: Set[str] = set()


def create_bnb_middleware(
    api_key: str,
    recipient: str,
    base_url: str = 'https://api.jellychain.fun',
    chain_id: int = 56,
    network: str = 'mainnet',
    verify_payments: bool = True,
    on_payment_received: Optional[Callable] = None,
    on_payment_failed: Optional[Callable] = None,
):
    """
    Create BNB x402 middleware helpers for Flask or FastAPI.

    Flask example:
        from x402_bnb.middleware import create_bnb_middleware

        middleware = create_bnb_middleware(
            api_key=os.environ['JELLY_API_KEY'],
            recipient='0xYourWalletAddress',
        )

        @app.route('/api/premium')
        @middleware.require_payment(0.001)
        def premium():
            return jsonify({'data': 'Premium content!'})

    FastAPI example:
        middleware = create_bnb_middleware(...)

        @app.get('/api/premium')
        async def premium(payment=Depends(middleware.fastapi_payment_dependency(0.001))):
            return {'data': 'Premium content!'}
    """
    client = BNBX402Client(
        api_key=api_key,
        base_url=base_url,
        chain_id=chain_id,
        network=network,
    )

    class BNBMiddleware:
        def require_payment(
            self,
            amount: float,
            currency: str = 'BNB',
            expires_in: int = 600,
            custom_recipient: Optional[str] = None,
        ):
            """Flask decorator: require BNB Chain payment before serving response."""
            def decorator(func):
                @wraps(func)
                def wrapper(*args, **kwargs):
                    from flask import request as flask_request, jsonify, g

                    tx_hash = flask_request.headers.get('X-402-Payment-TxHash')
                    reference = flask_request.headers.get('X-402-Payment-Reference')
                    req_chain_id = int(flask_request.headers.get('X-402-Chain-Id', chain_id))

                    if tx_hash and reference:
                        if reference in _used_references:
                            return jsonify({
                                'error': 'Payment reference already used',
                                'code': 'REPLAY_ATTACK',
                            }), 402

                        if verify_payments:
                            try:
                                verification = client.verify(BNBVerifyRequest(
                                    tx_hash=tx_hash,
                                    reference=reference,
                                    expected_amount=amount,
                                    expected_recipient=custom_recipient or recipient,
                                    currency=currency,
                                ))

                                if not verification.verified:
                                    if on_payment_failed:
                                        on_payment_failed(Exception('Verification failed'))
                                    return jsonify({
                                        'error': 'Payment verification failed',
                                        'code': 'VERIFICATION_FAILED',
                                    }), 402

                                _used_references.add(reference)
                                g.x402_payment = {
                                    'tx_hash': tx_hash,
                                    'reference': reference,
                                    'amount': verification.transaction.amount,
                                    'currency': verification.transaction.currency,
                                    'sender': verification.transaction.sender,
                                    'chain_id': verification.transaction.chain_id,
                                }

                                if on_payment_received:
                                    on_payment_received(g.x402_payment)

                                return func(*args, **kwargs)

                            except X402Error as e:
                                if on_payment_failed:
                                    on_payment_failed(e)
                                return jsonify({
                                    'error': 'Payment verification error',
                                    'code': 'VERIFICATION_ERROR',
                                    'message': str(e),
                                }), 402
                        else:
                            _used_references.add(reference)
                            g.x402_payment = {
                                'tx_hash': tx_hash,
                                'reference': reference,
                                'amount': amount,
                                'currency': currency,
                                'chain_id': req_chain_id,
                            }
                            return func(*args, **kwargs)

                    ref = _generate_reference()
                    expires = int(time.time()) + expires_in

                    from flask import make_response
                    resp_body = {
                        'error': 'Payment Required',
                        'code': 'PAYMENT_REQUIRED',
                        'chain': 'BNB Chain (BSC)',
                        'chain_id': chain_id,
                        'payment': {
                            'amount': amount,
                            'currency': currency,
                            'recipient': custom_recipient or recipient,
                            'reference': ref,
                            'expires': expires,
                        },
                        'instructions': (
                            f'Send {amount} {currency} to {custom_recipient or recipient} on BNB Chain '
                            f'(chainId {chain_id}), then retry with headers: '
                            f'X-402-Payment-TxHash and X-402-Payment-Reference.'
                        ),
                    }
                    response = make_response(jsonify(resp_body), 402)
                    response.headers['X-402-Version'] = '1.0'
                    response.headers['X-402-Amount'] = str(amount)
                    response.headers['X-402-Currency'] = currency
                    response.headers['X-402-Recipient'] = custom_recipient or recipient
                    response.headers['X-402-Reference'] = ref
                    response.headers['X-402-Expires'] = str(expires)
                    response.headers['X-402-Chain-Id'] = str(chain_id)
                    response.headers['X-402-Network'] = network
                    return response

                return wrapper
            return decorator

        def fastapi_payment_dependency(
            self,
            amount: float,
            currency: str = 'BNB',
            expires_in: int = 600,
            custom_recipient: Optional[str] = None,
        ):
            """FastAPI dependency: require BNB Chain payment."""
            async def dependency(
                x_402_payment_txhash: Optional[str] = None,
                x_402_payment_reference: Optional[str] = None,
                x_402_chain_id: Optional[int] = None,
            ):
                from fastapi import HTTPException, Header
                from fastapi.responses import JSONResponse

                if x_402_payment_txhash and x_402_payment_reference:
                    if x_402_payment_reference in _used_references:
                        raise HTTPException(status_code=402, detail={
                            'error': 'Payment reference already used',
                            'code': 'REPLAY_ATTACK',
                        })

                    if verify_payments:
                        verification = client.verify(BNBVerifyRequest(
                            tx_hash=x_402_payment_txhash,
                            reference=x_402_payment_reference,
                            expected_amount=amount,
                            expected_recipient=custom_recipient or recipient,
                            currency=currency,
                        ))
                        if not verification.verified:
                            raise HTTPException(status_code=402, detail={
                                'error': 'Payment verification failed',
                                'code': 'VERIFICATION_FAILED',
                            })

                    _used_references.add(x_402_payment_reference)
                    return {
                        'tx_hash': x_402_payment_txhash,
                        'reference': x_402_payment_reference,
                        'amount': amount,
                        'currency': currency,
                        'chain_id': x_402_chain_id or chain_id,
                    }

                ref = _generate_reference()
                expires = int(time.time()) + expires_in
                raise HTTPException(
                    status_code=402,
                    detail={
                        'error': 'Payment Required',
                        'code': 'PAYMENT_REQUIRED',
                        'chain': 'BNB Chain (BSC)',
                        'chain_id': chain_id,
                        'payment': {
                            'amount': amount,
                            'currency': currency,
                            'recipient': custom_recipient or recipient,
                            'reference': ref,
                            'expires': expires,
                        },
                    },
                    headers={
                        'X-402-Version': '1.0',
                        'X-402-Amount': str(amount),
                        'X-402-Currency': currency,
                        'X-402-Recipient': custom_recipient or recipient,
                        'X-402-Reference': ref,
                        'X-402-Expires': str(expires),
                        'X-402-Chain-Id': str(chain_id),
                    },
                )

            return dependency

    return BNBMiddleware()


def _generate_reference() -> str:
    ts = hex(int(time.time()))[2:]
    rand = secrets.token_hex(6)
    return f'bnbpay_{ts}{rand}'


def get_payment_info(request_or_g: Any) -> Optional[Dict[str, Any]]:
    """Get payment info from Flask g or FastAPI request state."""
    try:
        from flask import g
        return getattr(g, 'x402_payment', None)
    except RuntimeError:
        return getattr(request_or_g, 'x402_payment', None)


def is_paid(request_or_g: Any) -> bool:
    return get_payment_info(request_or_g) is not None
