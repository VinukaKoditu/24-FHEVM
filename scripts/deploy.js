const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 開始部署匿名投票合約...");

  try {
    // 獲取部署者帳戶
    const [deployer] = await ethers.getSigners();
    console.log("📱 部署者帳戶:", deployer.address);

    // 獲取合約工廠
    const AnonymousVoting = await ethers.getContractFactory("AnonymousVoting");

    // 部署合約
    console.log("⏳ 正在部署合約...");
    const contract = await AnonymousVoting.deploy();

    // 等待部署完成
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log("✅ 部署成功！");
    console.log("📍 合約地址:", contractAddress);
    console.log("");
    console.log("🔧 請複製以下內容到前端 App.tsx:");
    console.log(`const CONTRACT_ADDRESS = "${contractAddress}";`);
    console.log("");
    console.log("🔗 網路資訊:");
    console.log("- RPC URL: http://localhost:8545");
    console.log("- Chain ID: 31337");
    console.log("- 部署者:", deployer.address);

    return contractAddress;
  } catch (error) {
    console.error("❌ 部署失敗:", error.message);
    throw error;
  }
}

main()
  .then((address) => {
    console.log("🎉 部署流程完成！合約地址:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 錯誤:", error);
    process.exit(1);
  });
