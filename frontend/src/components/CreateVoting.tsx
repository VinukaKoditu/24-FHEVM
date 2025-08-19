import React, { useState } from "react";
import { ethers } from "ethers";

interface CreateVotingProps {
  contract: ethers.Contract;
  account: string;
  onVotingCreated: () => void;
}

const CreateVoting: React.FC<CreateVotingProps> = ({ contract, account, onVotingCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 24, // hours
    candidates: ["", ""],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCandidateChange = (index: number, value: string) => {
    const newCandidates = [...formData.candidates];
    newCandidates[index] = value;
    setFormData((prev) => ({
      ...prev,
      candidates: newCandidates,
    }));
  };

  const addCandidate = () => {
    if (formData.candidates.length < 10) {
      setFormData((prev) => ({
        ...prev,
        candidates: [...prev.candidates, ""],
      }));
    }
  };

  const removeCandidate = (index: number) => {
    if (formData.candidates.length > 2) {
      const newCandidates = formData.candidates.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        candidates: newCandidates,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("請輸入投票標題");
      return false;
    }
    if (!formData.description.trim()) {
      setError("請輸入投票描述");
      return false;
    }
    if (formData.duration < 1) {
      setError("投票時間必須至少1小時");
      return false;
    }

    const validCandidates = formData.candidates.filter((c) => c.trim());
    if (validCandidates.length < 2) {
      setError("至少需要2個候選人");
      return false;
    }

    if (validCandidates.length !== new Set(validCandidates).size) {
      setError("候選人名稱不能重複");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      const validCandidates = formData.candidates.filter((c) => c.trim());
      const durationInSeconds = formData.duration * 3600; // Convert hours to seconds

      const tx = await contract.createVoting(
        formData.title.trim(),
        formData.description.trim(),
        validCandidates,
        durationInSeconds,
      );

      await tx.wait();

      // Reset form
      setFormData({
        title: "",
        description: "",
        duration: 24,
        candidates: ["", ""],
      });

      onVotingCreated();
    } catch (err: any) {
      setError("創建投票失敗: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-voting">
      <h2>🗳️ 創建新投票</h2>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="voting-form">
        <div className="form-group">
          <label htmlFor="title">投票標題 *</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="例如: 2024年班長選舉"
            maxLength={100}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">投票描述 *</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="請詳細描述這次投票的目的和規則..."
            maxLength={500}
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="duration">投票時長（小時）*</label>
          <input
            type="number"
            id="duration"
            value={formData.duration}
            onChange={(e) => handleInputChange("duration", parseInt(e.target.value) || 1)}
            min="1"
            max="8760" // 1 year
            required
          />
          <small>最短1小時，最長1年</small>
        </div>

        <div className="form-group">
          <label>候選人列表 *</label>
          <div className="candidates-list">
            {formData.candidates.map((candidate, index) => (
              <div key={index} className="candidate-input">
                <input
                  type="text"
                  value={candidate}
                  onChange={(e) => handleCandidateChange(index, e.target.value)}
                  placeholder={`候選人 ${index + 1}`}
                  maxLength={50}
                />
                {formData.candidates.length > 2 && (
                  <button type="button" onClick={() => removeCandidate(index)} className="remove-candidate-btn">
                    ❌
                  </button>
                )}
              </div>
            ))}
          </div>

          {formData.candidates.length < 10 && (
            <button type="button" onClick={addCandidate} className="add-candidate-btn">
              ➕ 增加候選人
            </button>
          )}

          <small>至少2個候選人，最多10個</small>
        </div>

        <div className="form-summary">
          <h3>📊 投票摘要</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span>標題:</span>
              <span>{formData.title || "未設定"}</span>
            </div>
            <div className="summary-item">
              <span>候選人數:</span>
              <span>{formData.candidates.filter((c) => c.trim()).length}</span>
            </div>
            <div className="summary-item">
              <span>投票時長:</span>
              <span>{formData.duration} 小時</span>
            </div>
            <div className="summary-item">
              <span>創建者:</span>
              <span className="address">{account}</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="create-btn">
            {loading ? "創建中..." : "🚀 創建投票"}
          </button>
        </div>
      </form>

      <div className="create-info">
        <h4>💡 創建投票說明</h4>
        <ul>
          <li>創建投票需要支付少量 gas 費用</li>
          <li>投票一旦創建就無法修改候選人</li>
          <li>只有創建者可以提前結束投票</li>
          <li>所有投票都是匿名的，使用加密技術保護隱私</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateVoting;
