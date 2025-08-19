import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
// 使用 fhevmjs 進行客戶端加密
import { createInstance } from "fhevmjs";

interface Candidate {
  name: string;
  index: number;
}

interface VotingInfo {
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

interface VotingDetailsProps {
  contract: ethers.Contract;
  account: string;
  votingId: number;
  onBack: () => void;
}

const VotingDetails: React.FC<VotingDetailsProps> = ({ contract, account, votingId, onBack }) => {
  const [votingInfo, setVotingInfo] = useState<VotingInfo | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number>(-1);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string>("");
  const [fhevmInstance, setFhevmInstance] = useState<any>(null);

  // 初始化 FHEVM 實例
  useEffect(() => {
    const initFhevmInstance = async () => {
      try {
        console.log("🔧 初始化 FHEVM 實例...");

        // 為 Sepolia 測試網配置 FHEVM 網絡參數
        const networkConfig = {
          chainId: 11155111, // Sepolia testnet
          kmsContractAddress: "0x9d6891A6240D6130c54ae243d8005063D05A696b",
          aclContractAddress: "0x339EcE85B9E11a3A3AA557582784a15d7F82AAf2",
        };

        // 使用網絡配置創建 FHEVM 實例
        const instance = await createInstance(networkConfig);

        setFhevmInstance(instance);
        console.log("✅ FHEVM 實例初始化成功");
      } catch (err) {
        console.error("❌ FHEVM 實例初始化失敗:", err);
        console.log("📝 將使用模擬模式進行測試");
        // 如果初始化失敗，仍然允許查看投票信息
      }
    };

    initFhevmInstance();
  }, []);
  useEffect(() => {
    loadVotingDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, votingId, account]);

  const loadVotingDetails = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔍 [VotingDetails] 開始載入投票詳情");
      console.log("🔍 [VotingDetails] 投票 ID:", votingId);
      console.log("🔍 [VotingDetails] 合約對象:", contract);
      console.log("🔍 [VotingDetails] 合約地址:", contract?.target);
      console.log("🔍 [VotingDetails] 用戶帳戶:", account);

      // 檢查合約是否有效
      if (!contract) {
        throw new Error("合約對象無效");
      }

      // 檢查投票ID是否有效
      console.log("📊 [VotingDetails] 調用 getTotalVotings...");
      const totalVotings = await contract.getTotalVotings();
      console.log("📊 [VotingDetails] 總投票數:", totalVotings.toString());

      if (votingId >= Number(totalVotings)) {
        throw new Error(`投票 ID ${votingId} 無效，總投票數為 ${totalVotings.toString()}`);
      }

      // 使用 getVotingInfo 函數獲取投票信息
      console.log("📊 [VotingDetails] 調用 getVotingInfo，參數:", votingId);
      const votingData = await contract.getVotingInfo(votingId);
      console.log("📊 [VotingDetails] getVotingInfo 原始結果:", votingData);
      console.log("📊 [VotingDetails] votingData 類型:", typeof votingData);
      console.log("📊 [VotingDetails] votingData 是否為陣列:", Array.isArray(votingData));
      console.log("📊 [VotingDetails] votingData 長度:", votingData?.length);

      // 檢查投票活動狀態
      console.log("🔄 [VotingDetails] 調用 isVotingActive...");
      const isActive = await contract.isVotingActive(votingId);
      console.log("🔄 [VotingDetails] 投票活動狀態:", isActive);

      // 根據 getVotingInfo 返回的數據結構解析（tuple 格式）
      const [title, description, startTime, endTime, ended, creator, totalVoters, candidateCount] = votingData;

      const parsedVotingInfo: VotingInfo = {
        title,
        description,
        startTime: Number(startTime),
        endTime: Number(endTime),
        ended,
        creator,
        totalVoters: Number(totalVoters),
        candidateCount: Number(candidateCount),
        isActive: isActive,
        hasUserVoted: false, // 稍後檢查
      };

      // 檢查投票是否存在
      if (!parsedVotingInfo.title) {
        throw new Error(`投票 ID ${votingId} 不存在或未初始化`);
      }

      console.log("✅ 解析後的投票信息:", parsedVotingInfo);

      // 檢查用戶是否已投票
      try {
        parsedVotingInfo.hasUserVoted = await contract.hasVoted(votingId, account);
        console.log("🗳️ 用戶投票狀態:", parsedVotingInfo.hasUserVoted);
      } catch (err) {
        console.warn("⚠️ 無法檢查用戶投票狀態:", err);
      }

      setVotingInfo(parsedVotingInfo);

      // 獲取候選人列表
      const candidatesData: Candidate[] = [];
      try {
        for (let i = 0; i < parsedVotingInfo.candidateCount; i++) {
          const name = await contract.getCandidateInfo(votingId, i);
          candidatesData.push({ name, index: i });
        }
        console.log("👥 候選人列表:", candidatesData);
        setCandidates(candidatesData);
      } catch (err) {
        console.warn("⚠️ 無法獲取候選人列表:", err);
        // 如果無法獲取候選人，創建占位符
        for (let i = 0; i < parsedVotingInfo.candidateCount; i++) {
          candidatesData.push({ name: `候選人 ${i + 1}`, index: i });
        }
        setCandidates(candidatesData);
      }
    } catch (err: any) {
      console.error("❌ 載入投票詳情失敗:", err);
      setError("載入投票詳情失敗: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (selectedCandidate === -1) {
      setError("請選擇一個候選人");
      return;
    }

    try {
      setVoting(true);
      setError("");

      console.log("🗳️ 開始投票，選項:", selectedCandidate);

      let encryptedVote;
      let inputProof;

      if (fhevmInstance) {
        // 使用真實的 FHE 加密
        console.log("🔒 使用 FHEVM 實例加密投票...");

        try {
          // 加密投票值 (1 表示一票)
          const voteValue = 1;
          const encryptedData = await fhevmInstance.encrypt32(voteValue);

          encryptedVote = encryptedData.data;
          inputProof = encryptedData.proof;

          console.log("🔒 投票已加密:", {
            原始值: voteValue,
            加密數據長度: encryptedVote.length,
            證明長度: inputProof.length,
          });
        } catch (fheErr: any) {
          console.error("❌ FHE 加密失敗:", fheErr);
          throw new Error("投票加密失敗: " + fheErr.message);
        }
      } else {
        // 使用模擬數據進行測試
        console.log("⚠️ FHEVM 實例未初始化，使用模擬數據進行測試");
        const userConfirm = window.confirm(
          "FHE 加密庫未完全初始化。\n\n" +
            "這可能是因為：\n" +
            "1. 您不在 Zama 的 FHE 網路上\n" +
            "2. 網路連接問題\n" +
            "3. SDK 初始化失敗\n\n" +
            "是否要嘗試使用模擬數據進行投票測試？\n" +
            "（注意：這可能會失敗，因為合約期望真實的加密數據）",
        );

        if (!userConfirm) {
          setVoting(false);
          return;
        }

        // 創建模擬的加密數據和證明
        encryptedVote = new Uint8Array(32).fill(1); // 模擬 32 字節的加密數據
        inputProof = new Uint8Array(64).fill(2); // 模擬 64 字節的證明

        console.log("🧪 使用模擬加密數據:", {
          模擬加密數據長度: encryptedVote.length,
          模擬證明長度: inputProof.length,
        });
      }

      // 估算 gas
      console.log("⛽ 估算 gas...");
      const gasEstimate = await contract.vote.estimateGas(votingId, selectedCandidate, encryptedVote, inputProof);
      console.log("⛽ Gas 估算:", gasEstimate.toString());

      // 調用合約的 vote 函數
      const tx = await contract.vote(votingId, selectedCandidate, encryptedVote, inputProof, {
        gasLimit: (gasEstimate * BigInt(120)) / BigInt(100), // 120% of estimate
        gasPrice: ethers.parseUnits("20", "gwei"),
      });

      console.log("📤 投票交易已提交:", tx.hash);
      await tx.wait();
      console.log("✅ 投票交易已確認:", tx.hash);

      // 重新載入投票詳情
      await loadVotingDetails();
      setSelectedCandidate(-1);
    } catch (err: any) {
      console.error("❌ 投票失敗:", err);
      setError("投票失敗: " + (err.reason || err.message || err.toString()));
    } finally {
      setVoting(false);
    }
  };

