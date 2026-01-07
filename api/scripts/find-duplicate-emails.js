/**
 * Find Duplicate Emails Script
 * Pre-flight check before creating unique email index
 *
 * Usage: node api/scripts/find-duplicate-emails.js
 */

import mongoose from 'mongoose'
import { fileURLToPath, pathToFileURL } from 'url'
import { connectToDatabase } from '../_lib/mongodb.js'

export async function findDuplicateEmails() {
  await connectToDatabase()
  const db = mongoose.connection.db

  // Case-insensitive duplicate detection using $toLower
  const duplicates = await db
    .collection('contacts')
    .aggregate([
      { $match: { email: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: { email: { $toLower: '$email' } },
          count: { $sum: 1 },
          docs: {
            $push: {
              _id: '$_id',
              name: '$name',
              email: '$email',
              createdAt: '$createdAt',
            },
          },
        },
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray()

  console.log('\n📊 Duplicate Email Analysis\n')
  console.log(
    `Total documents: ${await db.collection('contacts').countDocuments()}`
  )

  if (duplicates.length === 0) {
    console.log(
      '✅ No duplicate emails found. Safe to proceed with migration.\n'
    )
    return { safe: true, duplicates: [] }
  }

  console.log(`⚠️ Found ${duplicates.length} duplicate email groups:\n`)

  let totalDuplicateDocs = 0
  duplicates.forEach((dup, i) => {
    totalDuplicateDocs += dup.count
    console.log(`${i + 1}. Email: ${dup._id.email} (${dup.count} occurrences)`)
    dup.docs.forEach(doc => {
      console.log(`   └─ ID: ${doc._id}`)
      console.log(`      Name: ${doc.name}`)
      console.log(`      Created: ${doc.createdAt}`)
    })
    console.log('')
  })

  console.log(
    `\n📌 Summary: ${totalDuplicateDocs} documents with duplicate emails`
  )
  console.log('❌ Cannot create unique index until duplicates are resolved.\n')

  return { safe: false, duplicates }
}

// Run if executed directly
const entryArg = process.argv[1]
const entryArgDefined = typeof entryArg !== 'undefined' && entryArg != null
const isMainModule = entryArgDefined
  ? import.meta.url === pathToFileURL(entryArg).href ||
    fileURLToPath(import.meta.url) === entryArg
  : false

if (isMainModule) {
  findDuplicateEmails()
    .then(result => {
      mongoose.connection.close()
      process.exit(result.safe ? 0 : 1)
    })
    .catch(err => {
      console.error(err)
      mongoose.connection.close()
      process.exit(1)
    })
}
