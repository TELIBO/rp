import { NextResponse } from 'next/server'
const path = require('path')
const fs = require('fs').promises

const DocumentIndexer = require('../../../server/services/documentIndexer')

const documentsPath = path.join(process.cwd(), 'documents-demo')
const indexPath = path.join(process.cwd(), 'index')

export async function GET() {
  try {
    // Get document stats
    const files = await fs.readdir(documentsPath)
    
    const stats = {
      totalDocuments: files.length,
      categories: {},
      fileTypes: {},
      totalSize: 0
    }
    
    for (const file of files) {
      const filePath = path.join(documentsPath, file)
      const fileStat = await fs.stat(filePath)
      const ext = path.extname(file).toLowerCase()
      
      stats.totalSize += fileStat.size
      stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1
    }
    
    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
