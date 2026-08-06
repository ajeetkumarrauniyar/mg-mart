const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const DB_PATH = "./db12026.bds";

// Check all tables and their record counts from the bds file
function checkAllTablesCount() {
  try {
    console.log("🔍 Fetching table list...\n");

    // 1. Get list of all tables
    const tableListStr = execSync(`mdb-tables -1 "${DB_PATH}"`, {
      encoding: "utf8",
    });
    const tables = tableListStr.trim().split("\n").filter(Boolean);

    console.log(`Total Tables Found: ${tables.length}\n`);

    const tableCounts = [];
    let emptyTables = 0;
    let failedTables = 0;

    // 2. Count records in each table
    for (const table of tables) {
      if (table === "Master1") continue; // Master1 already checked

      try {
        const csvData = execSync(`mdb-export "${DB_PATH}" "${table}"`, {
          encoding: "utf8",
          maxBuffer: 1024 * 1024 * 10,
        });

        const rowCount = Math.max(0, csvData.trim().split("\n").length - 1);

        if (rowCount > 0) {
          tableCounts.push({
            "Table Name": table,
            "Total Records": rowCount,
          });
        } else {
          emptyTables++;
        }
      } catch (err) {
        failedTables++;
        console.error(`❌ Failed to read table [${table}]:`, err.message);
      }
    }

    // Sort by most records first
    tableCounts.sort((a, b) => b["Total Records"] - a["Total Records"]);

    // console.table(tableCounts);
    console.log("Non Empty :", tableCounts.length);
    console.log("Empty :", emptyTables);
    console.log("Failed :", failedTables);

    fs.writeFileSync("table-counts.json", JSON.stringify(tableCounts, null, 2));

    console.log("💾 Saved table counts to table-counts.json");
  } catch (error) {
    console.error("❌ Error scanning tables:", error.message);
  }
}

// List all Master Types in Master1 table with counts and sample names
function listAllMasterTypes() {
  try {
    console.log("🔍 Scanning Master1 table...\n");

    const csvData = execSync(`mdb-export "${DB_PATH}" "Master1"`, {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 50,
    });

    const lines = csvData.trim().split("\n");
    if (lines.length <= 1) return;

    const headers = lines[0]
      .split(",")
      .map((h) => h.replace(/^"|"$/g, "").trim());
    const typeIdx = headers.indexOf("MasterType");
    const nameIdx = headers.indexOf("Name");

    const masterSummary = {};

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      const type = values[typeIdx]
        ? values[typeIdx].replace(/^"|"$/g, "").trim()
        : "Unknown";
      const name = values[nameIdx]
        ? values[nameIdx].replace(/^"|"$/g, "").trim()
        : "";

      if (!masterSummary[type]) {
        masterSummary[type] = { count: 0, samples: [] };
      }

      masterSummary[type].count++;
      if (masterSummary[type].samples.length < 2 && name) {
        masterSummary[type].samples.push(name);
      }

      fs.writeFileSync(
        "master_summary.json",
        JSON.stringify(masterSummary, null, 2),
      );
    }

    const result = Object.keys(masterSummary).map((type) => ({
      MasterType: type,
      "Total Records": masterSummary[type].count,
      "Sample Names": masterSummary[type].samples.join(" / "),
    }));

    console.table(result);
  } catch (error) {
    console.error("❌ Error scanning database:", error.message);
  }
}

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

// Read and process the Master1 table from the BDS database
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
            D2: Math.round(priceD2 * 100) / 100, // Direct integer rounding
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

      // 3. Brands / Manufacturers (MasterType = 201)
      const brands = records
        .filter((item) => item.MasterType === "201")
        .map((brand) => ({
          Code: brand.Code,
          Name: brand.Name,
          Alias: brand.Alias,
        }));

      console.log(`📦 Found ${products.length} products (MasterType = 6)`);
      console.log(`📂 Found ${groups.length} item groups (MasterType = 5)`);
      console.log(`🏷️ Found ${brands.length} brands (MasterType = 201)`);

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

      // Print Sample Brand
      if (brands.length > 0) {
        console.log("\nSample Brand:");
        console.log(brands[0]);
      }

      // Save processed products to JSON
      fs.writeFileSync("products.json", JSON.stringify(products, null, 2));
      console.log("💾 Saved products to products.json");
      // Save processed groups to JSON
      fs.writeFileSync("groups.json", JSON.stringify(groups, null, 2));
      console.log("💾 Saved groups to groups.json");
      // Save processed brands to JSON
      fs.writeFileSync("brands.json", JSON.stringify(brands, null, 2));
      console.log("💾 Saved brands to brands.json");
    }
  } catch (error) {
    console.error("❌ Error reading database:", error.message);
  }
}

checkAllTablesCount();

// listAllMasterTypes();

// readBusyTable("Master1");
