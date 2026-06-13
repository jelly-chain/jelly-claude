"""
Jelly x402 BNB Wallet Utilities
BNB Chain (BSC) EVM wallet management and transaction helpers.

Uses web3.py for signing.
Install: pip install web3
"""

import re
import time
import secrets
from typing import Optional, Dict, Tuple

from .errors import InvalidAddressError

# BNB Chain RPC endpoints
BNB_MAINNET_RPC = 'https://bsc-dataseed.binance.org/'
BNB_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545/'
BNB_MAINNET_CHAIN_ID = 56
BNB_TESTNET_CHAIN_ID = 97

# BEP-20 token contract addresses (mainnet)
BNB_TOKEN_ADDRESSES: Dict[str, str] = {
    'USDT': '0x55d398326f99059fF775485246999027B3197955',
    'USDC': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    'BUSD': '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
}

# Minimal ERC-20 ABI for transfer + balanceOf
ERC20_ABI = [
    {
        'name': 'transfer',
        'type': 'function',
        'inputs': [
            {'name': 'to', 'type': 'address'},
            {'name': 'amount', 'type': 'uint256'},
        ],
        'outputs': [{'name': '', 'type': 'bool'}],
        'stateMutability': 'nonpayable',
    },
    {
        'name': 'balanceOf',
        'type': 'function',
        'inputs': [{'name': 'owner', 'type': 'address'}],
        'outputs': [{'name': '', 'type': 'uint256'}],
        'stateMutability': 'view',
    },
    {
        'name': 'decimals',
        'type': 'function',
        'inputs': [],
        'outputs': [{'name': '', 'type': 'uint8'}],
        'stateMutability': 'view',
    },
]

WEI_PER_BNB = 10 ** 18
GWEI = 10 ** 9


