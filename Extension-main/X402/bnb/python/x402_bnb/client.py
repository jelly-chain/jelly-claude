"""
Jelly x402 BNB Client
Make HTTP 402 payment-enabled requests settled on BNB Chain (BSC).

BNB Chain specifics:
  - Chain ID 56 (mainnet) / 97 (testnet)
  - EVM-compatible 0x addresses
  - Native token: BNB | BEP-20 tokens: USDT, USDC, BUSD
  - Transactions identified by txHash (not 'signature')
  - Gas paid in BNB (denominated in gwei)
"""

import time
from typing import Optional, Any, Dict
from datetime import datetime

import requests

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
    BNBGasEstimate,
)
from .errors import (
    X402Error,
    NetworkError,
    RateLimitError,
    MaxPaymentExceededError,
    PaymentExpiredError,
)
from .wallet import BNBWallet


class BNBX402Client:
    """
    Main client for HTTP 402 autonomous payments on BNB Chain.

    Usage:
        from x402_bnb import BNBX402Client, BNBWallet

        wallet = BNBWallet.from_private_key(os.environ['BNB_PRIVATE_KEY'])
        client = BNBX402Client(api_key=os.environ['JELLY_API_KEY'])
        client.set_wallet(wallet)

        response = client.request('https://api.example.com/premium-data')
        print(response.data)
        if response.payment_made:
            print(f"Paid {response.payment_made['amount']} {response.payment_made['currency']}")
            print(f"Tx: {response.payment_made['tx_hash']}")
    """

    def __init__(
        self,
        api_key: str,
        base_url: str = 'https://api.jellychain.fun',
        network: str = 'mainnet',
        chain_id: int = 56,
        max_payment_per_request: float = 0.01,
        gas_speed: str = 'standard',
        timeout: int = 30,
        retry_attempts: int = 3,
        retry_delay: float = 1.0,
    ):
        self.config = BNBConfig(
            api_key=api_key,
            base_url=base_url.rstrip('/'),
            network=network,
            chain_id=chain_id,
            max_payment_per_request=max_payment_per_request,
            gas_speed=gas_speed,
            timeout=timeout,
            retry_attempts=retry_attempts,
            retry_delay=retry_delay,
        )
        self.wallet: Optional[BNBWallet] = None
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'X-402-SDK': 'jelly-x402-bnb',
            'X-402-SDK-Version': '1.0.0',
            'X-402-Chain-Id': str(chain_id),
        })

    def set_wallet(self, wallet: BNBWallet) -> None:
        """Attach a BNBWallet for automatic payment signing."""
        self.wallet = wallet

    def request(
        self,
        url: str,
        method: str = 'GET',
        headers: Optional[Dict[str, str]] = None,
        body: Optional[Any] = None,
        timeout: Optional[int] = None,
        max_payment: Optional[float] = None,
        auto_sign: bool = True,
    ) -> BNBResponse:
        """
        Make an HTTP request with automatic HTTP 402 handling on BNB Chain.

        When the endpoint returns 402:
          1. Parses X-402-* headers for payment requirement
          2. Checks amount ≤ max_payment_per_request and not expired
          3. Sends BNB/BEP-20 on-chain via the attached wallet
          4. Retries original request with X-402-Payment-TxHash header
        """
        req_headers = dict(self.session.headers)
        if headers:
            req_headers.update(headers)

        actual_timeout = timeout or self.config.timeout
        actual_max = max_payment or self.config.max_payment_per_request

        attempts = 0
        last_error = None

        while attempts < self.config.retry_attempts:
            attempts += 1
            try:
                response = self.session.request(
                    method=method,
                    url=url,
                    headers=req_headers,
                    json=body or None,
                    timeout=actual_timeout,
                )

                if response.status_code == 402 and auto_sign:
                    requirement = self._parse_payment_requirement(response)

                    if requirement.amount > actual_max:
                        raise MaxPaymentExceededError(requirement.amount, actual_max)

                    if time.time() > requirement.expires:
                        raise PaymentExpiredError(
                            requirement.reference,
                            datetime.fromtimestamp(requirement.expires),
                        )

                    if not self.wallet:
                        raise X402Error(
                            'BNBWallet required — call set_wallet(wallet) first',
                            'NO_WALLET',
                        )

                    tx = self._execute_payment(requirement)

                    retry_headers = dict(req_headers)
                    retry_headers['X-402-Payment-TxHash'] = tx['tx_hash']
                    retry_headers['X-402-Payment-Reference'] = requirement.reference
                    retry_headers['X-402-Chain-Id'] = str(requirement.chain_id)

                    retry_response = self.session.request(
                        method=method,
                        url=url,
                        headers=retry_headers,
                        json=body or None,
                        timeout=actual_timeout,
                    )

                    if not retry_response.ok:
                        self._handle_api_error(retry_response)

                    return BNBResponse(
                        data=retry_response.json(),
                        status=retry_response.status_code,
                        headers=dict(retry_response.headers),
                        payment_made={
                            'amount': requirement.amount,
                            'currency': requirement.currency,
                            'tx_hash': tx['tx_hash'],
                            'gas_price': tx.get('gas_price'),
                        },
                    )

                if not response.ok:
                    self._handle_api_error(response)

                return BNBResponse(
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
                raise NetworkError('Request timed out')
            except requests.RequestException as e:
                last_error = e
                if attempts < self.config.retry_attempts:
                    time.sleep(self.config.retry_delay * attempts)
                    continue
                raise NetworkError('Network request failed', e)

        raise last_error or NetworkError('Max retry attempts exceeded')

    def verify(self, request: BNBVerifyRequest) -> BNBVerifyResponse:
        """Verify a BNB Chain payment by transaction hash."""
        response = self._api_request('/bnb/verify', method='POST', body={
            'tx_hash': request.tx_hash,
            'reference': request.reference,
            'expected_amount': request.expected_amount,
            'expected_recipient': request.expected_recipient,
            'currency': request.currency,
        })
        d = response.data
        return BNBVerifyResponse(
            verified=d['verified'],
            transaction=BNBTransactionDetails(
                tx_hash=d['transaction']['tx_hash'],
                block_number=d['transaction']['block_number'],
                amount=d['transaction']['amount'],
                currency=d['transaction']['currency'],
                sender=d['transaction']['sender'],
                recipient=d['transaction']['recipient'],
                confirmed_at=d['transaction']['confirmed_at'],
                gas_used=d['transaction']['gas_used'],
                gas_price=d['transaction']['gas_price'],
                network_fee=d['transaction']['network_fee'],
                chain_id=d['transaction']['chain_id'],
            ),
        )

    def create_payment_request(self, request: BNBPaymentRequest) -> BNBPaymentResponse:
        """Create a new BNB Chain payment request."""
        response = self._api_request('/bnb/payment-request', method='POST', body={
            'amount': request.amount,
            'currency': request.currency,
            'recipient': request.recipient,
            'memo': request.memo,
            'expires_in': request.expires_in,
        })
        d = response.data
        return BNBPaymentResponse(
            reference=d['reference'],
            amount=d['amount'],
            currency=d['currency'],
            recipient=d['recipient'],
            expires=d['expires'],
            chain_id=d['chain_id'],
            headers=d.get('headers', {}),
        )

    def get_balance(self, address: str) -> BNBBalanceResponse:
        """Get BNB and BEP-20 token balances for an address."""
        response = self._api_request(f'/bnb/balance/{address}')
        d = response.data
        return BNBBalanceResponse(
            address=d['address'],
            balances=d['balances'],
        )

    def get_transaction(self, tx_hash: str) -> Dict[str, Any]:
        """Get transaction details by hash."""
        response = self._api_request(f'/bnb/transaction/{tx_hash}')
        return response.data

    def get_transaction_history(
        self,
        request: BNBTransactionHistoryRequest,
    ) -> BNBTransactionHistoryResponse:
        """Get transaction history for a BNB address."""
        params = []
        if request.limit:
            params.append(f'limit={request.limit}')
        if request.before:
            params.append(f'before={request.before}')
        if request.after:
            params.append(f'after={request.after}')
        if request.currency:
            params.append(f'currency={request.currency}')

        qs = '&'.join(params)
        url = f'/bnb/transactions/{request.address}'
        if qs:
            url += f'?{qs}'

        response = self._api_request(url)
        d = response.data
        return BNBTransactionHistoryResponse(
            transactions=[BNBTransactionDetails(**tx) for tx in d.get('transactions', [])],
            has_more=d.get('has_more', False),
            next_cursor=d.get('next_cursor'),
        )

    def get_gas_estimate(self) -> BNBGasEstimate:
        """Get current BNB Chain gas price estimates."""
        response = self._api_request('/bnb/gas')
        d = response.data
        return BNBGasEstimate(
            slow_gwei=d.get('slow', {}).get('gwei', 3.0),
            standard_gwei=d.get('standard', {}).get('gwei', 5.0),
            fast_gwei=d.get('fast', {}).get('gwei', 7.0),
            slow_seconds=d.get('slow', {}).get('estimated_seconds', 30),
            standard_seconds=d.get('standard', {}).get('estimated_seconds', 10),
            fast_seconds=d.get('fast', {}).get('estimated_seconds', 3),
        )

    def _api_request(
        self,
        endpoint: str,
        method: str = 'GET',
        body: Optional[Any] = None,
    ) -> BNBResponse:
        url = f'{self.config.base_url}/api{endpoint}'
        return self.request(url, method=method, body=body, auto_sign=False)

    def _parse_payment_requirement(
        self,
        response: requests.Response,
    ) -> BNBPaymentRequirement:
        """Parse X-402-* headers from a 402 response."""
        h = response.headers
        amount = float(h.get('X-402-Amount', 0))
        currency = h.get('X-402-Currency', 'BNB')
        recipient = h.get('X-402-Recipient', '')
        reference = h.get('X-402-Reference', '')
        expires = int(h.get('X-402-Expires', 0))
        chain_id = int(h.get('X-402-Chain-Id', 56))
        network = h.get('X-402-Network')

        if not amount or not recipient or not reference:
            raise X402Error('Invalid 402 response: missing BNB payment headers', 'INVALID_402')

        return BNBPaymentRequirement(
            amount=amount,
            currency=currency,
            recipient=recipient,
            reference=reference,
            expires=expires,
            chain_id=chain_id,
            network=network,
        )

    def _execute_payment(self, requirement: BNBPaymentRequirement) -> Dict[str, Any]:
        """Execute a BNB/BEP-20 transfer for the given payment requirement."""
        if not self.wallet:
            raise X402Error('No wallet configured', 'NO_WALLET')

        tx = self.wallet.transfer(
            recipient=requirement.recipient,
            amount=requirement.amount,
            currency=requirement.currency,
            memo=requirement.reference,
            gas_speed=self.config.gas_speed,
        )
        return tx

    def _handle_api_error(self, response: requests.Response) -> None:
        try:
            body = response.json()
        except Exception:
            body = {}

        message = body.get('error') or body.get('message') or 'Unknown API error'
        code = body.get('code', 'API_ERROR')

        if response.status_code == 429:
            retry_after = int(response.headers.get('Retry-After', 60))
            raise RateLimitError(retry_after, body.get('limit', 0))

        raise X402Error(message, code, response.status_code, body)


class AsyncBNBX402Client:
    """
    Async wrapper around BNBX402Client using httpx for async HTTP.

    Usage:
        from x402_bnb import AsyncBNBX402Client, BNBWallet
        import asyncio

        async def main():
            wallet = BNBWallet.from_private_key(os.environ['BNB_PRIVATE_KEY'])
            client = AsyncBNBX402Client(api_key=os.environ['JELLY_API_KEY'])
            client.set_wallet(wallet)

            response = await client.request('https://api.example.com/premium')
            print(response.data)

        asyncio.run(main())

    Requires: pip install httpx
    """

    def __init__(self, api_key: str, **kwargs):
        self._sync_client = BNBX402Client(api_key=api_key, **kwargs)

    def set_wallet(self, wallet: BNBWallet) -> None:
        self._sync_client.set_wallet(wallet)

    async def request(self, url: str, **kwargs) -> BNBResponse:
        """
        Async HTTP request with automatic 402 BNB payment.

        Real implementation uses httpx.AsyncClient:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers)
                if response.status_code == 402:
                    # ... handle payment ...
        """
        import asyncio
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, lambda: self._sync_client.request(url, **kwargs)
        )

    async def verify(self, request: BNBVerifyRequest) -> BNBVerifyResponse:
        import asyncio
        return await asyncio.get_event_loop().run_in_executor(
            None, lambda: self._sync_client.verify(request)
        )

    async def get_balance(self, address: str) -> BNBBalanceResponse:
        import asyncio
        return await asyncio.get_event_loop().run_in_executor(
            None, lambda: self._sync_client.get_balance(address)
        )

    async def get_gas_estimate(self) -> BNBGasEstimate:
        import asyncio
        return await asyncio.get_event_loop().run_in_executor(
            None, lambda: self._sync_client.get_gas_estimate()
        )
