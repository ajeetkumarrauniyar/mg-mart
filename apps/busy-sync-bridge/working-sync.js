const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Configuration
const dbPath = 'C:\\BusyWin\\Data\\COMP0001\\db12025.bds';
const dbPw = 'ILoveMyINDIA';
const tempJsonPath = path.join(__dirname, 'busy_data.json');

// Enhanced logging
const log = {
    info: (msg) => console.log(`[${new Date().toISOString()}] ℹ️  ${msg}`),
    success: (msg) => console.log(`[${new Date().toISOString()}] ✅ ${msg}`),
    warn: (msg) => console.warn(`[${new Date().toISOString()}] ⚠️  ${msg}`),
    error: (msg) => console.error(`[${new Date().toISOString()}] ❌ ${msg}`)
};

let db = null;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
    try {
        // Check if already initialized
        if (admin.apps.length > 0) {
            db = admin.firestore();
            return db;
        }

        // Look for service account key file
        const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
        
        if (!fs.existsSync(serviceAccountPath)) {
            log.warn("Firebase service account key not found!");
            log.info("Please add 'firebase-service-account.json' to this directory");
            return null;
        }

        // Initialize Firebase Admin
        const serviceAccount = require(serviceAccountPath);
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        db = admin.firestore();
        log.success("Firebase Admin SDK initialized successfully");
        return db;

    } catch (error) {
        log.error(`Firebase initialization failed: ${error.message}`);
        return null;
    }
}

/**
 * Test Firebase connection
 */
async function testFirebaseConnection() {
    try {
        const firestore = initializeFirebase();
        if (!firestore) {
            return false;
        }

        // Try to read from a test collection
        const testRef = firestore.collection('_test').doc('connection');
        await testRef.set({ 
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            test: true 
        });
        
        await testRef.delete(); // Clean up
        
        log.success("Firebase connection test passed");
        return true;
        
    } catch (error) {
        log.error(`Firebase connection test failed: ${error.message}`);
        return false;
    }
}

/**
 * Get product count from Firestore
 */
async function getProductCount(collection = 'products') {
    try {
        const firestore = initializeFirebase();
        if (!firestore) {
            return 0;
        }

        const snapshot = await firestore.collection(collection).count().get();
        return snapshot.data().count;
        
    } catch (error) {
        log.error(`Failed to get product count: ${error.message}`);
        return 0;
    }
}

/**
 * Test database connection (simple version)
 */
async function testConnection() {
    log.info("Testing database connection...");
    
    // Write a simple PowerShell script to file
    const testScriptContent = `
try {
    if (-not (Test-Path "${dbPath}")) {
        throw "Database file not found"
    }
    
    $conn = New-Object System.Data.OleDb.OleDbConnection("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${dbPath};Jet OLEDB:Database Password=${dbPw};Mode=Read;")
    $conn.Open()
    
    $cmd = New-Object System.Data.OleDb.OleDbCommand("SELECT COUNT(*) FROM Master1 WHERE MasterType = 6", $conn)
    $count = $cmd.ExecuteScalar()
    
    Write-Host "SUCCESS: Found $count products in database"
    $conn.Close()
    
} catch {
    Write-Error "CONNECTION FAILED: $($_.Exception.Message)"
    throw
}
`;
    
    const scriptPath = path.join(__dirname, 'test_connection.ps1');
    
    try {
        fs.writeFileSync(scriptPath, testScriptContent, 'utf8');
        
        const result = execSync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, { 
            encoding: 'utf8',
            timeout: 15000
        });
        
        log.success("Database connection test passed");
        
        // Extract count from result
        const countMatch = result.match(/Found (\d+) products/);
        if (countMatch) {
            const totalProducts = parseInt(countMatch[1]);
            log.info(`Total products in database: ${totalProducts}`);
            return totalProducts;
        }
        
        return true;
    } catch (error) {
        log.error("Database connection test failed");
        log.error(error.message);
        return false;
    } finally {
        // Cleanup
        try {
            if (fs.existsSync(scriptPath)) {
                fs.unlinkSync(scriptPath);
            }
        } catch (cleanupError) {
            // Ignore cleanup errors
        }
    }
}

