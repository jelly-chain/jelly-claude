from setuptools import setup, find_packages

setup(
    name='jelly-x402-bnb',
    version='1.0.0',
    description='Jelly x402 BNB Chain SDK — HTTP 402 autonomous payments on BSC',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    author='Jelly Chain',
    url='https://github.com/jelly-chain/sdk',
    license='MIT',
    packages=find_packages(),
    python_requires='>=3.9',
    install_requires=[
        'requests>=2.28.0',
    ],
    extras_require={
        'web3': ['web3>=6.0.0'],
        'async': ['httpx>=0.24.0'],
        'flask': ['flask>=2.0.0'],
        'fastapi': ['fastapi>=0.100.0'],
        'full': ['web3>=6.0.0', 'httpx>=0.24.0', 'flask>=2.0.0'],
    },
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Programming Language :: Python :: 3.12',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Software Development :: Libraries :: Python Modules',
    ],
    keywords=['bnb', 'bsc', 'binance', 'x402', 'http402', 'payment', 'web3', 'ai-agents', 'jelly'],
    project_urls={
        'Homepage': 'https://jellychain.fun',
        'Documentation': 'https://jellychain.fun/docs',
        'Source': 'https://github.com/jelly-chain/sdk',
        'Tracker': 'https://github.com/jelly-chain/sdk/issues',
    },
)
