/**
 * API Route: Get all quotes
 * GET /api/quotes - Returns all quotes
 */

import { NextResponse } from 'next/server'
import { getAllQuotes } from '@/lib/quotes'

export async function GET() {
  const quotes = getAllQuotes()
  return NextResponse.json(quotes)
}
