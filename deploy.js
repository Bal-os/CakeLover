const ARCONA = artifacts.require('ARCONA');
const ARLAND = artifacts.require('ARLAND');

module.exports = async (callback) => {
  console.log('Begin deploy!\n');

  const tokenAddress = '0x55d398326f99059fF775485246999027B3197955';
  const newOwner = '0x9527827538E9120bd1bbdc8A5ddb532F4ed5e75C';

  try {
    const arcona = await ARCONA.new(tokenAddress);
    const arland = await ARLAND.new();

    console.log('Contract deployed!');

    await arcona.transferOwnership(newOwner);
    await arland.transferOwnership(newOwner);

    console.log('arcona: ', arcona.address);
    console.log('arland: ', arland.address);
    console.log('\nDone!');
  } catch (e) {
    console.log(e.message);
  }

  callback();
};
