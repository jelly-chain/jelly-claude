"""
X402 SDK Main Client
"""

import time
import json
from typing import Optional, Any, Dict
from datetime import datetime

import requests

from .types import (
    X402Config,
    PaymentRequest,
    PaymentResponse,
    VerifyRequest,
    VerifyResponse,
    BalanceResponse,
    TransactionHistoryRequest,
    TransactionHistoryResponse,
    PaymentRequirement,
    RequestOptions,
    X402Response,
    TransactionDetails,
)
from .errors import (
    X402Error,
    NetworkError,
    RateLimitError,
    MaxPaymentExceededError,
    PaymentExpiredError,
)


class X402Client:
    """Main client for interacting with the X402 payment protocol API."""
    
    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.jellychain.fun",
        network: str = "mainnet-beta",
        max_payment_per_request: float = 0.1,
        timeout: int = 30,
        retry_attempts: int = 3,
        retry_delay: float = 1.0,
    ):
        self.config = X402Config(
            api_key=api_key,
            base_url=base_url.rstrip("/"),
            network=network,
            max_payment_per_request=max_payment_per_request,
            timeout=timeout,
            retry_attempts=retry_attempts,
            retry_delay=retry_delay,
        )
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "X-402-SDK-Version": "1.0.0",
        })
        self.keypair = None
    
    def set_keypair(self, keypair: Any) -> None:
        """Set the keypair for automatic payment signing."""
        self.keypair = keypair
    
    def request(
        self,
        url: str,
        method: str = "GET",
        headers: Optional[Dict[str, str]] = None,
        body: Optional[Any] = None,
        timeout: Optional[int] = None,
        max_payment: Optional[float] = None,
        auto_sign: bool = True,
    ) -> X402Response:
        """Make an HTTP request with automatic 402 payment handling."""
        
        request_headers = dict(self.session.headers)
        if headers:
            request_headers.update(headers)
        
        actual_timeout = timeout or self.config.timeout
        actual_max_payment = max_payment or self.config.max_payment_per_request
        
        attempts = 0
        last_error = None
        
        while attempts < self.config.retry_attempts:
            attempts += 1
            
            try:
                response = self.session.request(
                    method=method,
                    url=url,
                    headers=request_headers,
                    json=body if body else None,
                    timeout=actual_timeout,
                )
                
                if response.status_code == 402 and auto_sign:
                    requirement = self._parse_payment_requirement(response)
                    
                    if requirement.amount > actual_max_payment:
                        raise MaxPaymentExceededError(requirement.amount, actual_max_payment)
                    
                    if time.time() > requirement.expires:
                        raise PaymentExpiredError(
                            requirement.reference,
                            datetime.fromtimestamp(requirement.expires)
                        )
                    
                    if not self.keypair:
                        raise X402Error("Keypair required for automatic payments", "NO_KEYPAIR")
                    
                    signature = self._execute_payment(requirement)
                    
                    retry_headers = dict(request_headers)
                    retry_headers["X-402-Payment-Signature"] = signature
                    retry_headers["X-402-Payment-Reference"] = requirement.reference
                    
                    retry_response = self.session.request(
                        method=method,
                        url=url,
                        headers=retry_headers,
                        json=body if body else None,
                        timeout=actual_timeout,
                    )
                    
                    if not retry_response.ok:
                        self._handle_api_error(retry_response)
                    
                    return X402Response(
                        data=retry_response.json(),
                        status=retry_response.status_code,
                        headers=dict(retry_response.headers),
                        payment_made={
                            "amount": requirement.amount,
                            "currency": requirement.currency,
                            "signature": signature,
                        }
                    )
                
                if not response.ok:
                    self._handle_api_error(response)
                
                return X402Response(
                    data=response.json() if response.text else None,
                    status=response.status_code,
                    headers=dict(response.headers),
                )
                
            except RateLimitError as e:
                time.sleep(e.retry_after)
                continue
            except X402Error:
                raise
            except requests.Timeout:
                raise NetworkError("Request timed out")
            except requests.RequestException as e:
                last_error = e
                if attempts < self.config.retry_attempts:
                    time.sleep(self.config.retry_delay * attempts)
                    continue
                raise NetworkError("Network request failed", e)
        
        raise last_error or NetworkError("Max retry attempts exceeded")
    
    def verify(self, request: VerifyRequest) -> VerifyResponse:
        """Verify a payment transaction."""
        response = self._api_request("/verify", method="POST", body={
            "signature": request.signature,
            "reference": request.reference,
            "expected_amount": request.expected_amount,
            "expected_recipient": request.expected_recipient,
        })
        
        data = response.data
        return VerifyResponse(
            verified=data["verified"],
            transaction=TransactionDetails(
                signature=data["transaction"]["signature"],
                amount=data["transaction"]["amount"],
                currency=data["transaction"]["currency"],
                sender=data["transaction"]["sender"],
                recipient=data["transaction"]["recipient"],
                confirmed_at=data["transaction"]["confirmed_at"],
                slot=data["transaction"]["slot"],
                fee=data["transaction"].get("fee"),
            )
        )
    
    def create_payment_request(self, request: PaymentRequest) -> PaymentResponse:
        """Create a new payment request."""
        response = self._api_request("/payment-request", method="POST", body={
            "amount": request.amount,
            "currency": request.currency,
            "recipient": request.recipient,
            "memo": request.memo,
            "expires_in": request.expires_in,
        })
        
        data = response.data
        return PaymentResponse(
            reference=data["reference"],
            amount=data["amount"],
            currency=data["currency"],
            recipient=data["recipient"],
            expires=data["expires"],
            headers=data["headers"],
        )
    
    def get_balance(self, address: str) -> BalanceResponse:
        """Get wallet balance for an address."""
        response = self._api_request(f"/balance/{address}")
        data = response.data
        return BalanceResponse(
            address=data["address"],
            balances=data["balances"],
        )
    
    def get_transaction(self, signature: str) -> Dict[str, Any]:
        """Get transaction details by signature."""
        response = self._api_request(f"/transaction/{signature}")
        return response.data
    
    def get_transaction_history(
        self,
        request: TransactionHistoryRequest
    ) -> TransactionHistoryResponse:
        """Get transaction history for an address."""
        params = []
        if request.limit:
            params.append(f"limit={request.limit}")
        if request.before:
            params.append(f"before={request.before}")
        if request.after:
            params.append(f"after={request.after}")
        
        query = "&".join(params)
        url = f"/transactions/{request.address}"
        if query:
            url += f"?{query}"
        
        response = self._api_request(url)
        data = response.data
        
        return TransactionHistoryResponse(
            transactions=[
                TransactionDetails(**tx) for tx in data["transactions"]
            ],
            has_more=data["has_more"],
            next_cursor=data.get("next_cursor"),
        )
    
    def _api_request(
        self,
        endpoint: str,
        method: str = "GET",
        body: Optional[Any] = None,
    ) -> X402Response:
        """Make an API request to the X402 server."""
        url = f"{self.config.base_url}/api{endpoint}"
        return self.request(url, method=method, body=body, auto_sign=False)
    
    def _parse_payment_requirement(self, response: requests.Response) -> PaymentRequirement:
        """Parse payment requirement from 402 response headers."""
        headers = response.headers
        
        amount = float(headers.get("X-402-Amount", 0))
        currency = headers.get("X-402-Currency", "SOL")
        recipient = headers.get("X-402-Recipient", "")
        reference = headers.get("X-402-Reference", "")
        expires = int(headers.get("X-402-Expires", 0))
        network = headers.get("X-402-Network")
        
        if not amount or not recipient or not reference:
            raise X402Error("Invalid 402 response: missing required headers", "INVALID_402")
        
        return PaymentRequirement(
            amount=amount,
            currency=currency,
            recipient=recipient,
            reference=reference,
            expires=expires,
            network=network,
        )
    
    def _execute_payment(self, requirement: PaymentRequirement) -> str:
        """Execute a payment transaction."""
        signature = f"simulated_{int(time.time())}_{hash(requirement.reference) % 10000}"
        return signature
    
    def _handle_api_error(self, response: requests.Response) -> None:
        """Handle API error responses."""
        try:
            body = response.json()
        except:
            body = {}
        
        message = body.get("error") or body.get("message") or "Unknown API error"
        code = body.get("code", "API_ERROR")
        
        if response.status_code == 429:
            retry_after = int(response.headers.get("Retry-After", 60))
            raise RateLimitError(retry_after, body.get("limit", 0))
        
        raise X402Error(message, code, response.status_code, body)
