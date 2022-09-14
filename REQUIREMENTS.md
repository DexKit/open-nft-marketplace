# REQUIREMENTS

DexKit Whitelabel Marketplace will use the follow technologies:

- NEXT js - for handle SEO and app loading
- Web3React - for web3 wallet management
- TraderSDK - for easy swaps management using 0x behind the hood
- Material UI - battle tested framework and easily configurable
- TheGraph - Orders history and onchain orders discovery
- ReactQuery - for fetching APIS and mutations
- Typescript - for easy typings

## APP structure

The Apps follows a standard structure by modules, being each module planned to act independently
src/

- hooks
- services
- constants
- components
- utils
- themes
- actions
- state
- types
- conectors
- modules
  - favories
  - home
  - orders
  - nft
  - wallet

Each module is structured as follows:

- components - pure components
- constants - constants used on this module
- hooks - act as the connection between services and pages
- services - async fetching and outside logic
- pages - presentation
- utils - pure functions
- tests
  - integration
  - unit

index.tsx --> routes

## APP Features

- Wallet ERC20 balance fetching for the main tokens and coins dependent of chain. APP supports natively the follow tokens USDC, USDT, DAI, and as coins ETH, MATIC and BNB, this part is configurable. Unsupported tokens could be imported
- Wallet ERC721 balance display. User can import any NFT by ID. Collections could be added by wizard
- Notifications - Each in app interaction generates a notification for user and stores a transaction on the store
- NFT list of available orders for trade
- NFT detail - A visit to a page it will fetch all data onchain, by /:chainname/:contract_address/:id . User can place sell order, buy order, or transfer
- internationalization - It will be built from the ground up with internationalization in mind
