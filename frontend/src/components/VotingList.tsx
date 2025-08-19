import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

interface Voting {
  id: number;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  ended: boolean;
  creator: string;
  totalVoters: number;
  candidateCount: number;
  isActive: boolean;
  hasUserVoted: boolean;
}

interface VotingListProps {
  contract: ethers.Contract;
  account: string;
  onSelectVoting: (id: number) => void;
}

const VotingList: React.FC<VotingListProps> = ({ contract, account, onSelectVoting }) => {
  const [votings, setVotings] = useState<Voting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadVotings();
  }, [contract, account]);

  const loadVotings = async () => {
    try {
      setLoading(true);
      setError("");

      // Check if contract is connected
      if (!contract) {
        throw new Error("合約未連接");
      }

      // Check if contract address has code
      const provider = contract.runner?.provider;
      if (provider) {
        const code = await provider.getCode(contract.target);
        if (code === "0x") {
          throw new Error(`合約未部署到地址 ${contract.target}`);
        }
      }

      console.log("正在調用 getTotalVotings()...");
      const totalVotings = await contract.getTotalVotings();
      console.log("getTotalVotings() 返回:", totalVotings);

      const votingsData: Voting[] = [];

      for (let i = 0; i < totalVotings; i++) {
        const [title, description, startTime, endTime, ended, creator, totalVoters, candidateCount] =
          await contract.getVotingInfo(i);

        const isActive = await contract.isVotingActive(i);
        const hasUserVoted = await contract.hasVoted(i, account);

        votingsData.push({
          id: i,
          title,
          description,
          startTime: Number(startTime),
          endTime: Number(endTime),
          ended,
          creator,
          totalVoters: Number(totalVoters),
          candidateCount: Number(candidateCount),
          isActive,
          hasUserVoted,
        });
      }

      setVotings(votingsData.reverse()); // Show newest first
    } catch (err: any) {
      console.error("載入投票列表錯誤:", err);
      let errorMessage = "載入投票列表失敗: ";

      if (err.code === "BAD_DATA") {
        errorMessage += "合約返回無效數據，可能是合約未正確部署或網路問題";
      } else if (err.message.includes("could not decode result data")) {
        errorMessage += "無法解析合約返回數據，請檢查合約地址和網路連接";
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString("zh-TW");
  };

  const getTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;

    if (remaining <= 0) return "已結束";

    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (days > 0) return `${days}天 ${hours}小時`;
    if (hours > 0) return `${hours}小時 ${minutes}分鐘`;
    return `${minutes}分鐘`;
  };

  const getStatusBadge = (voting: Voting) => {
    if (voting.ended || !voting.isActive) {
      return <span className="status-badge ended">已結束</span>;
    }
    if (voting.hasUserVoted) {
      return <span className="status-badge voted">已投票</span>;
    }
    return <span className="status-badge active">進行中</span>;
  };

  if (loading) {
    return (
      <div className="voting-list-loading">
        <div className="spinner"></div>
        <p>載入投票列表中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="voting-list-error">
        <p>❌ {error}</p>
        <button onClick={loadVotings}>重新載入</button>
      </div>
    );
  }

  return (
    <div className="voting-list">
      <div className="list-header">
        <h2>📋 投票列表</h2>
        <button onClick={loadVotings} className="refresh-btn">
          🔄 重新整理
        </button>
      </div>

      {votings.length === 0 ? (
        <div className="empty-list">
          <p>🗳️ 還沒有任何投票</p>
          <p>成為第一個創建投票的人！</p>
        </div>
      ) : (
        <div className="votings-grid">
          {votings.map((voting) => (
            <div key={voting.id} className="voting-card">
              <div className="card-header">
                <h3>{voting.title}</h3>
                {getStatusBadge(voting)}
              </div>

              <p className="description">{voting.description}</p>

              <div className="voting-details">
                <div className="detail-row">
                  <span>候選人數:</span>
                  <span>{voting.candidateCount}</span>
                </div>
                <div className="detail-row">
                  <span>總投票數:</span>
                  <span>{voting.totalVoters}</span>
                </div>
                <div className="detail-row">
                  <span>剩餘時間:</span>
                  <span>{getTimeRemaining(voting.endTime)}</span>
                </div>
                <div className="detail-row">
                  <span>創建者:</span>
                  <span className="address">
                    {voting.creator === account ? "你" : `${voting.creator.slice(0, 6)}...${voting.creator.slice(-4)}`}
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <p className="timestamps">
                  開始: {formatDate(voting.startTime)}
                  <br />
                  結束: {formatDate(voting.endTime)}
                </p>

                <button onClick={() => onSelectVoting(voting.id)} className="view-details-btn">
                  查看詳情
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VotingList;