  const handleEndVoting = async () => {
    try {
      setEnding(true);
      setError("");

      const tx = await contract.endVoting(votingId, {
        gasLimit: 200000,
        gasPrice: ethers.parseUnits("20", "gwei"),
      });

      console.log("📤 結束投票交易已提交:", tx.hash);
      await tx.wait();
      console.log("✅ 結束投票交易已確認:", tx.hash);

      await loadVotingDetails();
    } catch (err: any) {
      console.error("❌ 結束投票失敗:", err);
      setError("結束投票失敗: " + (err.reason || err.message));
    } finally {
      setEnding(false);
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

  // 渲染調試信息
  console.log("🖼️ [VotingDetails] 渲染狀態:", {
    loading,
    error,
    votingInfo: votingInfo ? "存在" : "不存在",
    votingInfoTitle: votingInfo?.title,
    candidatesCount: candidates.length,
  });

  if (loading) {
    console.log("🖼️ [VotingDetails] 渲染 loading 狀態");
    return (
      <div className="voting-details-loading">
        <div className="spinner"></div>
        <p>載入投票詳情中...</p>
      </div>
    );
  }

  if (error && !votingInfo) {
    console.log("🖼️ [VotingDetails] 渲染錯誤狀態:", error);
    return (
      <div className="voting-details-error">
        <p>❌ {error}</p>
        <p>投票 ID: {votingId}</p>
        <button onClick={loadVotingDetails}>🔄 重試</button>
        <button onClick={onBack}>📋 返回列表</button>
      </div>
    );
  }

  if (!votingInfo) {
    console.log("🖼️ [VotingDetails] 渲染無投票信息狀態");
    return (
      <div className="voting-details-error">
        <p>⚠️ 找不到投票信息</p>
        <button onClick={onBack}>📋 返回列表</button>
      </div>
    );
  }

  console.log("🖼️ [VotingDetails] 渲染主要內容:", votingInfo.title);

  return (
    <div className="voting-details">
      <div className="details-header">
        <button onClick={onBack} className="back-btn">
          ← 返回列表
        </button>
        <h2>🗳️ {votingInfo.title}</h2>
      </div>

      {/* FHEVM 狀態指示器 */}
      <div className="fhevm-status">
        {fhevmInstance ? (
          <p className="fhevm-ready">🔒 FHEVM 加密就緒</p>
        ) : (
          <p className="fhevm-loading">⏳ FHEVM 初始化中...（可使用測試模式）</p>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      <div className="voting-info-card">
        <div className="info-section">
          <h3>📋 投票資訊</h3>
          <div className="info-grid">
            <div className="info-item">
              <span>描述:</span>
              <span>{votingInfo.description}</span>
            </div>
            <div className="info-item">
              <span>創建者:</span>
              <span className="address">
                {votingInfo.creator === account
                  ? "你"
                  : `${votingInfo.creator.slice(0, 6)}...${votingInfo.creator.slice(-4)}`}
              </span>
            </div>
            <div className="info-item">
              <span>開始時間:</span>
              <span>{formatDate(votingInfo.startTime)}</span>
            </div>
            <div className="info-item">
              <span>結束時間:</span>
              <span>{formatDate(votingInfo.endTime)}</span>
            </div>
            <div className="info-item">
              <span>剩餘時間:</span>
              <span className={votingInfo.isActive ? "active" : "ended"}>{getTimeRemaining(votingInfo.endTime)}</span>
            </div>
            <div className="info-item">
              <span>總投票數:</span>
              <span>{votingInfo.totalVoters}</span>
            </div>
            <div className="info-item">
              <span>狀態:</span>
              <span className={`status ${votingInfo.isActive ? "active" : "ended"}`}>
                {votingInfo.ended || !votingInfo.isActive ? "已結束" : "進行中"}
              </span>
            </div>
            <div className="info-item">
              <span>你的投票狀態:</span>
              <span className={`vote-status ${votingInfo.hasUserVoted ? "voted" : "not-voted"}`}>
                {votingInfo.hasUserVoted ? "已投票 ✅" : "未投票"}
              </span>
            </div>
          </div>
        </div>

        {votingInfo.creator === account && votingInfo.isActive && (
          <div className="creator-actions">
            <button onClick={handleEndVoting} disabled={ending} className="end-voting-btn">
              {ending ? "結束中..." : "⏹️ 提前結束投票"}
            </button>
          </div>
        )}
      </div>

      <div className="candidates-section">
        <h3>👥 候選人列表</h3>

        {votingInfo?.isActive && !votingInfo?.hasUserVoted ? (
          <div className="voting-interface">
            <p className="voting-instruction">請選擇您要投票的候選人：</p>

            {/* FHE 說明 */}
            <div className="fhevm-notice">
              <h4>🔒 FHEVM 加密投票</h4>
              <p>• 您的投票將使用全同態加密技術</p>
              <p>• 投票內容完全保密，無人可以查看</p>
              <p>• 只有最終統計結果會被公開</p>
              {!fhevmInstance && <p className="warning">⚠️ FHEVM 實例未完全初始化，可使用測試模式投票</p>}
            </div>

            <div className="candidates-grid">
              {candidates.map((candidate) => (
                <div
                  key={candidate.index}
                  className={`candidate-card ${selectedCandidate === candidate.index ? "selected" : ""}`}
                  onClick={() => setSelectedCandidate(candidate.index)}
                >
                  <div className="candidate-info">
                    <h4>{candidate.name}</h4>
                    <p>候選人 #{candidate.index + 1}</p>
                  </div>
                  <div className="candidate-selector">
                    <input
                      type="radio"
                      name="candidate"
                      checked={selectedCandidate === candidate.index}
                      onChange={() => setSelectedCandidate(candidate.index)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="voting-actions">
              <button onClick={handleVote} disabled={voting || selectedCandidate === -1} className="vote-btn">
                {voting ? "🔒 投票中..." : fhevmInstance ? "🗳️ 確認投票 (FHEVM 加密)" : "🧪 測試投票 (模擬模式)"}
              </button>
            </div>
          </div>
        ) : (
          <div className="candidates-display">
            {candidates.map((candidate) => (
              <div key={candidate.index} className="candidate-display-card">
                <h4>{candidate.name}</h4>
                <p>候選人 #{candidate.index + 1}</p>
                {!votingInfo.isActive && (
                  <p className="vote-count-placeholder">🔒 加密投票數（投票結束後可解密查看）</p>
                )}
              </div>
            ))}

            {votingInfo.hasUserVoted && (
              <div className="voted-notice">
                <p>✅ 您已完成投票，感謝參與！</p>
              </div>
            )}

            {!votingInfo.isActive && (
              <div className="ended-notice">
                <p>📊 投票已結束，結果已加密保存在區塊鏈上</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingDetails;
