

## Agri-Trace — IoT supply-chain tracing prototype

Agri-Trace is a small prototype backend that demonstrates a data flow for agricultural supply chain management with the help of blockchain:

- ESP32 devices (or other IoT clients) write sensor payloads to Firebase Realtime Database.
- A Node/Express server (`server.js`) listens to the `data` path in Firebase, persists new items into a local JSON-backed blockchain (`blockchain.js` -> `blockchain.json`), and forwards the same payloads to an Ethereum smart contract (`ethereum.js`) running on a local test node (Ganache or Hardhat).

This README documents how the pieces fit together and how to run the project locally.

## Key components

- `server.js` — Express server + Firebase realtime listener (`onChildAdded`). Endpoints:
  - `POST /data` — generic data storage (saves to Firebase, local blockchain and Ethereum)
  - `GET /blocks` — returns local chain and Ethereum-synced data
  - `POST /submit` — feedback form flow that writes to `user feedback/{serialNumber}`
  - `GET /:id` — renders `iot.ejs` using data from `data/user{ID}/{ID}` (renders UI in `public/`)
- `blockchain.js` — in-repo blockchain implementation that persists to `blockchain.json`. Use `addData()` to append a block and `isChainValid()` to check integrity.
- `ethereum.js` — simple Web3 wrapper that connects to `http://localhost:7545` (Ganache). Exposes `addToEthereum(data)` and `getEthereumData()` and contains a hard-coded `contractAddress`.
- `firebase.js` — Node admin SDK initializer (ESM). Reads a local service account JSON to initialize admin privileges.
- `qr code/` — small auxiliary project used to generate/display QR codes (separate package.json).

## Important repository notes / gotchas

- The root `package.json` start script is `node app.js` but there is no `app.js` in the repository. To run the main server use `node server.js` (or update `package.json` to fix `start`).
- The code mixes Firebase client SDK usage (`server.js` uses `firebase/app` client imports) and the admin SDK (`firebase.js` uses `firebase-admin`). Be cautious when changing Firebase code — prefer the admin SDK on the server side for privileged operations.
- `ethereum.js` contains a hard-coded `contractAddress` and expects a local RPC at `http://localhost:7545`. If you redeploy contracts with Hardhat or Ganache, update `ethereum.js` or move the address to an environment variable.
- Local chain state is stored in `blockchain.json`. Deleting that file resets the local blockchain (genesis block will be recreated on next start).

## Prerequisites

- Node.js 
- npm
- A local Ethereum test node: Ganache (GUI or CLI) listening on `http://localhost:7545` or run `npx hardhat node` and update `ethereum.js`/config accordingly.
- Firebase service account JSON for Realtime Database access (used by `firebase.js`).

## Quick start (local)

1. Install dependencies

```bash
npm install
```

2. Prepare Firebase admin credentials

- Place the Firebase service account JSON referenced in `firebase.js` (the file currently referenced in that module). The file name used in `firebase.js` is `agriculture-supply-chain-firebase-adminsdk-1snhk-1f021bdaed.json`.

3. Start a local Ethereum node

- Option A: Ganache GUI or CLI (default for `ethereum.js`) — ensure it listens on `http://localhost:7545` and the contract in `ethereum.js` is deployed to an address that matches `contractAddress`.
- Option B: Hardhat node (`npx hardhat node`) — if you use this, either deploy the contract and update `ethereum.js.contractAddress` or adapt `ethereum.js` to support the Hardhat network.

4. Run the backend server

```bash
node server.js
```

The server will listen on port 3000 by default. It attaches a realtime listener to the Firebase `data` path and will process incoming entries.

## Common developer tasks

- View blockchain state: GET http://localhost:3000/blocks
- Submit generic data (example): POST http://localhost:3000/data with JSON body { "path": "data/somePath", "data": { ... } }
- Reset local blockchain: stop the server, delete `blockchain.json`, then restart.

## Smart contract / Hardhat notes

- The repo contains Hardhat and Truffle config files. The easiest local workflow is:
  1.  Run Ganache and deploy the contract using your preferred Truffle/Hardhat flow and set the deployed address in `ethereum.js`.
  2.  Run `node server.js` and exercise `/data` or let the realtime listener pick up incoming ESP32 data in Firebase.


## Where to look next in the codebase

- `server.js` — runtime logic and endpoints
- `blockchain.js` — blockchain persistence and validation
- `ethereum.js` — contract ABI, RPC endpoint, and helper functions
- `firebase.js` — admin SDK initialization
- `qr code/` — QR code UI and generator

