const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 正在尋找編譯文件...");

  // 1. 找到 build-info 目錄
  const buildInfoDir = path.join(__dirname, "../artifacts/build-info");
  if (!fs.existsSync(buildInfoDir)) {
    console.error("❌ 找不到 artifacts！請先執行 yarn compile");
    return;
  }

  // 2. 讀取最新的 json 文件
  const files = fs.readdirSync(buildInfoDir);
  const jsonFile = files.find(f => f.endsWith(".json"));

  if (!jsonFile) {
    console.error("❌ 找不到 build-info JSON 文件。");
    return;
  }

  // 3. 提取 input 部分
  const content = fs.readFileSync(path.join(buildInfoDir, jsonFile), "utf8");
  const buildInfo = JSON.parse(content);
  const inputJson = buildInfo.input; // 這就是 Etherscan 想要的東西

  // 4. 寫入 verify.json
  const outputPath = path.join(__dirname, "../verify.json");
  fs.writeFileSync(outputPath, JSON.stringify(inputJson, null, 2));

  console.log("\n✅ 成功生成文件verify.json");
  console.log(`📂 文件路徑：${outputPath}`);
  console.log("👉 請將此文件上傳到 Etherscan");
}

main();
