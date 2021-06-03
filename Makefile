verify:
	truffle run verify ARCONA@0x3ef64368c12175c186cd7e46Eb7D9700d9Df76Cf --network bsc && \
	truffle run verify ARLAND@0xF0Cf8Ed8058A1Fbb98Dd25d7f261330484282f88 --network bsc

verify-testnet:
	truffle run verify ARCONA@0x66fFee434d733B5F395525D858cA6770F2F64d0d --network bscTestnet && \
	truffle run verify ARLAND@0x97b6A138230F3CEC9A0ce106e5a60df0057A014A --network bscTestnet