/**
 * Get sample data using the working approach from your individual scripts
 */
async function getSampleData() {
    log.info("Getting sample data...");
    
    // Write a simple PowerShell script similar to your working sampler.js
    const sampleScriptContent = `
try {
    $conn = New-Object System.Data.OleDb.OleDbConnection("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${dbPath};Jet OLEDB:Database Password=${dbPw};Mode=Read;")
    $conn.Open()
    
    $cmd = New-Object System.Data.OleDb.OleDbCommand("SELECT TOP 5 Name, Code, D1, D2, D3, ParentGrp FROM Master1 WHERE MasterType = 6", $conn)
    $reader = $cmd.ExecuteReader()
    
    Write-Host "--- Sample Data from BUSY ---"
    while ($reader.Read()) {
        $name = if ($reader["Name"] -eq [DBNull]::Value) { "Unknown" } else { $reader["Name"] }
        $code = if ($reader["Code"] -eq [DBNull]::Value) { "0" } else { $reader["Code"] }
        $d1 = if ($reader["D1"] -eq [DBNull]::Value) { 0 } else { $reader["D1"] }
        $d2 = if ($reader["D2"] -eq [DBNull]::Value) { 0 } else { $reader["D2"] }
        $d3 = if ($reader["D3"] -eq [DBNull]::Value) { 0 } else { $reader["D3"] }
        $category = if ($reader["ParentGrp"] -eq [DBNull]::Value) { "General" } else { $reader["ParentGrp"] }
        
        Write-Host "Item: $name"
        Write-Host "  D1 (Sales Price?): $d1"
        Write-Host "  D2 (MRP?): $d2"
        Write-Host "  D3: $d3"
        Write-Host "  Code: $code"
        Write-Host "  Category: $category"
        Write-Host ""
    }
    
    $reader.Close()
    $conn.Close()
    
    Write-Host "SUCCESS: Sample data retrieved"
    
} catch {
    Write-Error "SAMPLE DATA FAILED: $($_.Exception.Message)"
    throw
}
`;
    
    const scriptPath = path.join(__dirname, 'sample_data.ps1');
    
    try {
        fs.writeFileSync(scriptPath, sampleScriptContent, 'utf8');
        
        const result = execSync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, { 
            encoding: 'utf8',
            timeout: 30000
        });
        
        log.success("Sample data retrieved successfully");
        console.log('\n' + result);
        
        return true;
    } catch (error) {
        log.error("Sample data failed");
        log.error(error.message);
        return false;
    } finally {
        // Cleanup
        try {
            if (fs.existsSync(scriptPath)) {
                fs.unlinkSync(scriptPath);
            }
        } catch (cleanupError) {
            // Ignore cleanup errors
        }
    }
}

/**
 * Upload products to Firebase Firestore
 */
async function uploadToFirebase(products, options = {}) {
    log.info("🔥 Uploading to Firebase...");
    
    try {
        // Test Firebase connection first
        const connectionOk = await testFirebaseConnection();
        if (!connectionOk) {
            log.error("Firebase connection failed. Please check your configuration.");
            return false;
        }

        // Get current product count
        const currentCount = await getProductCount();
        log.info(`📊 Current products in Firebase: ${currentCount}`);

        // Upload products using integrated function
        const results = await uploadProductsToFirestore(products, {
            batchSize: 500,
            collection: 'products',
            merge: true, // Preserve existing imageUrl, description fields
            dryRun: options.dryRun || false
        });

        if (results.successfulBatches === results.totalBatches) {
            log.success(`🎉 Successfully uploaded ${products.length} products to Firebase!`);
            
            // Get updated count
            const newCount = await getProductCount();
            log.info(`📊 Updated products in Firebase: ${newCount}`);
            
            return true;
        } else {
            log.warn(`⚠️  Partial upload: ${results.successfulBatches}/${results.totalBatches} batches succeeded`);
            return false;
        }
        
    } catch (error) {
        log.error(`Firebase upload failed: ${error.message}`);
        return false;
    }
}

