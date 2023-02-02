# NFT Marketplace [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Open%20source%20nft%20marketplace:&url=https://github.com/DexKit/open-nft-marketplace)

[![NFT marketplace](https://img.youtube.com/vi/9UxtgAkNG1k/0.jpg)](https://www.youtube.com/watch?v=9UxtgAkNG1k 'Marketplace by DexKit')

This marketplace is the DexKit open source showcase on how to use 0x v4 nft smart contracts on a production app. Additionally, we are building a [zero code solution](https://whitelabel-nft.dexkit.com/admin/setup) with premium features to help artists deploy their own marketplace in an easy and secure way. Check our docs about it [here](https://docs.dexkit.com/defi-products/nft-marketplace/overview).

On this marketplace you can make offers and listings of ERC721 Tokens on the chains supported by 0x smart contracts, namely: Ethereum, Binance Smart Chain, Polygon, Fantom, Avalanche, Celo and Optimism.

# How to Start

clone this repo

```
git clone https://github.com/DexKit/open-nft-marketplace.git
```

Install it:

```sh
yarn
```

Create an .env file with INFURA_API_KEY set with your Infura API key and then run the app

```sh
yarn dev
```

# Contributing

Check [Contributing](CONTRIBUTING.md) for a more in depth way how to contribute.

# Deployment

We recommend Vercel to deploy this app, after you made your changes on the app.json config file, just use the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDexKit%2Fopen-nft-marketplace&env=INFURA_API_KEY)

Note that you need to set up INFURA_API_KEY to Next js be able to generate pages.

# Tech used

Started from [NEXT JS + Material UI+ Typescript + Boilerplat](https://github.com/mui/material-ui/tree/master/examples/nextjs-with-typescript)

Additionally we use trader sdk to handle nft smart contract interactions, react query to handle all http and blockchain requests, format js for internalization, web3 react to handle wallet logic. You can check our requirements [here](REQUIREMENTS.md).

# Roadmap

We will be adding any new evm network that 0x smart contracts will support.

It is also planned to extract all common hooks and state used to interact with the blockchain to a library repo.

# Customization

If you need a zero code solution we are building one currently in beta at [wizard](https://whitelabel-nft.dexkit.com/admin/setup), check our [docs](https://docs.dexkit.com/defi-products/nft-marketplace/overview) as well about it. Instead, if you want to deploy your own custom solution using this repo, please fork it, update the app.json file accordingly on the config folder and then deploy on Vercel (Recommended) or Heroku.

# Missing feature?

We welcome missing features, but take in mind that this repo is intended to be a base app for any dev to start working on, if it makes sense to have that feature on this base app we will include, if it is considered a premium feature, we will be including on our premium marketplace which uses this one as a base.

We at the moment consider premium features as follows:

- [ ] - NFT trading history

- [ ] - Artist page

- [ ] - Cache optimizations

- [ ] - Fetch NFT and token balances via api without the need to import, using Alchemy for instance

- [ ] - Swap ERC20 <-> ERC20 tokens

- [ ] - Collection level stats like orders, max supply, floor price, number of trades

- [ ] - Improved SEO

# Acknowledgements

We would like to thank ZRX project for these amazing tools and ZRX DAO for the support on building this open source app.

# Wanna talk about this repo

Join our dedicated channel [Open NFT Support](https://discord.gg/FnkrFAY7Za)
