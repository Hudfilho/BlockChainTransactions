const hexToBinary = require('hex-to-binary');
const Block = require('./block')
const { GENESIS_DATA, MINE_RATE } = require('../config');
const {cryptoHash}  = require('../util');

describe('Block', () => {
    const timestamp = 2000;
    const lastHash = '0x0000';
    const hash = '0x1234';
    const data = { amount: 100 };
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({timestamp, lastHash, hash, data, nonce, difficulty });


    it('has a timestamp, lastHash, hash, and a data property', () =>{
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    });
    describe('genesis()', () => {
        const genesisBlock = Block.genesis();
        
        it('returns a Block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('returns the genesis data', () => {
            expect(genesisBlock.timestamp).toEqual(1);
            expect(genesisBlock.lastHash).toEqual('-----');
            expect(genesisBlock.hash).toEqual('hash-one');
            expect(genesisBlock.data).toEqual({});
        });
    });

    describe('mineBlock()', () => {
       const lastBlock = Block.genesis();
       const data = 'mined data';
       const minedBlock = Block.mineBlock({ lastBlock, data});
       
        it('returns a Block instance', ()=> {
           expect(minedBlock instanceof Block).toBe(true);
        });

        it('sets the `lastHash` to be the `hash` of the lastBlock', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('sets the `data` to the input data', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('sets a timestamp', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('creates a sha256 hash based on the proper inputs', () => {
            expect(minedBlock.hash).toEqual(
                cryptoHash(
                    minedBlock.timestamp,
                    minedBlock.nonce,
                    minedBlock.difficulty,
                    lastBlock.hash,
                    data
                )
            );
        });

        it('sets a `hash` that matches the difficulty and nonce', () => {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual(
                '0'.repeat(minedBlock.difficulty)
            );
        });

        it('adjusts the difficulty', () => {
            const possibleResults = [lastBlock.difficulty + 1, lastBlock.difficulty - 1];

            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        });
    });

    describe('adjustDifficulty()', () => {
        it('raises the difficulty for a quickly mined block',()=> {
            expect(Block.adjustDifficulty({ 
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE - 100
            })).toEqual(block.difficulty + 1);
        });

        it('lowers the difficulty for a quickly mined block',()=> {
            expect(Block.adjustDifficulty({ 
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE + 100
            })).toEqual(block.difficulty - 1);
        });

        it('has a lower limit of 1', () => {
            block.difficulty = -1;

            expect(Block.adjustDifficulty({ originalBlock: block })).toEqual(1);
        });
    })
});
