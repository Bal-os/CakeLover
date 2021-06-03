/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const HDWalletProvider = require('truffle-hdwallet-provider');
require('dotenv').config(); // Store environment-specific variable from '.env' to process.env

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    development: {
      host: 'localhost', // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: '*', // Any network (default: none)
      gas: 6000000,
      gasLimit: 6000000, // <-- Use this high gas value
      gasPrice: 1,
    },
    ropsten: {
      provider: () => new HDWalletProvider(
        process.env.MNENOMIC,
        `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
      ),
      network_id: 3,
      // gas: 8000000,
      // gasLimit: 8000000,
      gasPrice: 15000000000,
    },
    rinkeby: {
      provider: () => new HDWalletProvider(
        process.env.MNENOMIC,
        `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      ),
      network_id: 4,
      gasPrice: 5000000000,
    },
    kovan: {
      provider: () => new HDWalletProvider(
        process.env.MNENOMIC,
        `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`, 0, 3,
      ),
      network_id: 42,
      // gas: 8000000,
      // gasLimit: 8000000,
      gasPrice: 10000000,
    },
    bscTestnet: {
      provider: () => new HDWalletProvider(
        process.env.MNENOMIC,
        'https://data-seed-prebsc-1-s1.binance.org:8545',
        0,
        2,
      ),
      network_id: 97,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true,
      gasPrice: 10000000000,
    },
    bsc: {
      provider: () => new HDWalletProvider(process.env.MNENOMIC, 'https://bsc-dataseed1.binance.org', 0, 2),
      network_id: 56,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true,
      gasPrice: 5000000000,
      from: '0x0711BE4a30a2BE3b7902F4E19F9CDB530b34c6F6',
    },
    main: {
      provider: () => new HDWalletProvider(
        process.env.MNENOMIC, `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      ),
      gasPrice: 1,
      network_id: 1,
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.8.0', // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      optimizer: {
        enabled: false,
        runs: 200,
      },
      //  evmVersion: "byzantium"
      // }
    },
  },

  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY,
    bscscan: process.env.BSCSCAN_API_KEY,
  },

  plugins: [
    'truffle-plugin-verify',
  ],
};
