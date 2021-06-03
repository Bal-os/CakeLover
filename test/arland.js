const ARLAND = artifacts.require('ARLAND');
const ERC20Mock = artifacts.require('ERC20Mock');
const truffleAssert = require('truffle-assertions');
const BigNumber = require('bignumber.js');
const Reverter = require('./helpers/reverter');
const { assertReverts } = require('./helpers/assertThrows');

function bn(number) {
  return new BigNumber(number);
}

contract('ARLAND', async (accounts) => {
  const reverter = new Reverter(web3);

  let arlland;

  const OWNER = accounts[0];
  const SOMEBODY = accounts[1];
  const NOBODY = accounts[2];
  const ADDRESS_NULL = '0x0000000000000000000000000000000000000000';

  before('setup', async () => {
    arlland = await ARLAND.new();

    await reverter.snapshot();
  });

  afterEach('revert', reverter.revert);

  describe('creating', async () => {
    it('should initialize and set a correct owner', async () => {
      assert.equal(await arlland.owner(), OWNER);

      const result = await truffleAssert.createTransactionResult(arlland, arlland.transactionHash);
      assert.equal(result.logs.length, 1);
      assert.equal(result.logs[0].event, 'OwnershipTransferred');
      assert.equal(result.logs[0].args.previousOwner, ADDRESS_NULL);
      assert.equal(result.logs[0].args.newOwner, OWNER);
    });

    it('should have correct name', async () => {
      const name = await arlland.name();
      assert.equal(name, 'Augmented Reality Land');
    });

    it('should have correct symbol', async () => {
      const name = await arlland.symbol();
      assert.equal(name, 'ARLAND');
    });
  });

  describe('mint()', async () => {
    let url;
    let gisId;

    beforeEach('initialize', async () => {
      url = 'url';
      gisId = 5;
    });

    it('should mint new token', async () => {
      const result = await arlland.mint(OWNER, url, gisId);

      assert.equal(result.logs.length, 3);
      assert.equal(result.logs[0].event, 'CountersPreIncremented');
      assert.equal(result.logs[1].event, 'Transfer');
      assert.equal(result.logs[2].event, 'SetGIS');

      assert.equal(result.logs[0].args.counter, 0);
      assert.equal(result.logs[1].args.tokenId, 1);

      assert.equal(result.logs[1].args.from, ADDRESS_NULL);
      assert.equal(result.logs[1].args.to, OWNER);

      assert.equal(result.logs[2].args.id, 1);
      assert.equal(result.logs[2].args.gis, gisId);
    });

    it('should mint new token for other user', async () => {
      const result = await arlland.mint(SOMEBODY, url, gisId);

      assert.equal(result.logs.length, 3);
      assert.equal(result.logs[1].event, 'Transfer');

      assert.equal(result.logs[1].args.from, ADDRESS_NULL);
      assert.equal(result.logs[1].args.to, SOMEBODY);
    });

    it('should not access to mint new token by not owner', async () => {
      await assertReverts(arlland.mint(NOBODY, url, gisId, { from: SOMEBODY }));
    });
  });

  describe('transferStuckToken()', async () => {
    const url = 'url';
    const gisId = 5;

    let tokenAdress;
    let stuckTokenId;

    beforeEach('initialize', async () => {
      tokenAdress = arlland.address;

      await arlland.mint(tokenAdress, url, gisId);
    });

    it('should return stuck token', async () => {
      const result = await arlland.transferStuckToken(1, OWNER);

      assert.equal(result.logs.length, 2);

      assert.equal(result.logs[1].event, 'Transfer');

      assert.equal(result.logs[1].args.from, tokenAdress);
      assert.equal(result.logs[1].args.to, OWNER);
    });

    it('should not access return token by not owner', async () => {
      await assertReverts(arlland.transferStuckToken(1, OWNER, { from: SOMEBODY }));
    });

    it('should not access to return token that was not stuck', async () => {
      await arlland.mint(NOBODY, url, gisId);

      await assertReverts(arlland.transferStuckToken(2, OWNER));
    });
  });

  describe('multiTransferStuckToken()', async () => {
    const url = 'url';
    const gisId = 5;

    let tokenAdress;
    let stuckTokenId;

    beforeEach('initialize', async () => {
      tokenAdress = arlland.address;

      await arlland.mint(tokenAdress, url, gisId);
      await arlland.mint(tokenAdress, url, gisId);
    });

    it('should return stuck token', async () => {
      const result = await arlland.multiTransferStuckToken([1, 2], OWNER);

      assert.equal(result.logs.length, 4);

      assert.equal(result.logs[1].event, 'Transfer');
      assert.equal(result.logs[3].event, 'Transfer');

      assert.equal(result.logs[1].args.from, tokenAdress);
      assert.equal(result.logs[1].args.to, OWNER);

      assert.equal(result.logs[3].args.from, tokenAdress);
      assert.equal(result.logs[3].args.to, OWNER);
    });

    it('should not access return tokens by not owner', async () => {
      await assertReverts(arlland.multiTransferStuckToken([1, 2], OWNER, { from: SOMEBODY }));
    });

    it('should not access to return tokens that ware not stuck', async () => {
      await arlland.mint(NOBODY, url, gisId);

      await assertReverts(arlland.multiTransferStuckToken([2, 3], OWNER));
    });
  });

  describe('transferStuckERC20()', async () => {
    let tokenAdress;
    let sum;
    let mockAddress;
    let erc20Mock;

    beforeEach('initialize', async () => {
      erc20Mock = await ERC20Mock.new();

      tokenAdress = arlland.address;
      sum = 200;

      mockAddress = erc20Mock.address;
      await erc20Mock.mint(tokenAdress, sum);
    });

    it('should transfer stuck erc20 tokens', async () => {
      await arlland.transferStuckERC20(mockAddress, OWNER, sum);
      const balance = await erc20Mock.balanceOf(tokenAdress);

      assert.equal(balance, 0);
    });

    it('should not access transfer stuck erc20 tokens not owner', async () => {
      await assertReverts(arlland.transferStuckERC20(mockAddress, OWNER, sum, { from: SOMEBODY }));
    });

    it('should not access transfer amount of stuck erc20 that more then contract amount', async () => {
      await assertReverts(arlland.transferStuckERC20(mockAddress, OWNER, sum + 1));
    });
  });
});
