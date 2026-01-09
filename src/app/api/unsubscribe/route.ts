/**
 * API Route: Unsubscribe from digest emails
 * POST /api/unsubscribe - Validates token and disables digest
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decodeUnsubscribeToken, isValidUnsubscribeToken } from '@/lib/unsubscribe';

export async function POST(request: NextRequest) {
  // Get token from request body
  let token: string;
  try {
    const body = await request.json();
    token = body.token;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }

  if (!token || typeof token !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Missing token' },
      { status: 400 }
    );
  }

  // Validate token format
  if (!isValidUnsubscribeToken(token)) {
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 400 }
    );
  }

  // Decode user ID from token
  const userId = decodeUnsubscribeToken(token);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Invalid token' },
      { status: 400 }
    );
  }

  // Check Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { success: false, error: 'Service not configured' },
      { status: 500 }
    );
  }

  // Create Supabase client with service role (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Update preferences to disable digest
  const { error } = await supabase
    .from('preferences')
    .update({ digest_enabled: false })
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to unsubscribe:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
