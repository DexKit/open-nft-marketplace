/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  staticPageGenerationTimeout: 1000,
  images: {
    domains: [
      'dweb.link',
      'ipfs.io',
      'ipfs.moralis.io',
      'raw.githubusercontent.com',
      'arpeggi.io',
      'arweave.net',
    ],
  },
};