/**
 * Upload products to Firestore in batches (integrated function)
 */
async function uploadProductsToFirestore(products, options = {}) {
    const {
        batchSize = 500,
        collection = 'products',
        merge = true,
        dryRun = false
    } = options;

    const firestore = initializeFirebase();
    if (!firestore) {
        throw new Error("Firebase not initialized");
    }

    log.info(`🔥 Starting Firebase upload of ${products.length} products...`);
    
    if (dryRun) {
        log.warn("DRY RUN MODE - No actual data will be uploaded");
    }

    // Split products into batches
    const batches = [];
    for (let i = 0; i < products.length; i += batchSize) {
        batches.push(products.slice(i, i + batchSize));
    }

    log.info(`📦 Created ${batches.length} batches (max ${batchSize} items each)`);

    const results = {
        totalProducts: products.length,
        totalBatches: batches.length,
        successfulBatches: 0,
        failedBatches: 0,
        errors: []
    };

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchNumber = batchIndex + 1;
        
        try {
            log.info(`📤 Processing batch ${batchNumber}/${batches.length} (${batch.length} products)...`);
            
            if (!dryRun) {
                // Create Firestore batch
                const firestoreBatch = firestore.batch();
                
                // Add each product to the batch
                batch.forEach(product => {
                    const docRef = firestore.collection(collection).doc(product.productId);
                    
                    // Fix timestamp fields - convert ISO strings to Firestore timestamps
                    const productData = { ...product };
                    if (productData.createdAt && typeof productData.createdAt === 'string') {
                        productData.createdAt = admin.firestore.Timestamp.fromDate(new Date(productData.createdAt));
                    }
                    if (productData.updatedAt && typeof productData.updatedAt === 'string') {
                        productData.updatedAt = admin.firestore.Timestamp.fromDate(new Date(productData.updatedAt));
                    }
                    if (productData.lastUpdated && typeof productData.lastUpdated === 'string') {
                        productData.lastUpdated = admin.firestore.Timestamp.fromDate(new Date(productData.lastUpdated));
                    }
                    
                    if (merge) {
                        // Merge to preserve existing fields like imageUrl, description
                        firestoreBatch.set(docRef, productData, { merge: true });
                    } else {
                        // Overwrite completely
                        firestoreBatch.set(docRef, productData);
                    }
                });
                
                // Commit the batch
                await firestoreBatch.commit();
            }
            
            results.successfulBatches++;
            log.success(`✅ Batch ${batchNumber} uploaded successfully (${batch.length} products)`);
            
            // Small delay between batches to avoid rate limits
            if (batchIndex < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
        } catch (error) {
            results.failedBatches++;
            results.errors.push({
                batch: batchNumber,
                error: error.message,
                products: batch.length
            });
            
            log.error(`❌ Batch ${batchNumber} failed: ${error.message}`);
        }
    }

  // Summary
  log.info("\n" + "=".repeat(60));
  log.info("🎯 FIREBASE UPLOAD SUMMARY");
  log.info("=".repeat(60));
  log.info(`📊 Total Products: ${results.totalProducts}`);
  log.info(`📦 Total Batches: ${results.totalBatches}`);
  log.success(`✅ Successful Batches: ${results.successfulBatches}`);

  if (results.failedBatches > 0) {
    log.error(`❌ Failed Batches: ${results.failedBatches}`);
    results.errors.forEach((error) => {
      log.error(
        `   Batch ${error.batch}: ${error.error} (${error.products} products)`,
      );
    });
  }

    return results;
}

/**
 * Get products with prices from BUSY database via PowerShell
 */
