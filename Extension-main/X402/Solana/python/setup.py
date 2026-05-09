"""
Jelly x402 SDK for Python
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="jelly-x402",
    version="1.0.0",
    author="Jelly Chain",
    author_email="support@jellychain.fun",
    description="Official Python SDK for the Jelly x402 autonomous payment protocol on Solana",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/jelly-chain/sdk",
    project_urls={
        "Documentation": "https://jellychain.fun/docs",
        "Bug Tracker": "https://github.com/jelly-chain/sdk/issues",
        "Source": "https://github.com/jelly-chain/sdk",
    },
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Office/Business :: Financial :: Point-Of-Sale",
    ],
    keywords="jelly x402 solana payments ai agents autonomous http-402 web3 blockchain jellychain",
    python_requires=">=3.9",
    install_requires=[
        "requests>=2.28.0",
    ],
    extras_require={
        "flask": ["flask>=2.0.0"],
        "solana": ["solana>=0.30.0", "solders>=0.18.0"],
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "mypy>=1.0.0",
            "flake8>=6.0.0",
        ],
    },
)
