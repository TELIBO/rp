import { NextResponse } from 'next/server'
const path = require('path')
const DocumentIndexer = require('../../../server/services/documentIndexer')

const documentsPath = path.join(process.cwd(), 'documents-demo')
const indexPath = path.join(process.cwd(), 'index')
const documentIndexer = new DocumentIndexer(documentsPath, indexPath)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const category = searchParams.get('category')
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    const results = await documentIndexer.search(query, { category })
    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
