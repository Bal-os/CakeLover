const DToken = artifacts.require('DToken');
const ERC20Mock = artifacts.require('ERC20Mock');
const TestDToken = artifacts.require('TastableDToken');
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
    let erc20Mock;
  
    const OWNER = accounts[0];
    const SOMEBODY = accounts[1];
    const NOBODY = accounts[2];
    const ADDRESS_NULL = '0x0000000000000000000000000000000000000000';
  
    before('setup', async () => {
      erc20Mock = await ERC20Mock.new();
      dToken = await DToken.new(erc20Mock.address);

      await reverter.snapshot();
    });
  
    afterEach('revert', reverter.revert);
  
    describe('creating', async () => {
      it('should initialize and set a correct owner', async () => {
        assert.equal(await dToken.owner(), OWNER);

        const result = await truffleAssert.createTransactionResult(dToken, dToken.transactionHash);
        assert.equal(result.logs.length, 2);
        assert.equal(result.logs[0].event, 'OwnershipTransferred');
        assert.equal(result.logs[0].args.previousOwner, ADDRESS_NULL);
        assert.equal(result.logs[0].args.newOwner, OWNER);

        // assert.equal(result.logs[1].event, 'Receiver');
        // assert.equal(result.logs[1].args.receiver, SOMEBODY);
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

    describe('setReceiver()', async () => {
      it('should set new reciever', async () => {
        const result = await dToken.setReceiver(SOMEBODY);

        assert.equal(result.logs.length, 1);
        assert.equal(result.logs[0].event, 'Receiver');
        assert.equal(result.logs[0].args.receiver, SOMEBODY);
      })

      it('should not access to set new reciever by not owner', async () => {
        await assertReverts(dToken.setReceiver(SOMEBODY, {from: SOMEBODY}));
      })
    });

    describe('mint()', async () => {
      let cost;
      let url;

      beforeEach('initialize', async () => {
        await dToken.setReceiver(SOMEBODY);

        cost = 1000;
        url = 'url';
      });

      it('should mint new token', async () => {
        const result = await dToken.mint(url, cost);

        assert.equal(result.logs.length, 3);
        assert.equal(result.logs[0].event, 'CountersPreIncremented');
        assert.equal(result.logs[1].event, 'Transfer');
        assert.equal(result.logs[2].event, 'SetedFee');
        
        assert.equal(result.logs[0].args.counter, 0);
        assert.equal(result.logs[1].args.tokenId, 1)

        assert.equal(result.logs[1].args.from, ADDRESS_NULL);
        assert.equal(result.logs[1].args.to, SOMEBODY);

        assert.equal(result.logs[2].args.id, 1);
        assert.equal(result.logs[2].args.fee, cost);
      });

      it('should mint new token for other user', async () => {
        dToken.setReceiver(NOBODY);
        const result = await dToken.mint(url, cost);

        assert.equal(result.logs.length, 3);
        assert.equal(result.logs[1].event, 'Transfer');

        assert.equal(result.logs[1].args.from, ADDRESS_NULL);
        assert.equal(result.logs[1].args.to, NOBODY);
      });

      it('should not access to mint new token by not owner', async () => {
          await assertReverts(dToken.mint(url, cost, {from: SOMEBODY}));
      });
    });

    describe('setPayToken()', async () => {
      let otherErc20Mock;

      beforeEach('initialize', async () => {
        otherErc20Mock = await ERC20Mock.new();
      });

      it('should set new pay token', async () => {
        const mockAddress = otherErc20Mock.address;
        const result = await dToken.setPayToken(mockAddress);

        assert.equal(result.logs.length, 1);
        assert.equal(result.logs[0].event, 'Token');

        assert.equal(result.logs[0].args.payToken, mockAddress);
      });

      it('should not access set new pay token by not owner', async () => {
          await assertReverts(dToken.setPayToken(otherErc20Mock.address, {from: SOMEBODY}));
      });
    });

    describe('setPayToken()', async () => {
      let otherErc20Mock;

      beforeEach('initialize', async () => {
        otherErc20Mock = await ERC20Mock.new();
      });

      it('should set new pay token', async () => {
        const mockAddress = otherErc20Mock.address;
        const result = await dToken.setPayToken(mockAddress);

        assert.equal(result.logs.length, 1);
        assert.equal(result.logs[0].event, 'Token');

        assert.equal(result.logs[0].args.payToken, mockAddress);
      });

      it('should not access set new pay token by not owner', async () => {
          await assertReverts(dToken.setPayToken(otherErc20Mock.address, {from: SOMEBODY}));
      });
    });

    describe('tokenFee()', async () => {
      let cost;
      let url;

      beforeEach('initialize', async () => {
        cost = 1000;
        url = 'url';

        await dToken.setReceiver(SOMEBODY);
        await dToken.mint(url, cost);
      });

      it('should get token fee', async () => {
        const result = await dToken.tokenFee(1);

        assert.equal(result, cost);
      });

      it('should get token fee from not owner', async () => {
        const result = await dToken.tokenFee(1, {from: NOBODY});

        assert.equal(result, cost);
      });
    });
});