async function getProductsWithPrices() {
  log.info("Getting products with prices...");

  const productsScriptContent = `
try {
    $conn = New-Object System.Data.OleDb.OleDbConnection("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${dbPath};Jet OLEDB:Database Password=${dbPw};Mode=Read;")
    $conn.Open()
    
    $cmd = New-Object System.Data.OleDb.OleDbCommand("SELECT Name, Code, D1, D2, D3, ParentGrp FROM Master1 WHERE MasterType = 6", $conn)
    $reader = $cmd.ExecuteReader()
    
    $items = @()
    $rowCount = 0
    
    while ($reader.Read()) {
        $rowCount++
        $item = [PSCustomObject]@{
            Name = if ($reader["Name"] -eq [DBNull]::Value) { "Unknown" } else { $reader["Name"].ToString().Trim() }
            Code = if ($reader["Code"] -eq [DBNull]::Value) { "0" } else { $reader["Code"].ToString().Trim() }
            D1 = if ($reader["D1"] -eq [DBNull]::Value) { 0 } else { [double]$reader["D1"] }
            D2 = if ($reader["D2"] -eq [DBNull]::Value) { 0 } else { [double]$reader["D2"] }
            D3 = if ($reader["D3"] -eq [DBNull]::Value) { 0 } else { [double]$reader["D3"] }
            ParentGrp = if ($reader["ParentGrp"] -eq [DBNull]::Value) { "General" } else { $reader["ParentGrp"].ToString().Trim() }
        }
        
        $items += $item
        
        if ($rowCount % 100 -eq 0) {
            Write-Host "Processed $rowCount items..."
        }
    }
    
    $reader.Close()
    $conn.Close()
    
    $data = @{ 
        items = $items
        itemCount = $items.Count
        queryTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        method = "Master1_Simple"
    }
    
    $json = $data | ConvertTo-Json -Depth 3 -Compress
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText("${tempJsonPath.replace(/\\/g, '\\\\')}", $json, $utf8NoBom)
    
    Write-Host "SUCCESS: Exported $($items.Count) items to JSON"
    
} catch {
    Write-Error "PRODUCT FETCH FAILED: $($_.Exception.Message)"
    throw
}
`;

  const scriptPath = path.join(__dirname, "get_products.ps1");

  try {
    fs.writeFileSync(scriptPath, productsScriptContent, "utf8");

    const result = execSync(
      `powershell -ExecutionPolicy Bypass -File "${scriptPath}"`,
      {
        encoding: "utf8",
        timeout: 60000,
      },
    );

    if (!fs.existsSync(tempJsonPath)) {
      throw new Error("JSON file not created by PowerShell script");
    }

    // Read the JSON file and handle BOM issues
    let jsonContent = fs.readFileSync(tempJsonPath, "utf8");

    // Remove BOM if present
    if (jsonContent.charCodeAt(0) === 0xfeff) {
      jsonContent = jsonContent.slice(1);
    }

    // Clean up any extra characters
    jsonContent = jsonContent.trim();

    const rawData = JSON.parse(jsonContent);
    log.success(
      `Retrieved ${rawData.itemCount} products using ${rawData.method}`,
    );

    // Transform to Firebase format with corrected pricing logic
    const firebaseProducts = rawData.items.map((item, index) => {
      // D1 = 1 appears to be a flag, D2 = actual price
      const actualPrice = Number(item.D2) || 0;
      const mappedCategory = mapCategory(item.ParentGrp);

      // Debug first few items
      if (index < 3) {
        console.log(`\nDEBUG Item ${index + 1}:`);
        console.log(`  Name: ${item.Name}`);
        console.log(`  D1: ${item.D1} (flag)`);
        console.log(`  D2: ${item.D2} (actual price)`);
        console.log(
          `  ParentGrp: "${item.ParentGrp}" -> Category: "${mappedCategory}"`,
        );
        console.log(`  Final Price: ${actualPrice}`);
      }

      return {
        productId: String(item.Code),
        name: item.Name,
        barcode: "", // We'll skip barcode for now since Alias column causes issues
        price: actualPrice, // Use D2 as the actual selling price
        mrp: actualPrice, // Use D2 as MRP too (can be adjusted later)
        category: mappedCategory,
        unit: "piece", // Default unit since Unit column causes issues
        inStock: true,
        stock: 0, // TODO: Extract from BUSY stock fields
        description: "", // Empty - can be filled via admin panel
        imageUrl: "", // Empty - can be filled via admin panel
        isFeatured: false, // Default to false
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        source: "BUSY_ERP",
      };
    });

    // Save processed data
    const outputPath = path.join(__dirname, "firebase_ready_products.json");
    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          products: firebaseProducts,
          metadata: {
            totalItems: rawData.itemCount,
            syncTime: new Date().toISOString(),
            method: rawData.method,
          },
        },
        null,
        2,
      ),
    );

    log.success(`✅ Processed data saved to: ${outputPath}`);

    // Cleanup temp file
    fs.unlinkSync(tempJsonPath);

    return firebaseProducts;
  } catch (error) {
    log.error("Product fetch failed");
    log.error(error.message);
    throw error;
  } finally {
    // Cleanup
    try {
      if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Utility functions
 */
function mapCategory(category) {
  const categoryStr = String(category || "").trim();

  // Handle numeric category codes
  const mapping = {
    // Numeric codes from BUSY
    401: "Household",
    402: "Personal Care",
    403: "Beverages",
    404: "Snacks",
    405: "Dairy & Eggs",
    406: "Pantry",

    // Text categories
    General: "Pantry",
    Beverages: "Beverages",
    Snacks: "Snacks",
    "Personal Care": "Personal Care",
    "House Hold": "Household",
    Household: "Household",
    Dairy: "Dairy & Eggs",
  };

  return mapping[categoryStr] || "Pantry";
}

/**
 * Category protection pass.
 *
 * Before uploading, check each product's CURRENT state in Firestore.
 * - If the admin has manually set the category (categoryManuallySet === true)
 *   and BUSY's mapped category is DIFFERENT from what's currently live,
 *   we do NOT overwrite it. Instead we drop `category` from this product's
 *   payload (so the upload's merge:true leaves the live value untouched)
 *   and write the conflict to a `category_sync_queue` collection doc for
 *   an admin to approve/deny in the admin panel.
 * - Otherwise (no manual flag, or BUSY agrees with what's live), category
 *   is left in the payload and syncs normally, same as before.
 *
 * This directly fixes: admin corrects a category in the admin panel ->
 * next sync run used to silently revert it. Now it won't.
 */
async function applyCategoryProtection(products) {
  const firestore = initializeFirebase();
  if (!firestore) {
    log.warn(
      "Firebase not initialized — skipping category protection, syncing categories as-is",
    );
    return products;
  }

  log.info(
    `🛡️  Checking ${products.length} products for manually-set categories...`,
  );

  let queued = 0;
  const protectedProducts = [];

  // Firestore getAll() can take up to 500 refs per call — chunk to be safe
  const chunkSize = 300;
  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    const refs = chunk.map((p) =>
      firestore.collection("products").doc(p.productId),
    );
    const snapshots = refs.length > 0 ? await firestore.getAll(...refs) : [];

    for (let j = 0; j < chunk.length; j++) {
      const product = chunk[j];
      const snap = snapshots[j];
      const existing = snap && snap.exists ? snap.data() : null;

      const isManuallySet = existing?.categoryManuallySet === true;
      const liveCategory = existing?.category;
      const busyCategory = product.category;

      if (isManuallySet && liveCategory && liveCategory !== busyCategory) {
        // Conflict: don't touch category, queue it for admin review
        const { category, ...rest } = product;
        protectedProducts.push(rest);
        await queueCategoryConflict(firestore, {
          productId: product.productId,
          productName: product.name,
          currentCategory: liveCategory,
          busyCategory: busyCategory,
        });
        queued++;
      } else {
        protectedProducts.push(product);
      }
    }
  }

  if (queued > 0) {
    log.warn(
      `🛡️  ${queued} category change(s) held back — waiting for admin review in category_sync_queue`,
    );
  } else {
    log.info(
      "🛡️  No manually-set categories conflict with BUSY — syncing normally",
    );
  }

  return protectedProducts;
}

/**
 * Write (or refresh) a pending conflict doc. Uses a deterministic doc ID
 * per productId so re-running the sync updates the same pending entry
 * instead of creating duplicates every run.
 */
async function queueCategoryConflict(firestore, conflict) {
  const queueRef = firestore
    .collection("category_sync_queue")
    .doc(conflict.productId);
  const existing = await queueRef.get();

  // Don't re-open something the admin already approved/denied this run;
  // only (re)write if it's new or still pending.
  if (existing.exists && existing.data().status !== "pending") {
    return;
  }

  await queueRef.set(
    {
      productId: conflict.productId,
      productName: conflict.productName,
      currentCategory: conflict.currentCategory,
      busyCategory: conflict.busyCategory,
      status: "pending", // 'pending' | 'approved' | 'denied'
      detectedAt: admin.firestore.FieldValue.serverTimestamp(),
      resolvedAt: null,
      resolvedBy: null,
    },
    { merge: true },
  );
}

function mapUnit(unit) {
  const unitStr = String(unit || "").toLowerCase();
  if (unitStr.includes("kg")) return "kg";
  if (unitStr.includes("ltr")) return "liter";
  if (unitStr.includes("ml")) return "ml";
  return "piece";
}

/**
 * Main execution with integrated commands
 */
async function main() {
  try {
    const args = process.argv.slice(2);

    // Handle different commands
    if (args.includes("--analyze-schema")) {
      await analyzeSchemaConsistency();
      return;
    }

    if (args.includes("--test-firebase")) {
      log.info("🧪 Testing Firebase Integration");
      const connectionOk = await testFirebaseConnection();
      if (connectionOk) {
        const count = await getProductCount();
        log.info(`📊 Current products in Firebase: ${count}`);
        log.success("✅ Firebase test completed successfully!");
      }
      return;
    }

    if (args.includes("--dry-run")) {
      log.warn("🏃 DRY RUN MODE - No data will be uploaded to Firebase");
    }

    // Main sync process
    log.info("🚀 Starting Working BUSY Sync...");

    // Test connection
    const totalProducts = await testConnection();

    if (!totalProducts) {
      throw new Error("Database connection failed");
    }

    console.log("\n" + "=".repeat(50));

    // Get sample data
    log.info("📝 Getting sample data...");
    await getSampleData();

    console.log("\n" + "=".repeat(50));

    // Get products
    log.info("💰 Getting products...");
    const products = await getProductsWithPrices();

    // Protect any admin-set categories before upload
    const protectedProducts = await applyCategoryProtection(products);

    // Upload to Firebase (unless dry run)
    const isDryRun = args.includes("--dry-run");
    const uploadSuccess = await uploadToFirebase(protectedProducts, {
      dryRun: isDryRun,
    });

    if (uploadSuccess) {
      log.success(
        `🎉 Sync completed! Processed and uploaded ${protectedProducts.length} products to Firebase`,
      );
      log.info("🔗 Products are now live in your admin panel!");
    } else if (isDryRun) {
      log.info(
        `🏃 Dry run completed! ${protectedProducts.length} products processed (not uploaded)`,
      );
    } else {
      log.warn(
        `⚠️  Sync completed with issues. ${protectedProducts.length} products processed but Firebase upload had problems`,
      );
    }

    log.info("💾 Local backup saved to 'firebase_ready_products.json'");
  } catch (error) {
    log.error(`Sync failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  testConnection,
  getSampleData,
  getProductsWithPrices,
  uploadToFirebase,
  applyCategoryProtection,
  queueCategoryConflict,
  analyzeSchemaConsistency,
  testFirebaseConnection,
  getProductCount,
};
