# uniswapv3-deployment

## Frontend

You need to go to `uniswapv3-frontend` directory to run the following commands.

### Setup

Make sure to install the dependencies:

```bash
# npm
npm install
```

### Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

### Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

## Uniswap V3 Deployment on Zircuit

Navigate to the project directory `uniswapv3-deployment`

### Installing dependencies

Run the following command to install all the required dependencies:
```bash
npm install
```

### Setting up the Variables

Add your Zircuit private keys to the `hardhat.config.js` as follows:

```bash
const ZIRCUIT_PRIVATE_KEY1 = <your_private_key_1>;
const ZIRCUIT_PRIVATE_KEY2 = <your_private_key_2>;
```

### Compile Contracts

Compile the Solidity contracts:

```bash
npx hardhat compile
```

### Deploy Contracts

Deploy the core Uniswap V3 contracts on the Zircuit network:

```bash
npx hardhat run --network zircuit scripts/01_deployContracts.js
```

The deployment addresses will be automatically logged to the .env file.

### Deploy Tokens

Deploy the USDT, USDC, and WBTC token contracts:

```bash
npx hardhat run --network zircuit scripts/02_deployTokens.js
```

The token addresses will be appended to the .env file.

### Deploy Pool

Create a new USDT/USDC pool on the Zircuit network:

```bash
npx hardhat run --network zircuit scripts/03_deployPools.js
```

The pool address will be appended to the .env file.

### Add Liquidity

Add liquidity to the USDT/USDC pool:

```bash
npx hardhat run --network zircuit scripts/04_addLiquidity.js
```

This will mint a new liquidity provider NFT position for the secondary signer account.

### Check Liquidity

Retrieve and log the current liquidity and pool data for the USDT/USDC pool:

```bash
npx hardhat run --network zircuit scripts/05_checkLiquidity.js
```

