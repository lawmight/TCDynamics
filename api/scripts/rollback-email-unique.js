/**
 * Rollback Email Unique Index Script
 * Removes unique email index and optionally recreates non-unique index
 *
 * Usage: node api/scripts/rollback-email-unique.js
 */

import mongoose from 'mongoose'
import { connectToDatabase } from '../_lib/mongodb.js'

async function rollbackEmailUnique() {
  console.log('⏪ Rolling back email unique index...\n')

  await connectToDatabase()
  const db = mongoose.connection.db
  const collection = db.collection('contacts')

  try {
    await collection.dropIndex('email_unique_ci')
    console.log('✓ Dropped unique index: email_unique_ci')

    // Optionally recreate a non-unique index for query performance
    await collection.createIndex(
      { email: 1 },
      { name: 'email_1', background: true }
    )
    console.log('✓ Created non-unique index: email_1')

    console.log('\n🔄 Rollback complete!\n')
  } catch (error) {
    if (error.code === 27) {
      console.log('Index not found, nothing to rollback.')
    } else {
      throw error
    }
  }

  await mongoose.connection.close()
}

rollbackEmailUnique().catch(err => {
  console.error('Rollback failed:', err)
  mongoose.connection.close()
  process.exit(1)
})