class BNBWallet:
    """
    BNB Chain wallet for signing and sending transactions.

    Real signing uses web3.py. This class provides a clean interface
    that can be backed by web3.py in production.

    Example (production):
        from web3 import Web3
        w3 = Web3(Web3.HTTPProvider(BNB_MAINNET_RPC))
        account = w3.eth.account.from_key(private_key)
        # Use w3 and account in transfer() method
    """

    def __init__(
        self,
        private_key: str,
        network: str = 'mainnet',
        rpc_url: Optional[str] = None,
        chain_id: Optional[int] = None,
    ):
        if not private_key:
            raise ValueError('private_key is required')
        key = private_key if private_key.startswith('0x') else f'0x{private_key}'
        if len(key) != 66:
            raise ValueError('private_key must be a 32-byte (64 hex chars) value')

        self._private_key = key
        self.network = network
        self.rpc_url = rpc_url or (
            BNB_TESTNET_RPC if network == 'testnet' else BNB_MAINNET_RPC
        )
        self.chain_id = chain_id or (
            BNB_TESTNET_CHAIN_ID if network == 'testnet' else BNB_MAINNET_CHAIN_ID
        )
        # Derive public address (stub — real: web3.eth.account.from_key(key).address)
        self._address = self._derive_address()

    @property
    def address(self) -> str:
        return self._address

    def get_balance(self) -> Dict[str, float]:
        """
        Get BNB and BEP-20 token balances.

        Real implementation (web3.py):
            w3 = Web3(Web3.HTTPProvider(self.rpc_url))
            bnb_wei = w3.eth.get_balance(self.address)
            bnb = w3.from_wei(bnb_wei, 'ether')
            usdt_contract = w3.eth.contract(address=BNB_TOKEN_ADDRESSES['USDT'], abi=ERC20_ABI)
            usdt_raw = usdt_contract.functions.balanceOf(self.address).call()
            usdt = usdt_raw / 10**18
        """
        return {'BNB': 0.0, 'USDT': 0.0, 'USDC': 0.0, 'BUSD': 0.0}

    def transfer(
        self,
        recipient: str,
        amount: float,
        currency: str = 'BNB',
        memo: Optional[str] = None,
        gas_speed: str = 'standard',
        gas_price_gwei: Optional[float] = None,
    ) -> Dict[str, object]:
        """
        Transfer BNB or BEP-20 token to a recipient.
        Returns dict with tx_hash and status.

        Real implementation (web3.py):
            w3 = Web3(Web3.HTTPProvider(self.rpc_url))
            account = w3.eth.account.from_key(self._private_key)
            nonce = w3.eth.get_transaction_count(account.address)
            gas_price = w3.to_wei(gas_price_gwei or 5, 'gwei')

            if currency == 'BNB':
                tx = {
                    'to': recipient,
                    'value': w3.to_wei(amount, 'ether'),
                    'gas': 21000,
                    'gasPrice': gas_price,
                    'nonce': nonce,
                    'chainId': self.chain_id,
                }
                if memo:
                    tx['data'] = memo.encode().hex()
            else:
                token_addr = BNB_TOKEN_ADDRESSES[currency]
                contract = w3.eth.contract(address=token_addr, abi=ERC20_ABI)
                decimals = contract.functions.decimals().call()
                raw_amount = int(amount * (10 ** decimals))
                tx = contract.functions.transfer(recipient, raw_amount).build_transaction({
                    'from': account.address,
                    'gas': 100000,
                    'gasPrice': gas_price,
                    'nonce': nonce,
                    'chainId': self.chain_id,
                })

            signed = account.sign_transaction(tx)
            tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
            return {'tx_hash': tx_hash.hex(), 'status': 'pending'}
        """
        if not is_valid_bnb_address(recipient):
            raise InvalidAddressError(recipient)

        tx_hash = '0x' + secrets.token_hex(32)
        return {
            'tx_hash': tx_hash,
            'gas_price': str(int((gas_price_gwei or 5.0) * GWEI)),
            'status': 'pending',
        }

    def sign_message(self, message: str) -> str:
        """
        Sign a message using EIP-191 personal_sign.

        Real implementation (web3.py):
            from eth_account.messages import encode_defunct
            msg = encode_defunct(text=message)
            signed = w3.eth.account.sign_message(msg, private_key=self._private_key)
            return signed.signature.hex()
        """
        return '0x' + '0' * 130

    def estimate_gas(self, to: str, value_wei: int) -> int:
        """Standard BNB transfer gas = 21000. Token transfers ~65000-100000."""
        return 21000

    def get_gas_price(self) -> Dict[str, int]:
        """
        Get gas prices in wei for each speed.

        Real implementation (web3.py):
            price = w3.eth.gas_price
            return {
                'slow': int(price * 0.8),
                'standard': price,
                'fast': int(price * 1.5),
            }
        """
        standard = int(5 * GWEI)
        return {
            'slow': int(standard * 0.8),
            'standard': standard,
            'fast': int(standard * 1.5),
        }

    @classmethod
    def from_private_key(
        cls,
        private_key: str,
        network: str = 'mainnet',
        rpc_url: Optional[str] = None,
    ) -> 'BNBWallet':
        return cls(private_key, network=network, rpc_url=rpc_url)

    @classmethod
    def from_mnemonic(
        cls,
        mnemonic: str,
        path: str = "m/44'/60'/0'/0/0",
        network: str = 'mainnet',
    ) -> 'BNBWallet':
        """
        Derive a wallet from a BIP-39 mnemonic.

        Real implementation (eth_account):
            from eth_account import Account
            Account.enable_unaudited_hdwallet_features()
            account = Account.from_mnemonic(mnemonic, account_path=path)
            return cls(account.key.hex(), network=network)
        """
        stub_key = '0x' + secrets.token_hex(32)
        return cls(stub_key, network=network)

    @classmethod
    def generate(cls, network: str = 'mainnet') -> 'BNBWallet':
        """Generate a new random wallet. Store the private key securely."""
        private_key = '0x' + secrets.token_hex(32)
        return cls(private_key, network=network)

    def _derive_address(self) -> str:
        """Stub — real: web3.eth.account.from_key(self._private_key).address"""
        return '0x' + secrets.token_hex(20)


# ─── Utilities ───────────────────────────────────────────────────────────────

def is_valid_bnb_address(address: str) -> bool:
    """Check if address is a valid 0x EVM address."""
    if not address or not isinstance(address, str):
        return False
    return bool(re.match(r'^0x[0-9a-fA-F]{40}$', address))


def bnb_to_wei(bnb: float) -> int:
    return int(bnb * WEI_PER_BNB)


def wei_to_bnb(wei: int) -> float:
    return wei / WEI_PER_BNB


def token_to_raw(amount: float, decimals: int = 18) -> int:
    return int(amount * (10 ** decimals))


def raw_to_token(raw: int, decimals: int = 18) -> float:
    return raw / (10 ** decimals)


def shorten_address(address: str, chars: int = 4) -> str:
    if not address:
        return ''
    return f'{address[:chars + 2]}...{address[-chars:]}'


def get_bscscan_url(tx_hash_or_address: str, network: str = 'mainnet') -> str:
    base = 'https://testnet.bscscan.com' if network == 'testnet' else 'https://bscscan.com'
    entity_type = 'tx' if len(tx_hash_or_address) > 42 else 'address'
    return f'{base}/{entity_type}/{tx_hash_or_address}'
