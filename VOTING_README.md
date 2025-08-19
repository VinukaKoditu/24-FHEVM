# 匿名投票 dApp

基於 FHEVM (Fully Homomorphic Encryption Virtual Machine) 的去中心化匿名投票系統。

## 特色功能

🗳️ **匿名投票** - 使用同態加密技術保護投票者隱私  
🔒 **完全加密** - 所有投票數據都經過加密處理  
🌐 **去中心化** - 基於區塊鏈的透明投票系統  
⏰ **時間控制** - 支持設定投票開始和結束時間  
👥 **多候選人** - 支持 2-10 個候選人的投票  
🚫 **防重複投票** - 每個地址只能投票一次

## 技術架構

- **前端**: React + TypeScript + Ethers.js
- **智能合約**: Solidity + FHEVM
- **區塊鏈**: Ethereum (支持 Sepolia 測試網)
- **加密**: Fully Homomorphic Encryption (FHE)

## 項目結構

```
├── contracts/               # 智能合約
│   └── AnonymousVoting.sol # 主要投票合約
├── frontend/               # React 前端應用
│   ├── src/
│   │   ├── components/     # React 組件
│   │   ├── contracts/      # 合約 ABI
│   │   └── types/          # TypeScript 類型定義
│   └── public/             # 靜態資源
├── scripts/                # 部署腳本
└── test/                   # 測試文件
```

## 快速開始

### 1. 部署智能合約

```bash
# 編譯合約
npm run compile

# 部署到本地網路
npx hardhat run scripts/deploy-voting.ts --network localhost

# 部署到 Sepolia 測試網
npx hardhat run scripts/deploy-voting.ts --network sepolia
```

### 2. 配置前端

1. 進入前端目錄：

```bash
cd frontend
```

2. 安裝依賴：

```bash
npm install
```

3. 更新合約地址：在 `src/App.tsx` 中更新 `CONTRACT_ADDRESS` 為部署後的合約地址。

4. 啟動開發服務器：

```bash
npm start
```

### 3. 使用應用

1. **連接錢包**: 點擊"連接 MetaMask"按鈕
2. **創建投票**:
   - 填寫投票標題和描述
   - 添加候選人（2-10個）
   - 設定投票時長
   - 點擊"創建投票"
3. **參與投票**:
   - 在投票列表中選擇一個進行中的投票
   - 選擇你要投票的候選人
   - 點擊"確認投票"
4. **查看結果**: 投票結束後可以查看加密的投票結果

## 智能合約功能

### 主要方法

- `createVoting()` - 創建新投票
- `vote()` - 投票（使用加密輸入）
- `endVoting()` - 提前結束投票（僅創建者）
- `getVotingInfo()` - 獲取投票資訊
- `getCandidateInfo()` - 獲取候選人資訊
- `hasVoted()` - 檢查是否已投票
- `isVotingActive()` - 檢查投票是否進行中

### 事件

- `VotingCreated` - 投票創建事件
- `VoteCast` - 投票投出事件
- `VotingEnded` - 投票結束事件

## 隱私保護

本 dApp 使用 FHEVM 技術實現真正的匿名投票：

1. **加密投票**: 每個投票都使用同態加密技術加密
2. **隱私計算**: 在不解密的情況下進行投票統計
3. **零知識**: 投票者身份和投票內容完全保密
4. **去中心化**: 沒有中央機構可以查看個人投票

## 注意事項

⚠️ **測試網環境**: 當前配置為 Sepolia 測試網，請不要在主網使用未經審計的合約  
⚠️ **Gas 費用**: 創建投票和投票都需要支付 gas 費用  
⚠️ **不可逆**: 投票一旦提交就無法撤銷或修改  
⚠️ **網路要求**: 需要連接到支持 FHEVM 的網路

## 開發說明

### 本地開發

1. 啟動 Hardhat 本地節點：

```bash
npx hardhat node
```

2. 部署合約到本地網路：

```bash
npx hardhat run scripts/deploy-voting.ts --network localhost
```

3. 配置 MetaMask 連接到本地網路（RPC: http://localhost:8545）

### 測試

```bash
# 運行合約測試
npm run test

# 運行前端測試
cd frontend && npm test
```

## 技術細節

### FHEVM 集成

本項目使用 FHEVM 庫來實現同態加密功能：

- `euint32` - 32位加密無符號整數
- `FHE.add()` - 加密數據相加
- `FHE.allowThis()` - 允許合約訪問加密數據
- `FHE.allow()` - 允許特定地址訪問加密數據

### 前端集成

前端使用 `@fhevm/fhevmjs` 庫來創建加密輸入：

```typescript
const encryptedVote = await fhevm.createEncryptedInput(contractAddress, userAddress).add32(voteValue).encrypt();
```

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 許可證

MIT License

## 聯繫方式

如有問題或建議，請通過 GitHub Issues 聯繫我們。

---

**免責聲明**: 本項目僅供學習和演示用途，請在生產環境使用前進行充分的安全審計。
