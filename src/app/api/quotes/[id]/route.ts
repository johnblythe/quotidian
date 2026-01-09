/**
 * API Route: Get quote by ID
 * GET /api/quotes/[id] - Returns a single quote by ID
 */

import { NextResponse } from 'next/server'
import { getQuoteById } from '@/lib/quotes'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const quote = getQuoteById(id)

  if (!quote) {
    return NextResponse.json(
      { error: 'Quote not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(quote)
}
