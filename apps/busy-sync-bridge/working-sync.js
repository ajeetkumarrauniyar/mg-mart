const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { uploadProductsToFirestore, testFirebaseConnection, getProductCount } = require('./firebase-config');

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

        // Upload products
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
async function getProductsWithPrices() {
    log.info("Getting products with price discovery...");
    
    // Use the exact same pattern that worked for sample data
    const productsScriptContent = `
try {
    $conn = New-Object System.Data.OleDb.OleDbConnection("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${dbPath};Jet OLEDB:Database Password=${dbPw};Mode=Read;")
    $conn.Open()
    
    # Use the same simple pattern that worked for sample data
    $cmd = New-Object System.Data.OleDb.OleDbCommand("SELECT Name, Code, D1, D2, D3, ParentGrp FROM Master1 WHERE MasterType = 6 ORDER BY Code", $conn)
    $reader = $cmd.ExecuteReader()
    
    $items = @()
    $rowCount = 0
    
    while ($reader.Read()) {
        $rowCount++
        
        $item = @{
            Name = if ($reader["Name"] -eq [DBNull]::Value) { "Unknown Product" } else { $reader["Name"].ToString().Trim() }
            Code = if ($reader["Code"] -eq [DBNull]::Value) { "UNKNOWN_$rowCount" } else { $reader["Code"].ToString().Trim() }
            D1 = if ($reader["D1"] -eq [DBNull]::Value) { 0 } else { try { [double]$reader["D1"] } catch { 0 } }
            D2 = if ($reader["D2"] -eq [DBNull]::Value) { 0 } else { try { [double]$reader["D2"] } catch { 0 } }
            D3 = if ($reader["D3"] -eq [DBNull]::Value) { 0 } else { try { [double]$reader["D3"] } catch { 0 } }
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
    
    const scriptPath = path.join(__dirname, 'get_products.ps1');
    
    try {
        fs.writeFileSync(scriptPath, productsScriptContent, 'utf8');
        
        const result = execSync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, { 
            encoding: 'utf8',
            timeout: 60000
        });
        
        if (!fs.existsSync(tempJsonPath)) {
            throw new Error("JSON file not created by PowerShell script");
        }
        
        // Read the JSON file and handle BOM issues
        let jsonContent = fs.readFileSync(tempJsonPath, 'utf8');
        
        // Remove BOM if present
        if (jsonContent.charCodeAt(0) === 0xFEFF) {
            jsonContent = jsonContent.slice(1);
        }
        
        // Clean up any extra characters
        jsonContent = jsonContent.trim();
        
        const rawData = JSON.parse(jsonContent);
        log.success(`Retrieved ${rawData.itemCount} products using ${rawData.method}`);
        
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
                console.log(`  ParentGrp: "${item.ParentGrp}" -> Category: "${mappedCategory}"`);
                console.log(`  Final Price: ${actualPrice}`);
            }
            
            return {
                productId: String(item.Code),
                name: item.Name,
                barcode: "", // We'll skip barcode for now since Alias column causes issues
                price: actualPrice, // Use D2 as the actual selling price
                mrp: actualPrice,   // Use D2 as MRP too (can be adjusted later)
                category: mappedCategory,
                unit: "piece", // Default unit since Unit column causes issues
                inStock: true,
                lastUpdated: new Date().toISOString(),
                source: 'BUSY_ERP'
            };
        });
        
        // Save processed data
        const outputPath = path.join(__dirname, 'firebase_ready_products.json');
        fs.writeFileSync(outputPath, JSON.stringify({
            products: firebaseProducts,
            metadata: {
                totalItems: rawData.itemCount,
                syncTime: new Date().toISOString(),
                method: rawData.method
            }
        }, null, 2));
        
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
        '401': 'Household',
        '402': 'Personal Care', 
        '403': 'Beverages',
        '404': 'Snacks',
        '405': 'Dairy & Eggs',
        '406': 'Pantry',
        
        // Text categories
        'General': 'Pantry',
        'Beverages': 'Beverages',
        'Snacks': 'Snacks',
        'Personal Care': 'Personal Care',
        'House Hold': 'Household',
        'Household': 'Household',
        'Dairy': 'Dairy & Eggs'
    };
    
    return mapping[categoryStr] || 'Pantry';
}

function mapUnit(unit) {
    const unitStr = String(unit || "").toLowerCase();
    if (unitStr.includes('kg')) return 'kg';
    if (unitStr.includes('ltr')) return 'liter';
    if (unitStr.includes('ml')) return 'ml';
    return 'piece';
}

/**
 * Main execution
 */
async function main() {
    try {
        log.info("🚀 Starting Working BUSY Sync...");
        
        // Test connection
        const totalProducts = await testConnection();
        
        if (!totalProducts) {
            throw new Error("Database connection failed");
        }
        
        console.log('\n' + '='.repeat(50));
        
        // Get sample data
        log.info("📝 Getting sample data...");
        await getSampleData();
        
        console.log('\n' + '='.repeat(50));
        
        // Get products
        log.info("💰 Getting products...");
        const products = await getProductsWithPrices();
        
        // Upload to Firebase
        const uploadSuccess = await uploadToFirebase(products, { dryRun: false });
        
        if (uploadSuccess) {
            log.success(`🎉 Sync completed! Processed and uploaded ${products.length} products to Firebase`);
            log.info("🔗 Products are now live in your admin panel!");
        } else {
            log.warn(`⚠️  Sync completed with issues. ${products.length} products processed but Firebase upload had problems`);
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

module.exports = { testConnection, getSampleData, getProductsWithPrices, uploadToFirebase };