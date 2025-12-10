import { ethers } from "hardhat";

async function main() {
  // ❌ 刪除這行報錯的代碼
  // const [deployer] = await ethers.getSigners();

  // ✅ 改用手動填寫地址 (請將下面的 0x... 換成您部署合約的錢包地址)
  const deployerAddress = "0x98aA456DEB03B9d97bb1d040F66D92018A624877";

  console.log("Generating args for deployer:", deployerAddress);

  // 參數配置 (必須與部署時一致)
  const oracle = deployerAddress; // Oracle 通常就是 deployer
  const question = "Will the green car win the race?";
  const initialTokenValue = ethers.parseEther("0.001");
  const initialProbability = 50;
  const percentageLocked = 10;

  // 生成編碼
  const abiCoder = new ethers.AbiCoder();
  const encoded = abiCoder.encode(
    ["address", "address", "string", "uint256", "uint8", "uint8"],
    [deployerAddress, oracle, question, initialTokenValue, initialProbability, percentageLocked],
  );

  console.log("\n👇 請複製下面這串代碼 (不含引號) 👇\n");
  console.log(encoded);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
