const { use, expect } = require('chai');
const { solidity } = require('ethereum-waffle');

use(solidity);
use(require('chai-as-promised')).should();

const ArconaERC20 = artifacts.require('ArconaERC20');

const Reverter = require('./helpers/reverter');

contract('ArconaERC20Sale', async (accounts) => {
  const reverter = new Reverter(web3);

  let arconaERC20;

  const IVAN = accounts[1];

  before('setup', async () => {
    arconaERC20 = await ArconaERC20.new();
    await reverter.snapshot();
  });

  afterEach(async () => {
    await reverter.revert();
  });

  describe('mint()', async () => {
    it('should mint token from contract owner', async () => {
      await arconaERC20.mint(IVAN, '100');
      const balance = await arconaERC20.balanceOf(IVAN);

      assert.equal('100', balance.toString());
    });

    it('should revert if new owner is zero address', async () => {
      await expect(arconaERC20.mint(IVAN, '100', { from: IVAN }))
        .to.be.revertedWith('E-786');
    });
  });

  describe('addOwnership()', async () => {
    it('should add new owner', async () => {
      await expect(arconaERC20.mint(IVAN, '100', { from: IVAN }))
        .to.be.revertedWith('E-786');

      await arconaERC20.addOwnership(IVAN);
      await arconaERC20.mint(IVAN, '100', { from: IVAN });

      const balance = await arconaERC20.balanceOf(IVAN);
      assert.equal('100', balance.toString());
    });

    it('should revert if new owner is zero address', async () => {
      await expect(arconaERC20.addOwnership('0x0000000000000000000000000000000000000000'))
        .to.be.revertedWith('E-787');
    });
  });

  describe('removeOwnership()', async () => {
    it('should remove owner', async () => {
      await arconaERC20.addOwnership(IVAN);
      await arconaERC20.removeOwnership(IVAN, { from: IVAN });

      await expect(arconaERC20.mint(IVAN, '100', { from: IVAN }))
        .to.be.revertedWith('E-786');
    });
  });
});
