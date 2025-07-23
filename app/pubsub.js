const PubNub = require('pubnub')

const credentials = {
    publishKey: "",
    subscribeKey: "",
    secretKey: ""
}

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
};


class PubSub{
    constructor(blockchain, transactionPool, wallet){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool
        this.wallet = wallet

        this.pubnub = new PubNub(credentials);
        this.pubnub.subscribe({ channels: Object.values(CHANNELS)});
        this.pubnub.addListener(this.listener());
    }

    handleMessage(channel, message) {
        console.log(`Message received. Channel: ${channel}. Message: ${message}`);

        const parsedMessage = JSON.parse(message);

        switch(channel){
            case CHANNELS.BLOCKCHAIN:
                this.blockchain.replaceChain(parsedMessage, true, () => {
                    this.transactionPool.clearBlockchainTransactions({
                        chain: parsedMessage
                    });
                });
                break;
            case CHANNELS.TRANSACTION:
                if (!this.transactionPool.existingTransaction({
                    inputAddress: this.wallet.publicKey
                })) {
                    this.transactionPool.setTransaction(parsedMessage);
                }
                break;
            default:
                return;
        }
    }

    listener() {
        return {
        message: messageObject => {
            const { channel, message } = messageObject;

            this.handleMessage(channel, message);
        }
        };
    }

    publish({ channel, message}) {
        this.pubnub.publish({ channel, message });
    }

    broadcastChain() {
        console.log("Broadcasting chain:", this.blockchain.chain);
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }
    
    broadcastTransaction(transaction) {
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        })
    }
}

module.exports = PubSub;