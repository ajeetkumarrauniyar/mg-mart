/**
 * Seed Product Images Script
 *
 * This script scans all Firestore products and backfills `imageUrl`
 * for any document where the field is missing, empty, or a placeholder.
 *
 * Image sources: Unsplash (free, no-auth required for direct links)
 * Run from apps/server/:  pnpm seed:images
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load .env from apps/server/
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env') });

// ─── Firebase init (standalone, bypass the server's firebase.ts) ──────────────
function initFirebase() {
  if (getApps().length > 0) return getFirestore();

  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY));
  } else {
    // Fall back to local key.json
    const keyPath = join(__dirname, '../key.json');
    const keyJson = JSON.parse(readFileSync(keyPath, 'utf-8'));
    credential = cert(keyJson);
  }

  initializeApp({
    credential,
    projectId: process.env.FIREBASE_PROJECT_ID,
  });

  return getFirestore();
}

// ─── Category-level fallback images ──────────────────────────────────────────
const CATEGORY_IMAGES: Record<string, string> = {
  'Fruits & Vegetables': 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&q=80',
  'Dairy & Eggs':        'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80',
  'Bakery':              'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
  'Meat & Seafood':      'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&q=80',
  'Pantry':              'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80',
  'Beverages':           'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80',
  'Snacks':              'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&q=80',
  'Frozen':              'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=600&q=80',
  'Personal Care':       'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80',
  'Household':           'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80',
};

// ─── Product-name keyword → specific image map ────────────────────────────────
const KEYWORD_IMAGES: Array<{ keywords: string[]; url: string }> = [
  // Fruits & Vegetables
  { keywords: ['apple'],              url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80' },
  { keywords: ['banana'],             url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80' },
  { keywords: ['tomato'],             url: 'https://images.unsplash.com/photo-1546470427-e26264be0b11?w=600&q=80' },
  { keywords: ['potato', 'aloo'],     url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80' },
  { keywords: ['onion', 'pyaz'],      url: 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=600&q=80' },
  { keywords: ['spinach', 'palak'],   url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80' },
  { keywords: ['carrot', 'gajar'],    url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80' },
  { keywords: ['lemon', 'lime'],      url: 'https://images.unsplash.com/photo-1590005354167-6da97870c757?w=600&q=80' },
  { keywords: ['mango', 'aam'],       url: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=80' },
  { keywords: ['capsicum','shimla'],  url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&q=80' },
  { keywords: ['ginger', 'adrak'],    url: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=600&q=80' },
  { keywords: ['garlic', 'lehsun'],   url: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=600&q=80' },
  { keywords: ['broccoli'],           url: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=600&q=80' },
  { keywords: ['cauliflower','gobi'], url: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&q=80' },
  { keywords: ['peas', 'matar'],      url: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600&q=80' },
  { keywords: ['cucumber','kheera'],  url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=80' },
  { keywords: ['coriander','dhania'], url: 'https://images.unsplash.com/photo-1600298882283-72e3f1e8df77?w=600&q=80' },
  { keywords: ['mint', 'pudina'],     url: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=600&q=80' },
  // Dairy & Eggs
  { keywords: ['milk', 'doodh'],      url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80' },
  { keywords: ['paneer'],             url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80' },
  { keywords: ['curd','yogurt','dahi'],url:'https://images.unsplash.com/photo-1488477181212-4fc5cb1b0df3?w=600&q=80' },
  { keywords: ['egg', 'anda'],        url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&q=80' },
  { keywords: ['butter', 'makhan'],   url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&q=80' },
  { keywords: ['cheese'],             url: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=600&q=80' },
  { keywords: ['cream', 'malai'],     url: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600&q=80' },
  // Bakery
  { keywords: ['bread'],              url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80' },
  { keywords: ['cake', 'pastry'],     url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80' },
  { keywords: ['biscuit', 'cookie'],  url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80' },
  // Pantry
  { keywords: ['rice', 'chawal'],     url: 'https://images.unsplash.com/photo-1536304993881-ff86e06c9ebf?w=600&q=80' },
  { keywords: ['dal', 'lentil'],      url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80' },
  { keywords: ['oil', 'tel'],         url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80' },
  { keywords: ['sugar', 'cheeni'],    url: 'https://images.unsplash.com/photo-1584844115436-473887b50011?w=600&q=80' },
  { keywords: ['salt', 'namak'],      url: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=600&q=80' },
  { keywords: ['flour', 'atta','maida'], url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80' },
  { keywords: ['pasta', 'noodle'],    url: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600&q=80' },
  { keywords: ['sauce', 'ketchup'],   url: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=600&q=80' },
  { keywords: ['honey', 'shahad'],    url: 'https://images.unsplash.com/photo-1587049332298-1c42e83937a7?w=600&q=80' },
  // Beverages
  { keywords: ['tea', 'chai'],        url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80' },
  { keywords: ['coffee'],             url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80' },
  { keywords: ['juice'],              url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80' },
  { keywords: ['water', 'paani'],     url: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80' },
  // Snacks
  { keywords: ['chips','wafer'],      url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&q=80' },
  { keywords: ['namkeen','mixture'],  url: 'https://images.unsplash.com/photo-1555897522-47ef1f35e87a?w=600&q=80' },
  { keywords: ['chocolate'],          url: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=600&q=80' },
  { keywords: ['popcorn'],            url: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=600&q=80' },
  // Meat & Seafood
  { keywords: ['chicken','murgh'],    url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&q=80' },
  { keywords: ['fish', 'machli'],     url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=80' },
  { keywords: ['mutton', 'lamb'],     url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&q=80' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isPlaceholder(url: string): boolean {
  if (!url || url.trim() === '') return true;
  if (url.startsWith('data:')) return true;
  if (url.includes('via.placeholder.com')) return true;
  if (url.includes('placeholder')) return true;
  return false;
}

function pickImage(name: string, category: string): string {
  const lower = name.toLowerCase();
  for (const { keywords, url } of KEYWORD_IMAGES) {
    if (keywords.some(kw => lower.includes(kw))) return url;
  }
  return CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES['Pantry'];
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seedImages() {
  console.log('🌿 MG Mart — Product Image Seeder');
  console.log('───────────────────────────────────');

  const db = initFirebase();
  const col = db.collection('products');

  console.log('📦 Fetching products from Firestore...');
  const snapshot = await col.get();
  console.log(`   Found ${snapshot.size} product(s).\n`);

  let updated = 0;
  let skipped = 0;
  const BATCH_SIZE = 400; // Firestore max is 500 writes per batch
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const currentUrl: string = data.imageUrl ?? '';

    if (!isPlaceholder(currentUrl)) {
      skipped++;
      continue;
    }

    const newUrl = pickImage(data.name ?? '', data.category ?? '');
    batch.update(doc.ref, { imageUrl: newUrl });
    batchCount++;
    updated++;
    console.log(`   ✅  ${(data.name ?? '').padEnd(30)} → ${newUrl.slice(42, 90)}…`);

    // Commit when batch is full
    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  // Commit remaining writes
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log('\n───────────────────────────────────');
  if (updated > 0) {
    console.log(`🎉 Done! Updated ${updated} product(s), skipped ${skipped} (already had images).`);
  } else {
    console.log(`✅  All ${skipped} products already have real images — nothing to update.`);
  }
}

seedImages().catch(err => {
  console.error('\n❌  Seed failed:', err.message);
  process.exit(1);
});
