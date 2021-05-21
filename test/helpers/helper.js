const BigNumber = require('bignumber.js');

BigNumber.set({ ROUNDING_MODE: BigNumber.ROUND_DOWN });
BigNumber.config({ EXPONENTIAL_AT: [-1e9, 1e9] });

class Helper {
  // eslint-disable-next-line class-methods-use-this
  toBN(number) {
    return new BigNumber(number);
  }

  getDecimal() {
    return this.toBN(1e+27);
  }

  toWei(number) {
    return this.toBN(number).multipliedBy(1e+18);
  }

  fromWei(number) {
    return this.toBN(number).dividedBy(1e+18);
  }
}

module.exports = Helper;
