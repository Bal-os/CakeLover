const { use, expect } = require('chai');
const { solidity } = require('ethereum-waffle');

use(solidity);
use(require('chai-as-promised')).should();

const ArconaERC20Sale = artifacts.require('ArconaERC20Sale');
const ERC20Mock = artifacts.require('ERC20Mock');

const Helper = require('./helpers/helper');
const Reverter = require('./helpers/reverter');

contract('ArconaERC20Sale', async (accounts) => {
  const reverter = new Reverter(web3);
  const h = new Helper();

  let arconaERC20Sale;
  let erc20Mock;

  const IVAN = accounts[1];

  before('setup', async () => {
    erc20Mock = await ERC20Mock.new();
    arconaERC20Sale = await ArconaERC20Sale.new(erc20Mock.address);

    await reverter.snapshot();
  });

  afterEach(async () => {
    await reverter.revert();
  });

  describe('exchange()', async () => {
    beforeEach(async () => {
      const tokensToTransfer = h.toWei('500');
      await erc20Mock.transfer(IVAN, tokensToTransfer);
      await erc20Mock.approve(arconaERC20Sale.address, tokensToTransfer, { from: IVAN });
    });

    it('should exchange tokens', async () => {
      for (let i = 0.25; i <= 10; i += 0.25) {
        const tokenPrice = i;
        const tokenToExchange = 1 + i;

        await arconaERC20Sale.setTokenPrice(h.toWei(tokenPrice));
        const tokenWillMint = await arconaERC20Sale.calculateTokensAmountAfterExchange(h.toWei(tokenToExchange));

        const tokenBalanceBefore = (await arconaERC20Sale.balanceOf(IVAN)).toString();
        const tokenMockBalanceBefore = (await erc20Mock.balanceOf(IVAN)).toString();
        const contractBalanceBefore = (await erc20Mock.balanceOf(arconaERC20Sale.address)).toString();

        await arconaERC20Sale.exchange(h.toWei(tokenToExchange), { from: IVAN });

        const tokenBalanceAfter = (await arconaERC20Sale.balanceOf(IVAN)).toString();
        const tokenMockBalanceAfter = (await erc20Mock.balanceOf(IVAN)).toString();
        const contractBalanceAfter = (await erc20Mock.balanceOf(arconaERC20Sale.address)).toString();

        assert.equal(tokenBalanceAfter, h.toBN(tokenBalanceBefore).plus(tokenWillMint).toString());
        assert.equal(tokenMockBalanceAfter, h.toBN(tokenMockBalanceBefore).minus(h.toWei(tokenToExchange)).toString());
        assert.equal(contractBalanceAfter, h.toBN(contractBalanceBefore).plus(h.toWei(tokenToExchange)).toString());
        // console.log(`${tokenToExchange}A exchanged to ${h.fromWei(h.toBN(tokenBalanceAfter)
        //   .minus(tokenBalanceBefore)).toString()}B with course 1B=${tokenPrice}A`);
      }
    });

    it('should revert if token price not set or equal 0', async () => {
      await expect(arconaERC20Sale.exchange(h.toWei('22'), { from: IVAN }))
        .to.be.revertedWith('E-85');
    });

    it('should revert if exchange amount to low', async () => {
      await arconaERC20Sale.setTokenPrice(h.toWei('1'));
      await expect(arconaERC20Sale.exchange(h.toWei('0.5'), { from: IVAN }))
        .to.be.revertedWith('E-86');
    });
  });

  describe('calculateTokensAmountAfterExchange()', async () => {
    it('should set new token price', async () => {
      const tokenToExchange = '20';

      for (let i = 0.33; i < 10; i += 0.33) {
        const tokenPrice = i;
        const tokenWillMint = h.toWei(tokenToExchange).multipliedBy(h.toWei(1)).dividedBy(h.toWei(tokenPrice))
          .toFixed(0);

        await arconaERC20Sale.setTokenPrice(h.toWei(tokenPrice));
        const tokenWillMintResp = await arconaERC20Sale.calculateTokensAmountAfterExchange(h.toWei(tokenToExchange));

        assert.equal(tokenWillMintResp.toString(), tokenWillMint.toString());
      }
    });
  });

  describe('setTokenPrice()', async () => {
    it('should return valid value', async () => {
      const tokenPrice = h.toWei('0.0000001');
      await arconaERC20Sale.setTokenPrice(tokenPrice);

      const newPrice = await arconaERC20Sale.tokenPrice();
      assert.equal(tokenPrice.toString(), newPrice.toString());

      const tokenPrice2 = h.toWei('999999999999');
      await arconaERC20Sale.setTokenPrice(tokenPrice2);

      const newPrice2 = await arconaERC20Sale.tokenPrice();
      assert.equal(tokenPrice2.toString(), newPrice2.toString());
    });
  });

  describe('mint()', async () => {
    it('should mint token from contract owner', async () => {
      await arconaERC20Sale.mint(IVAN, '100');
      const balance = await arconaERC20Sale.balanceOf(IVAN);

      assert.equal('100', balance.toString());
    });

    it('should revert if caller not the owner', async () => {
      await expect(arconaERC20Sale.mint(IVAN, '100', { from: IVAN }))
        .to.be.revertedWith('Ownable: caller is not the owner');
    });
  });
});
