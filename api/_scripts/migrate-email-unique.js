/**
 * Email Unique Index Migration Script
 * Zero-downtime migration to create unique email index with case-insensitive collation
 *
 * Usage: node api/_scripts/migrate-email-unique.js
 */

import mongoose from 'mongoose'
import { connectToDatabase } from '../_lib/mongodb.js'

async function migrateEmailUnique() {
  console.log('🚀 Starting email unique index migration...\n')

  await connectToDatabase()
  const db = mongoose.connection.db
  const collection = db.collection('contacts')

  // ═══════════════════════════════════════════════════════════
  // STEP 1: Pre-flight duplicate check
  // ═══════════════════════════════════════════════════════════
  console.log('🔍 Step 1: Checking for duplicate emails...')

  const duplicates = await collection
    .aggregate([
      { $match: { email: { $exists: true, $ne: null } } },
      { $group: { _id: { $toLower: '$email' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray()

  if (duplicates.length > 0) {
    console.error(
      `\n❌ Cannot proceed: Found ${duplicates.length} duplicate email groups.`
    )
    console.error('Run first: node api/_scripts/find-duplicate-emails.js')
    await mongoose.connection.close()
    process.exit(1)
  }
  console.log('   ✓ No duplicates found\n')

  // ═══════════════════════════════════════════════════════════
  // STEP 2: Get current index state
  // ═══════════════════════════════════════════════════════════
  console.log('📊 Step 2: Analyzing current indexes...')
  const indexes = await collection.indexes()
  const emailIndexes = indexes.filter(i => i.key?.email)

  console.log('   Current email-related indexes:')
  if (emailIndexes.length === 0) {
    console.log('   └─ None found')
  } else {
    emailIndexes.forEach(idx => {
      console.log(`   └─ ${idx.name} (unique: ${idx.unique || false})`)
    })
  }
  console.log('')

  // ═══════════════════════════════════════════════════════════
  // STEP 3: Drop old email index if exists (non-unique)
  // ═══════════════════════════════════════════════════════════
  console.log('🗑️ Step 3: Removing old non-unique email index (if exists)...')

  for (const idx of emailIndexes) {
    if (!idx.unique && idx.name !== '_id_' && idx.name !== 'email_unique_ci') {
      try {
        await collection.dropIndex(idx.name)
        console.log(`   ✓ Dropped index: ${idx.name}`)
      } catch (e) {
        console.log(`   ⚠ Could not drop ${idx.name}: ${e.message}`)
      }
    }
  }
  console.log('')

  // ═══════════════════════════════════════════════════════════
  // STEP 4: Create unique index with case-insensitive collation
  // ═══════════════════════════════════════════════════════════
  console.log('✨ Step 4: Creating unique email index (background mode)...')
  console.log('   This may take a while for large collections...\n')

  try {
    await collection.createIndex(
      { email: 1 },
      {
        unique: true,
        name: 'email_unique_ci',
        background: true, // Zero-downtime: allows reads/writes during creation
        collation: { locale: 'fr', strength: 2 }, // Case-insensitive (French locale)
      }
    )
    console.log('   ✓ Index created successfully\n')
  } catch (error) {
    if (error.code === 11000) {
      console.error(
        '   ❌ Failed: Duplicate emails detected during index creation'
      )
      console.error('   Run: node api/_scripts/find-duplicate-emails.js')
      await mongoose.connection.close()
      process.exit(1)
    }
    throw error
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 5: Verification
  // ═══════════════════════════════════════════════════════════
  console.log('✅ Step 5: Verifying migration...')

  const newIndexes = await collection.indexes()
  const uniqueIndex = newIndexes.find(i => i.name === 'email_unique_ci')

  if (uniqueIndex?.unique) {
    console.log('   ✓ Unique index verified')
    console.log(`   └─ Name: ${uniqueIndex.name}`)
    console.log(`   └─ Unique: ${uniqueIndex.unique}`)
    console.log(
      `   └─ Collation: ${JSON.stringify(uniqueIndex.collation || 'none')}`
    )
    console.log('\n🎉 Migration complete!\n')
  } else {
    console.error('   ❌ Verification failed: Unique index not found')
    await mongoose.connection.close()
    process.exit(1)
  }

  await mongoose.connection.close()
}

// Run if executed directly
migrateEmailUnique()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Migration failed:', err)
    mongoose.connection.close()
    process.exit(1)
  })
