const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const DB_PATH = "./db12026.bds";

// Simple CSV to JSON converter
function csvToJson(csvString) {
  const lines = csvString.trim().split("\n");
  if (lines.length === 0) return [];

  // Parse headers (remove quotes)
  const headers = lines[0]
    .split(",")
    .map((h) => h.replace(/^"|"$/g, "").trim());

  return lines.slice(1).map((line) => {
    // Regex to handle quoted CSV fields
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const row = {};
    headers.forEach((header, index) => {
      const val = values[index]
        ? values[index].replace(/^"|"$/g, "").trim()
        : "";
      row[header] = val;
    });
    return row;
  });
}

function readBusyTable(tableName) {
  try {
    console.log(`1. Exporting table [${tableName}] from ${DB_PATH}...`);

    // Run mdb-export command
    const csvData = execSync(`mdb-export "${DB_PATH}" "${tableName}"`, {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 50, // 50MB buffer
    });

    const records = csvToJson(csvData);
    console.log(`✅ Success! Total records found: ${records.length}`);

    // Filter Products if reading Master1 (BUSY stores Items in Master1)
    if (tableName === "Master1") {
      const products = records
        .filter((item) => item.MasterType === "6") // 6 = Items in BUSY
        .map((item) => {
          const priceD2 = parseFloat(item.D2) || 0;

          return {
            ...item,
            D2: Math.round(priceD2 * 100), // Direct integer rounding
          };
        });

      // 2. Filter Item Groups / Categories (MasterType = 5)
      const groups = records
        .filter((item) => item.MasterType === "5")
        .map((group) => ({
          Code: group.Code,
          Name: group.Name,
          Alias: group.Alias,
          ParentGrp: group.ParentGrp, // Parent Group ID (for sub-categories)
        }));

      console.log(`📦 Found ${products.length} products (MasterType = 6)`);
      console.log(`📂 Found ${groups.length} item groups (MasterType = 5)`);

      // Print Sample Product
      if (products.length > 0) {
        console.log("\nSample Product:");
        console.log({
          Name: products[0].Name,
          Code: products[0].Code,
          Price_D2: products[0].D2,
          ParentGrp: products[0].ParentGrp,
        });
      }

      // Print Sample Group
      if (groups.length > 0) {
        console.log("\nSample Item Group:");
        console.log(groups[0]);
      }

      // Save processed products to JSON
      fs.writeFileSync("products.json", JSON.stringify(products, null, 2));
      console.log("💾 Saved products to products.json");
      
      // Save processed groups to JSON
      fs.writeFileSync("groups.json", JSON.stringify(groups, null, 2));
      console.log("💾 Saved groups to groups.json");
    }
  } catch (error) {
    console.error("❌ Error reading database:", error.message);
  }
}

// Read Master1 table
readBusyTable("Master1");
