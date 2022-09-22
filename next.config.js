/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 10000,
  images: {
    domains: [
      'dweb.link',
      'ipfs.io',
      'ipfs.moralis.io',
      'raw.githubusercontent.com',
      'arpeggi.io',
      'arweave.net',
      'metadata.ens.domains',
    ],
  },
};
