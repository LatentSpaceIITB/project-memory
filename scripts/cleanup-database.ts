/**
 * Cleanup Script - Deletes all memories from Firestore and Firebase Storage
 * Run with: npx tsx scripts/cleanup-database.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getStorage, ref, listAll, deleteObject } from 'firebase/storage';

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

async function cleanupFirestore() {
  console.log('🗑️  Cleaning up Firestore...');

  const memoriesRef = collection(db, 'memories');
  const snapshot = await getDocs(memoriesRef);

  console.log(`   Found ${snapshot.size} memory documents`);

  for (const docSnapshot of snapshot.docs) {
    await deleteDoc(doc(db, 'memories', docSnapshot.id));
    console.log(`   ✓ Deleted memory document: ${docSnapshot.id}`);
  }

  console.log('✅ Firestore cleanup complete!\n');
}

async function cleanupStorage() {
  console.log('🗑️  Cleaning up Firebase Storage...');

  const memoriesRef = ref(storage, 'memories');

  try {
    const listResult = await listAll(memoriesRef);

    console.log(`   Found ${listResult.prefixes.length} memory folders`);

    for (const folderRef of listResult.prefixes) {
      // List all files in each memory folder
      const filesResult = await listAll(folderRef);

      console.log(`   📁 ${folderRef.name}: ${filesResult.items.length} files`);

      for (const fileRef of filesResult.items) {
        await deleteObject(fileRef);
        console.log(`      ✓ Deleted: ${fileRef.name}`);
      }
    }

    // Delete any files directly in memories/ (shouldn't be any, but just in case)
    for (const fileRef of listResult.items) {
      await deleteObject(fileRef);
      console.log(`   ✓ Deleted root file: ${fileRef.name}`);
    }

    console.log('✅ Storage cleanup complete!\n');
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      console.log('   No files found in storage (already clean)\n');
    } else {
      throw error;
    }
  }
}

async function main() {
  console.log('\n🧹 Starting Firebase cleanup...\n');
  console.log('⚠️  WARNING: This will delete ALL memories from your database!\n');

  try {
    await cleanupFirestore();
    await cleanupStorage();

    console.log('✅ Cleanup complete! Your database is now fresh and clean.');
    console.log('   You can now start testing from scratch.\n');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

main();
