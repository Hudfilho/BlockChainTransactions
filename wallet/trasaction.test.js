const Transaction = require('./transaction');
const Wallet = require('./index');
const { verifySignature } = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');

describe('Transaction', () => {
    let transaction, senderWallet, recipient, amount;

    beforeEach(() => {
        senderWallet = new Wallet();
        recipient = 'recipient-public-key';
        amount = 50;
        transaction = new Transaction({ senderWallet, recipient, amount });
    });

    it('has an `id`', () => {
        expect(transaction).toHaveProperty('id');
    });

    describe('output', () => {
        it('has an `outputMap`', () => {
            expect(transaction).toHaveProperty('outputMap');
        });

        it('outputs the amount to the recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it('outputs the remaining balance for the sender', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
                senderWallet.balance - amount
            );
        });
    });

    describe('input', () => {
        it('has an `input`', () => {
            expect(transaction).toHaveProperty('input');
        });

        it('has a `timestamp` in the input', () => {
            expect(transaction.input).toHaveProperty('timestamp');
        });

        it('sets the `amount` to the sender\'s balance', () => {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });

        it('sets the `address` to the sender\'s public key', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });

        it('signs the input', () => {
            expect(
                verifySignature({
                    publicKey: senderWallet.publicKey,
                    data: transaction.outputMap,
                    signature: transaction.input.signature
                })
            ).toBe(true);
        });
    });

    describe('validating a transaction', () => {
        let errorMock;

        beforeEach(() => {
            errorMock = jest.fn();

            global.console.error = errorMock;
        });

        describe('when the transaction is valid', () => {
            it('returns true', () => {
                expect(Transaction.validTransaction(transaction)).toBe(true);
            });
        });

        describe('when the transaction is invalid', () => {
            describe('and a transaction outputMap is invalid', () => {
                it('returns false and returns an error', () => {
                    transaction.outputMap[senderWallet.publicKey] = 999999;

                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the input signature is invalid', () => {
                it('returns false and returns an error', () => {
                    transaction.input.signature = new Wallet().sign('invalid-data');

                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });
    });

    describe('update()', () => {
        let originalSignature, originalOutputMap, nextRecipient, nextAmount;
        
        describe('and the amount is invalid', () => {
            it('throws an error', () => {
                expect(() => {
                    transaction.update({
                        senderWallet,
                        recipient: 'next-recipient-public-key',
                        amount: 999999
                    });
                }).toThrow('Amount exceeds balance');
            })
        });

        describe('and the amount is valid', () => {
            beforeEach(() => {
                originalSignature = transaction.input.signature;
                originalOutputMap = { ...transaction.outputMap };
                nextRecipient = 'next-recipient-public-key';
                nextAmount = 50;

                transaction.update({
                    senderWallet,
                    recipient: nextRecipient,
                    amount: nextAmount
                });
            });

            it('outputs the amount to the recipient', () => {
                expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
            });

            it('subtracts the amount from the original sender output amount', () => {
                expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
                    originalOutputMap[senderWallet.publicKey] - nextAmount
                );
            });

            it('maintains a total output amount that matches the input amount', () => {
                expect(
                    Object.values(transaction.outputMap)
                    .reduce((total, output) => total + output, 0)
                ).toEqual(transaction.input.amount);
            });

            it('re-signs the transaction', () => {
                expect(transaction.input.signature).not.toEqual(originalSignature); 
            });

            describe('and another update for the same recipient', () => {
                let addedAmount;

                beforeEach(() => {
                    addedAmount = 80;
                    transaction.update({
                        senderWallet,
                        recipient: nextRecipient,
                        amount: addedAmount
                    });
                });

                it('adds to the recipient amount', () => {
                    expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount + addedAmount);
                });

                it('subtracts the added amount from the original sender output amount', () => {
                    expect(transaction.outputMap[senderWallet.publicKey])
                    .toEqual(originalOutputMap[senderWallet.publicKey] - nextAmount - addedAmount);
                });
            });
        });
    });

    describe('rewardTransaction()', () => {
        let rewardTransaction, minerWallet;

        beforeEach(() => {
            minerWallet = new Wallet();
            rewardTransaction = Transaction.rewardTransaction({minerWallet})
        })

        it('cretes a transaction with the reward input', () => {
            expect(rewardTransaction.input).toEqual(REWARD_INPUT);
        })

        it('creates one transaction for the miner with the `MINING_REWARD`', () => {
            expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINING_REWARD);
        });
    })
});