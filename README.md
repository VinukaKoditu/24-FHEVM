# Anonymous Voting dApp with FHEVM

A decentralized anonymous voting system built on FHEVM (Fully Homomorphic Encryption Virtual Machine) that preserves
voter privacy using advanced cryptographic techniques.

## 🌟 Features

🗳️ **Anonymous Voting** - Protects voter privacy using homomorphic encryption  
🔒 **Fully Encrypted** - All voting data is encrypted and processed on-chain  
🌐 **Decentralized** - Transparent blockchain-based voting system  
⏰ **Time-Controlled** - Supports voting start and end times  
👥 **Multi-Candidate** - Supports 2-10 candidates per voting  
🚫 **Anti-Double Voting** - Each address can only vote once  
📊 **Real-time Results** - Encrypted vote counting with decrypted results

## 🏗️ Tech Stack

- **Frontend**: React + TypeScript + Ethers.js
- **Smart Contracts**: Solidity + FHEVM
- **Blockchain**: Ethereum (Sepolia Testnet supported)
- **Encryption**: Fully Homomorphic Encryption (FHE)
- **Development**: Hardhat + TypeScript

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Package manager
- **MetaMask**: Browser wallet extension

### Installation

1. **Clone and install dependencies**

   ```bash
   git clone <repository-url>
   cd 24-FHEVM
   npm install
   cd frontend
   npm install
   cd ..
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC

   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile and test smart contracts**

   ```bash
   npm run compile
   npm run test
   ```

4. **Deploy smart contracts**

   ```bash
   # Deploy to local network
   npx hardhat node
   npx hardhat run scripts/deploy-voting.ts --network localhost

   # Deploy to Sepolia testnet
   npx hardhat run scripts/deploy-voting.ts --network sepolia
   ```

5. **Run the frontend application**

   ```bash
   cd frontend
   npm start
   ```

   The application will be available at `http://localhost:3000`

### Network Configuration

The project is configured to work with:

- **Local Hardhat Network** (for development)
- **Sepolia Testnet** (for testing)

Update the contract address in `frontend/src/App.tsx` after deployment.

## 📁 Project Structure

```
24-FHEVM/
├── contracts/                 # Smart contract source files
│   └── AnonymousVoting.sol   # Main voting contract with FHE
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── CreateVoting.tsx
│   │   │   ├── VotingDetails.tsx
│   │   │   ├── VotingList.tsx
│   │   │   └── WalletConnection.tsx
│   │   ├── contracts/        # Contract ABIs and types
│   │   └── types/           # TypeScript type definitions
│   └── public/              # Static assets
├── scripts/                 # Deployment scripts
│   └── deploy-voting.ts     # Voting contract deployment
├── test/                    # Test files
│   └── AnonymousVoting.ts   # Comprehensive contract tests
├── types/                   # Generated TypeScript types
└── hardhat.config.ts        # Hardhat configuration
```

## 🎯 How It Works

### Smart Contract Features

The `AnonymousVoting.sol` contract provides:

- **Encrypted Vote Storage**: All votes are stored as encrypted values using FHEVM
- **Privacy Preservation**: Voter choices remain hidden until results are decrypted
- **Access Control**: Only authorized addresses can vote
- **Time Management**: Automatic voting period enforcement
- **Result Calculation**: Homomorphic addition of encrypted votes

### Frontend Features

The React application provides:

- **Wallet Integration**: MetaMask connection and account management
- **Voting Creation**: Easy interface to create new voting sessions
- **Vote Casting**: Secure voting with real-time feedback
- **Results Display**: Decrypted results after voting ends
- **Responsive Design**: Mobile-friendly interface

### Voting Process

1. **Create Voting**: Deploy a new voting session with candidates and time limits
2. **Cast Votes**: Voters select candidates and submit encrypted votes
3. **Vote Aggregation**: Encrypted votes are homomorphically added
4. **Result Decryption**: Final tallies are decrypted and displayed

## � Development

### Smart Contract Development

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy locally
npx hardhat node
npx hardhat run scripts/deploy-voting.ts --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy-voting.ts --network sepolia
```

### Frontend Development

```bash
cd frontend

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Testing

The project includes comprehensive tests covering:

- Contract deployment and initialization
- Voting creation with various parameters
- Vote casting and validation
- Time-based access control
- Result decryption and accuracy
- Edge cases and error conditions

```bash
# Run smart contract tests
npm run test

# Run with coverage
npm run coverage

# Test specific scenarios
npx hardhat test --grep "voting creation"
```

## �📜 Available Scripts

### Root Directory

| Script             | Description                   |
| ------------------ | ----------------------------- |
| `npm run compile`  | Compile smart contracts       |
| `npm run test`     | Run contract tests            |
| `npm run coverage` | Generate test coverage report |
| `npm run lint`     | Run linting checks            |
| `npm run clean`    | Clean build artifacts         |

### Frontend Directory

| Script          | Description                 |
| --------------- | --------------------------- |
| `npm start`     | Start development server    |
| `npm run build` | Build for production        |
| `npm test`      | Run frontend tests          |
| `npm run eject` | Eject from Create React App |

## 🔐 Security Considerations

- **Private Key Management**: Never commit private keys or mnemonics
- **Smart Contract Auditing**: Thoroughly test contracts before mainnet deployment
- **Frontend Security**: Validate all user inputs and contract interactions
- **Encryption Integrity**: Ensure proper FHE key management
- **Access Control**: Implement proper authorization checks

## 🌐 Deployment

### Testnet Deployment (Sepolia)

1. **Configure Hardhat variables**:

   ```bash
   npx hardhat vars set MNEMONIC "your twelve word mnemonic phrase here"
   npx hardhat vars set INFURA_API_KEY "your_infura_api_key"
   ```

2. **Deploy contracts**:

   ```bash
   npx hardhat run scripts/deploy-voting.ts --network sepolia
   ```

3. **Update frontend configuration**:
   - Update contract address in `frontend/src/App.tsx`
   - Ensure correct network configuration

4. **Deploy frontend**:
   ```bash
   cd frontend
   npm run build
   # Deploy build folder to your hosting service
   ```

## 🚨 Troubleshooting

### Common Issues

**MetaMask Connection Issues**:

- Ensure MetaMask is installed and unlocked
- Check that you're connected to the correct network
- Clear browser cache if needed

**Contract Interaction Failures**:

- Verify contract address is correct
- Ensure sufficient gas limit
- Check network connectivity

**Frontend Build Issues**:

- Delete `node_modules` and reinstall dependencies
- Clear npm cache: `npm cache clean --force`
- Check Node.js version compatibility

## 📚 Documentation & Resources

- **FHEVM Documentation**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **FHEVM Hardhat Plugin**:
  [https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)
- **Zama FHE Library**:
  [https://docs.zama.ai/protocol/solidity-guides/getting-started/overview](https://docs.zama.ai/protocol/solidity-guides/getting-started/overview)
- **Ethers.js Documentation**: [https://docs.ethers.org/](https://docs.ethers.org/)
- **React Documentation**: [https://react.dev/](https://react.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/zama-ai/fhevm/issues)
- **Documentation**: [FHEVM Docs](https://docs.zama.ai)
- **Community**: [Zama Discord](https://discord.gg/zama)

## 🙏 Acknowledgments

- **Zama Team**: For developing the FHEVM protocol and tools
- **Ethereum Community**: For the foundational blockchain infrastructure
- **Open Source Contributors**: For the libraries and tools that make this project possible

---

**Built with ❤️ using FHEVM for privacy-preserving voting**
