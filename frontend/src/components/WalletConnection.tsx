import React from "react";

interface WalletConnectionProps {
  onConnect: () => Promise<void>;
  loading: boolean;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ onConnect, loading }) => {
  return (
    <div className="wallet-connection">
      <div className="connection-card">
        <h2>🔐 連接您的錢包</h2>
        <p>請連接 MetaMask 錢包來使用匿名投票 dApp</p>

        <div className="wallet-features">
          <div className="feature">
            <span>🗳️</span>
            <h3>匿名投票</h3>
            <p>使用同態加密保護您的投票隱私</p>
          </div>
          <div className="feature">
            <span>🔒</span>
            <h3>完全加密</h3>
            <p>所有投票數據都經過加密處理</p>
          </div>
          <div className="feature">
            <span>🌐</span>
            <h3>去中心化</h3>
            <p>基於區塊鏈的透明投票系統</p>
          </div>
        </div>

        <button onClick={onConnect} disabled={loading} className="connect-button">
          {loading ? "連接中..." : "連接 MetaMask"}
        </button>

        <div className="connection-requirements">
          <h4>需要條件：</h4>
          <ul>
            <li>安裝 MetaMask 瀏覽器擴展</li>
            <li>連接到支持的網路（Sepolia 測試網）</li>
            <li>帳戶中有足夠的 ETH 支付 gas 費用</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WalletConnection;
