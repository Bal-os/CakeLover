const DToken = artifacts.require('DToken');
const Reverter = require('./helpers/reverter');
const {assertReverts} = require('./helpers/assertThrows');
const advanceBlockAtTime = require('./helpers/ganacheTimeTraveler');
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
      await advanceBlockAtTime(1);
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
});