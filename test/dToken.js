const DToken = artifacts.require('DToken');
const ERC20Mock = artifacts.require('ERC20Mock');
const Reverter = require('./helpers/reverter');
const {assertReverts} = require('./helpers/assertThrows');
const truffleAssert = require('truffle-assertions');
const BigNumber = require('bignumber.js');

function bn(number) {
  return new BigNumber(number);
}

contract('DToken', async (accounts) => {
  const reverter = new Reverter(web3);
  
  let dToken;

  const OWNER = accounts[0];
  const SOMEBODY = accounts[1];
  const NOBODY = accounts[2];
  const ADDRESS_NULL = '0x0000000000000000000000000000000000000000';

  before('setup', async () => {
    dToken = await DToken.new();

      await reverter.snapshot();
    });
  
    afterEach('revert', reverter.revert);
  
    describe('creating', async () => {
      it('should initialize and set a correct owner', async () => {
        assert.equal(await dToken.owner(), OWNER);

        const result = await truffleAssert.createTransactionResult(dToken, dToken.transactionHash);
        assert.equal(result.logs.length, 1);
        assert.equal(result.logs[0].event, 'OwnershipTransferred');
        assert.equal(result.logs[0].args.previousOwner, ADDRESS_NULL);
        assert.equal(result.logs[0].args.newOwner, OWNER);
      });
      
      it('should have correct name', async () => {
        const name = await dToken.name();
        assert.equal(name, "DToken");
      });

      it('should have correct symbol', async () => {
        const name = await dToken.symbol();
        assert.equal(name, "DTK");
      })
    });

    describe('mint()', async () => {
      let url;
      let gisId;

      beforeEach('initialize', async () => {
        url = 'url';
        gisId = 5;
      });

      it('should mint new token', async () => {
        const result = await dToken.mint(OWNER, url, gisId);

        assert.equal(result.logs.length, 3);
        assert.equal(result.logs[0].event, 'CountersPreIncremented');
        assert.equal(result.logs[1].event, 'Transfer');
        assert.equal(result.logs[2].event, 'SetedGIS');
        
        assert.equal(result.logs[0].args.counter, 0);
        assert.equal(result.logs[1].args.tokenId, 1)

        assert.equal(result.logs[1].args.from, ADDRESS_NULL);
        assert.equal(result.logs[1].args.to, OWNER);

        assert.equal(result.logs[2].args.id, 1);
        assert.equal(result.logs[2].args.gis, gisId);
      });

      it('should mint new token for other user', async () => {
        const result = await dToken.mint(SOMEBODY, url, gisId);

        assert.equal(result.logs.length, 3);
        assert.equal(result.logs[1].event, 'Transfer');

        assert.equal(result.logs[1].args.from, ADDRESS_NULL);
        assert.equal(result.logs[1].args.to, SOMEBODY);
      });

      it('should not access to mint new token by not owner', async () => {
          await assertReverts(dToken.mint(NOBODY, url, gisId, {from: SOMEBODY}));
      });
    });

    describe('transferStuckToken()', async () => {
      const url = 'url';
      const gisId = 5;

      let tokenAdress;
      let stuckTokenId;

      beforeEach('initialize', async () => {
        tokenAdress = dToken.address;

        await dToken.mint(tokenAdress, url, gisId);
      });

      it('should revert stuck token', async () => {
        const result = await dToken.transferStuckToken(1, OWNER)

        assert.equal(result.logs.length, 2);

        assert.equal(result.logs[1].event, 'Transfer');

        assert.equal(result.logs[1].args.from, tokenAdress);
        assert.equal(result.logs[1].args.to, OWNER);
      });

      it('should not access revert token by not owner', async () => {
          await assertReverts(dToken.transferStuckToken(1, OWNER, {from: SOMEBODY}));
      });

      it('should not access to revert token that was not stucked', async () => {
        await dToken.mint(NOBODY, url, gisId);

        await assertReverts(dToken.transferStuckToken(2, OWNER));
      });
    });

    describe('transferStuckERC20()', async () => {
      let tokenAdress;
      let sum;
      let mockAddress;

      beforeEach('initialize', async () => {
        const erc20Mock = await ERC20Mock.new();

        tokenAdress = dToken.address;
        sum = 200;
        
        mockAddress = erc20Mock.address;
        await erc20Mock.mint(tokenAdress, sum + 1);
      });

      it('should transfer stocked erc20 tokens', async () => {
        const result = await dToken.transferStuckERC20(mockAddress, OWNER, sum);

        assert.equal(result.logs.length, 1);

        assert.equal(result.logs[0].event, 'BalanceOfToken');

        assert.equal(result.logs[0].args.sum, sum + 1);
      });

      it('should not access transfer stocked erc20 tokens not owner', async () => {
          await assertReverts(dToken.transferStuckERC20(mockAddress, OWNER, sum , {from: SOMEBODY}));
      });

      it('should not access transfer amount of stocked erc20 that more or equal to the contract amount', async () => {
        await assertReverts(dToken.transferStuckERC20(mockAddress, OWNER, sum + 1));
      });
    });
});