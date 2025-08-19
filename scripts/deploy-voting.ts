import { ethers } from "hardhat";

async function main() {
  console.log("部署匿名投票合約...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  console.log("使用帳戶部署:", deployer.address);
  console.log("帳戶餘額:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  // Deploy the contract
  const AnonymousVoting = await ethers.getContractFactory("AnonymousVoting");
  const anonymousVoting = await AnonymousVoting.deploy();

  await anonymousVoting.waitForDeployment();
  const contractAddress = await anonymousVoting.getAddress();

  console.log("匿名投票合約已部署到:", contractAddress);

  // Verify deployment
  try {
    const totalVotings = await anonymousVoting.getTotalVotings();
    console.log("合約初始化成功，當前投票數:", totalVotings.toString());
  } catch (error) {
    console.error("合約驗證失敗:", error);
  }

  // Save deployment info
  console.log("\n=== 部署資訊 ===");
  console.log("合約地址:", contractAddress);
  console.log("部署者:", deployer.address);
  console.log("網路:", (await deployer.provider.getNetwork()).name);

  console.log("\n請將以下合約地址更新到前端應用中:");
  console.log(`const CONTRACT_ADDRESS = "${contractAddress}";`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
