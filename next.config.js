/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 120,
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
