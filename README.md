# Blockchain Transactions

This project implements a basic cryptocurrency blockchain application. It features a decentralized network where nodes can maintain their own copy of the blockchain, mine new blocks, and conduct transactions. The application includes both a backend API and a simple React frontend for user interaction.

---

## ✨ Features

- **Blockchain**: A secure and immutable ledger for storing transaction data.
- **Proof-of-Work Algorithm**: New blocks are mined using a proof-of-work consensus mechanism, adjusting difficulty dynamically.
- **Chain Validation**: Ensures the integrity and authenticity of the blockchain.
- **Wallets**: Users can create and manage their cryptocurrency wallets.
- **Transaction Management**: Users can conduct transactions, sending and receiving cryptocurrency, with transaction inputs and outputs securely managed.
- **Transaction Pool**: A pool for pending transactions awaiting inclusion in a new block.
- **Decentralized Network**: Utilizes PubSub (PubNub) for broadcasting new blocks and transactions across the network to maintain consensus among peers.
- **Mining**: Supports mining of new blocks, including transactions from the pool, and rewards the miner.
- **Frontend**: A React-based web interface to view blockchain data, manage wallets, and conduct transactions.

---

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (>= 4.0)
- npm (Node Package Manager)

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://[https://github.com/hudfilho/blockchaintransactions.git](https://github.com/hudfilho/blockchaintransactions.git)
    cd blockchaintransactions
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

## 🏃 Running the Application

### Development Mode (with hot-reloading for backend and frontend)

```bash
npm run dev
```

### Start a Peer Instance (for decentralized network testing)

```bash
npm run dev-peer
```

### Running Tests
Run all tests (with watch mode enabled):

```bash
npm test
```

# Blockchain Transactions Project

This project simulates a basic blockchain, allowing for transactions, mining, and a distributed network. It includes a backend with core blockchain logic and a React-based frontend for user interaction.

---

## Project Structure

The project is organized into several key directories, each responsible for a specific part of the application:

* **`app/`**: Contains the core application logic, including the `PubSub` messaging system for real-time communication between nodes and the `TransactionMiner` for processing and adding transactions to the blockchain.
* **`blockchain/`**: Houses all blockchain-related functionalities. This includes the `Block` class for creating individual blocks and the `Chain` class for managing and validating the entire blockchain.
* **`client/`**: This directory holds the React frontend application.
    * **`src/`**: Contains the source code for the React components and the main entry point of the frontend application.
    * **`dist/`**: Stores the compiled and optimized assets of the frontend application, ready for deployment.
* **`util/`**: Provides various utility functions essential for the project, such as hashing algorithms and Elliptic Curve Cryptography (ECC) for secure transactions.
* **`wallet/`**: Manages wallet creation, including generating public/private key pairs, and handles the creation and signing of transactions.
