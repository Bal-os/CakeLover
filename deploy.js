const ArconaERC20Sale = artifacts.require('ArconaERC20Sale');
const DToken = artifacts.require('DToken');

module.exports = async (callback) => {
  console.log('Begin deploy!\n');

  const tokenAddress = '0x55d398326f99059fF775485246999027B3197955';
  const newOwner = '0x9527827538E9120bd1bbdc8A5ddb532F4ed5e75C';

  try {
    const arconaERC20Sale = await ArconaERC20Sale.new(tokenAddress);
    const dToken = await DToken.new();

    console.log('Contract deployed!');

    await arconaERC20Sale.transferOwnership(newOwner);
    await dToken.transferOwnership(newOwner);

    console.log('arconaERC20Sale: ', arconaERC20Sale.address);
    console.log('dToken: ', dToken.address);
    console.log('\nDone!');
  } catch (e) {
    console.log(e.message);
  }

  callback();
};
