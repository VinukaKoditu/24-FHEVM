import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";
import WalletConnection from "./components/WalletConnection";
import VotingList from "./components/VotingList";
import CreateVoting from "./components/CreateVoting";
import VotingDetails from "./components/VotingDetails";
import { AnonymousVoting } from "./contracts/AnonymousVoting";

interface AppState {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contract: ethers.Contract | null;
  account: string;
  chainId: number | null;
  isConnected: boolean;
  currentView: "list" | "create" | "details";
  selectedVotingId: number | null;
}

const CONTRACT_ADDRESS = "0x246eE751F0432E236A0b7791fddc120962E398bE"; // 部署后需要更新

function App() {
  const [state, setState] = useState<AppState>({
    provider: null,
    signer: null,
    contract: null,
    account: "",
    chainId: null,
    isConnected: false,
    currentView: "list",
    selectedVotingId: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Connect to wallet
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError("");

      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();

      // 添加 Sepolia 網路檢查
      if (Number(network.chainId) !== 11155111) {
        console.warn("⚠️ 當前網路不是 Sepolia 測試網 (Chain ID: 11155111)");
        console.log("當前網路 Chain ID:", Number(network.chainId));
      }

      // 檢查帳戶餘額
      const balance = await provider.getBalance(account);
      console.log("帳戶餘額:", ethers.formatEther(balance), "ETH");

      if (balance === BigInt(0)) {
        throw new Error("帳戶餘額不足，請先獲取一些 Sepolia 測試 ETH");
      }

      console.log("網路信息:", {
        chainId: Number(network.chainId),
        name: network.name,
        contractAddress: CONTRACT_ADDRESS,
        accountBalance: ethers.formatEther(balance),
      });

      // Check if contract is deployed
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (code === "0x") {
        throw new Error(`合約未部署到地址 ${CONTRACT_ADDRESS}。請檢查合約地址或部署狀態。`);
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, AnonymousVoting.abi, signer);

      // Test contract connection with gas estimation
      try {
        const totalVotings = await contract.getTotalVotings();
        console.log("✅ 合約連接成功，總投票數:", totalVotings.toString());

        // 測試 gas 估算
        try {
          const gasEstimate = await contract.getTotalVotings.estimateGas();
          console.log("📊 Gas 估算:", gasEstimate.toString());
        } catch (gasErr) {
          console.warn("⚠️ Gas 估算失敗:", gasErr);
        }
      } catch (testErr: any) {
        console.error("❌ 合約測試失敗:", testErr);
        throw new Error(`合約連接測試失敗: ${testErr.message}`);
      }

      setState((prev) => ({
        ...prev,
        provider,
        signer,
        contract,
        account,
        chainId: Number(network.chainId),
        isConnected: true,
      }));
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setState((prev) => ({
      ...prev,
      provider: null,
      signer: null,
      contract: null,
      account: "",
      chainId: null,
      isConnected: false,
    }));
  };

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== state.account) {
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        connectWallet();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [state.account]);

  const switchView = (view: "list" | "create" | "details", votingId?: number) => {
    console.log("🔍 [App] switchView 被調用:", { view, votingId, currentView: state.currentView });
    console.log("🔍 [App] 當前狀態:", {
      currentView: state.currentView,
      selectedVotingId: state.selectedVotingId,
      isConnected: state.isConnected,
      hasContract: !!state.contract,
    });

    setState((prev) => {
      const newState = {
        ...prev,
        currentView: view,
        selectedVotingId: votingId !== undefined ? votingId : null,
      };
      console.log("🔍 [App] 設置新狀態:", newState);
      return newState;
    });
  };

  const refreshData = () => {
    console.log("🔄 刷新數據");
    // Force refresh by switching to list view
    setState((prev) => ({
      ...prev,
      currentView: "list",
      selectedVotingId: null,
    }));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🗳️ 匿名投票 dApp</h1>
        <p>基於 FHEVM 的隱私保護投票系統</p>
      </header>

      <main className="App-main">
        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
            <button onClick={() => setError("")}>關閉</button>
          </div>
        )}

        {!state.isConnected ? (
          <WalletConnection onConnect={connectWallet} loading={loading} />
        ) : (
          <div className="connected-app">
            <div className="wallet-info">
              <div className="account-info">
                <p>
                  <strong>連接的帳戶:</strong> {state.account}
                </p>
                <p>
                  <strong>網路 ID:</strong> {state.chainId}
                </p>
                <button onClick={disconnectWallet} className="disconnect-btn">
                  斷開連接
                </button>
              </div>
            </div>

            <nav className="app-nav">
              <button onClick={() => switchView("list")} className={state.currentView === "list" ? "active" : ""}>
                投票列表
              </button>
              <button onClick={() => switchView("create")} className={state.currentView === "create" ? "active" : ""}>
                創建投票
              </button>
            </nav>

            <div className="app-content">
              {(() => {
                console.log("🔍 [App] 渲染邏輯檢查:", {
                  currentView: state.currentView,
                  selectedVotingId: state.selectedVotingId,
                  isListView: state.currentView === "list",
                  isCreateView: state.currentView === "create",
                  isDetailsView: state.currentView === "details",
                  hasSelectedId: state.selectedVotingId !== null,
                  shouldRenderDetails: state.currentView === "details" && state.selectedVotingId !== null,
                });
                return null;
              })()}

              {state.currentView === "list" && (
                <VotingList
                  contract={state.contract!}
                  account={state.account}
                  onSelectVoting={(id) => {
                    console.log("🔍 [App] VotingList onSelectVoting 被調用:", id);
                    switchView("details", id);
                  }}
                />
              )}

              {state.currentView === "create" && (
                <CreateVoting
                  contract={state.contract!}
                  account={state.account}
                  onVotingCreated={() => {
                    switchView("list");
                    refreshData();
                  }}
                />
              )}

              {state.currentView === "details" &&
                state.selectedVotingId !== null &&
                (() => {
                  console.log("🔍 [App] 條件渲染 VotingDetails:", {
                    currentView: state.currentView,
                    selectedVotingId: state.selectedVotingId,
                  });
                  return (
                    <div>
                      <VotingDetails
                        contract={state.contract!}
                        account={state.account}
                        votingId={state.selectedVotingId}
                        onBack={() => switchView("list")}
                      />
                    </div>
                  );
                })()}

              {state.currentView === "details" && state.selectedVotingId === null && (
                <div>
                  <p>⚠️ 沒有選中的投票</p>
                  <button onClick={() => switchView("list")}>返回列表</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>Powered by FHEVM - 保護隱私的區塊鏈投票</p>
      </footer>
    </div>
  );
}

export default App;
