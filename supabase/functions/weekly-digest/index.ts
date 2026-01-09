/**
 * Supabase Edge Function: Weekly Digest
 *
 * Sends weekly digest emails to users with digest_enabled = true.
 * Scheduled to run every Sunday at 8am UTC via cron.
 *
 * Required secrets:
 * - RESEND_API_KEY: Resend API key for sending emails
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for bypassing RLS
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Types for database rows
interface UserPreferences {
  user_id: string
  name: string
  digest_enabled: boolean
}

interface Favorite {
  quote_id: string
  saved_at: string
}

interface JournalEntry {
  quote_id: string
  content: string
  updated_at: string
}

interface QuoteHistory {
  quote_id: string
  shown_at: string
}

interface UserEmail {
  id: string
  email: string
}

interface DigestData {
  userName?: string
  favoriteQuote?: {
    text: string
    author: string
    source?: string
  }
  reflectionHighlight?: {
    excerpt: string
    quoteAuthor: string
  }
  weekStats?: {
    quotesViewed: number
    reflectionsWritten: number
    favoritesSaved: number
  }
  unsubscribeUrl: string
  appUrl: string
}

// Quote type (matches the app's quote structure)
interface Quote {
  id: string
  text: string
  author: string
  source?: string
}

// Simple quotes lookup (for Edge Function, we embed a minimal set or fetch from app)
// In production, this would be a shared data source
const QUOTES_API_URL = 'https://quotidian.app/api/quotes'

// Generate digest HTML (simplified version for Edge Function)
function generateDigestHtml(data: DigestData): string {
  const { userName, favoriteQuote, reflectionHighlight, weekStats, unsubscribeUrl, appUrl } = data
  const greeting = userName ? `Hi ${userName},` : 'Hi there,'
  const hasContent = favoriteQuote || reflectionHighlight

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Quotidian Digest</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f5f5f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 20px !important; }
      .quote-text { font-size: 20px !important; }
    }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${favoriteQuote ? `"${favoriteQuote.text.substring(0, 80)}..." — Your weekly wisdom from Quotidian` : 'Your weekly philosophical reflection awaits'}
  </div>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f3;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" class="container" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #fafaf8; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px 40px; text-align: center; border-bottom: 1px solid #e8e8e6;">
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: normal; color: #1a1a1a;">Quotidian</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #666666;">Your Weekly Digest</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 40px 20px 40px;">
              <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 18px; color: #3d3d3d; line-height: 1.6;">${greeting}</p>
              <p style="margin: 16px 0 0 0; font-size: 16px; color: #666666; line-height: 1.6;">
                ${hasContent ? "Here's your weekly dose of philosophical wisdom and reflection." : "A new week brings fresh opportunities for reflection and growth."}
              </p>
            </td>
          </tr>

          ${favoriteQuote ? `
          <!-- Quote of the Week -->
          <tr>
            <td style="padding: 10px 40px 30px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 6px; border: 1px solid #e8e8e6;">
                <tr>
                  <td style="padding: 30px;">
                    <p style="margin: 0 0 16px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999999;">Quote of the Week</p>
                    <p class="quote-text" style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-style: italic; color: #1a1a1a; line-height: 1.7;">"${favoriteQuote.text}"</p>
                    <p style="margin-top: 20px; font-style: normal; font-size: 15px; color: #666666;">
                      — ${favoriteQuote.author}${favoriteQuote.source ? `<br><span style="font-size: 13px; color: #999999;">${favoriteQuote.source}</span>` : ''}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          ${reflectionHighlight ? `
          <!-- Reflection Highlight -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fdfdfb; border-radius: 6px; border-left: 3px solid #d4c4a8;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999999;">Your Reflection</p>
                    <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 16px; font-style: italic; color: #3d3d3d; line-height: 1.6;">"${reflectionHighlight.excerpt}"</p>
                    <p style="margin: 12px 0 0 0; font-size: 13px; color: #999999;">On a quote by ${reflectionHighlight.quoteAuthor}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          ${weekStats ? `
          <!-- Week Stats -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="text-align: center; padding: 16px; background-color: #ffffff; border-radius: 6px; border: 1px solid #e8e8e6;">
                <tr>
                  <td width="33%" style="text-align: center; padding: 10px;">
                    <p style="margin: 0; font-size: 28px; font-weight: bold; color: #1a1a1a;">${weekStats.quotesViewed}</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #999999; text-transform: uppercase;">Quotes</p>
                  </td>
                  <td width="33%" style="text-align: center; padding: 10px; border-left: 1px solid #e8e8e6; border-right: 1px solid #e8e8e6;">
                    <p style="margin: 0; font-size: 28px; font-weight: bold; color: #1a1a1a;">${weekStats.reflectionsWritten}</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #999999; text-transform: uppercase;">Reflections</p>
                  </td>
                  <td width="33%" style="text-align: center; padding: 10px;">
                    <p style="margin: 0; font-size: 28px; font-weight: bold; color: #1a1a1a;">${weekStats.favoritesSaved}</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #999999; text-transform: uppercase;">Favorites</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- CTA Button -->
          <tr>
            <td style="padding: 10px 40px 40px 40px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 6px; background-color: #1a1a1a;">
                    <a href="${appUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 500; color: #ffffff; text-decoration: none; border-radius: 6px;">Continue Your Journey →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f5f5f3; border-top: 1px solid #e8e8e6; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #999999;">You're receiving this because you enabled weekly digests in Quotidian.</p>
              <p style="margin: 0;"><a href="${unsubscribeUrl}" target="_blank" style="font-size: 13px; color: #666666; text-decoration: underline;">Unsubscribe from weekly digest</a></p>
              <p style="margin: 20px 0 0 0; font-size: 12px; color: #cccccc;">© ${new Date().getFullYear()} Quotidian · Daily wisdom for thoughtful living</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

// Generate plain text version
function generateDigestText(data: DigestData): string {
  const { userName, favoriteQuote, reflectionHighlight, weekStats, unsubscribeUrl, appUrl } = data
  const greeting = userName ? `Hi ${userName},` : 'Hi there,'
  const hasContent = favoriteQuote || reflectionHighlight

  let text = `QUOTIDIAN - Your Weekly Digest
================================

${greeting}

${hasContent ? "Here's your weekly dose of philosophical wisdom and reflection." : "A new week brings fresh opportunities for reflection and growth."}

`

  if (favoriteQuote) {
    text += `QUOTE OF THE WEEK
-----------------
"${favoriteQuote.text}"

— ${favoriteQuote.author}${favoriteQuote.source ? ` (${favoriteQuote.source})` : ''}

`
  }

  if (reflectionHighlight) {
    text += `YOUR REFLECTION
---------------
"${reflectionHighlight.excerpt}"

On a quote by ${reflectionHighlight.quoteAuthor}

`
  }

  if (weekStats) {
    text += `THIS WEEK
---------
• ${weekStats.quotesViewed} quotes viewed
• ${weekStats.reflectionsWritten} reflections written
• ${weekStats.favoritesSaved} favorites saved

`
  }

  text += `Continue your journey: ${appUrl}

---

You're receiving this because you enabled weekly digests in Quotidian.
Unsubscribe: ${unsubscribeUrl}

© ${new Date().getFullYear()} Quotidian · Daily wisdom for thoughtful living
`

  return text.trim()
}

// Generate unsubscribe token (simple user_id based for now)
function generateUnsubscribeToken(userId: string): string {
  // In production, use a proper JWT or signed token
  return btoa(userId)
}

// Send email via Resend
async function sendEmail(options: {
  to: string
  subject: string
  html: string
  text: string
  resendApiKey: string
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${options.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Quotidian <digest@quotidian.app>',
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.message || 'Failed to send email' }
    }

    return { success: true, id: data.id }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Fetch quote data by ID (from embedded quotes or API)
// Note: In production, quotes would be in a shared database or API
async function getQuoteById(quoteId: string): Promise<Quote | null> {
  // For the Edge Function, we'll try to fetch from an API endpoint
  // If not available, return a placeholder
  try {
    const response = await fetch(`${QUOTES_API_URL}/${quoteId}`)
    if (response.ok) {
      return await response.json()
    }
  } catch {
    // API not available, continue with null
  }

  // Return null if quote not found - caller should handle this
  return null
}

// Main handler
Deno.serve(async (req: Request) => {
  // Only allow POST requests (from cron or manual trigger)
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Get secrets
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const resendApiKey = Deno.env.get('RESEND_API_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase configuration' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: 'Missing Resend API key' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Create Supabase client with service role (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Calculate week boundaries (last 7 days)
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekAgoISO = weekAgo.toISOString()

  const appUrl = Deno.env.get('APP_URL') || 'https://quotidian.app'

  // Track results
  const results = {
    processed: 0,
    sent: 0,
    failed: 0,
    errors: [] as string[],
  }

  try {
    // 1. Query users with digest_enabled = true
    const { data: usersWithDigest, error: prefsError } = await supabase
      .from('preferences')
      .select('user_id, name, digest_enabled')
      .eq('digest_enabled', true)

    if (prefsError) {
      throw new Error(`Failed to query preferences: ${prefsError.message}`)
    }

    if (!usersWithDigest || usersWithDigest.length === 0) {
      return new Response(JSON.stringify({
        message: 'No users with digest enabled',
        results,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Get email addresses for these users
    const userIds = usersWithDigest.map((u: UserPreferences) => u.user_id)

    // Query auth.users via admin API
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      throw new Error(`Failed to query auth users: ${authError.message}`)
    }

    // Create lookup map of user_id -> email
    const userEmails = new Map<string, string>()
    for (const user of authUsers.users) {
      if (user.email && userIds.includes(user.id)) {
        userEmails.set(user.id, user.email)
      }
    }

    // 3. Process each user
    for (const userPref of usersWithDigest as UserPreferences[]) {
      results.processed++

      const userId = userPref.user_id
      const userEmail = userEmails.get(userId)

      if (!userEmail) {
        results.errors.push(`No email for user ${userId}`)
        results.failed++
        continue
      }

      try {
        // Fetch user's week data in parallel
        const [favoritesResult, journalResult, historyResult] = await Promise.all([
          supabase
            .from('favorites')
            .select('quote_id, saved_at')
            .eq('user_id', userId)
            .gte('saved_at', weekAgoISO)
            .order('saved_at', { ascending: false })
            .limit(10),

          supabase
            .from('journal_entries')
            .select('quote_id, content, updated_at')
            .eq('user_id', userId)
            .gte('updated_at', weekAgoISO)
            .order('updated_at', { ascending: false })
            .limit(10),

          supabase
            .from('quote_history')
            .select('quote_id, shown_at')
            .eq('user_id', userId)
            .gte('shown_at', weekAgoISO),
        ])

        const favorites = (favoritesResult.data || []) as Favorite[]
        const journalEntries = (journalResult.data || []) as JournalEntry[]
        const history = (historyResult.data || []) as QuoteHistory[]

        // Build digest data
        const digestData: DigestData = {
          userName: userPref.name || undefined,
          unsubscribeUrl: `${appUrl}/unsubscribe?token=${generateUnsubscribeToken(userId)}`,
          appUrl,
        }

        // Add favorite quote of the week (most recent)
        if (favorites.length > 0) {
          const favoriteQuote = await getQuoteById(favorites[0].quote_id)
          if (favoriteQuote) {
            digestData.favoriteQuote = {
              text: favoriteQuote.text,
              author: favoriteQuote.author,
              source: favoriteQuote.source,
            }
          }
        }

        // Add reflection highlight (longest or most recent)
        if (journalEntries.length > 0) {
          // Sort by content length to get most substantial reflection
          const sortedByLength = [...journalEntries].sort(
            (a, b) => b.content.length - a.content.length
          )
          const bestReflection = sortedByLength[0]

          // Get author for this reflection's quote
          const reflectionQuote = await getQuoteById(bestReflection.quote_id)
          const excerpt = bestReflection.content.length > 200
            ? bestReflection.content.substring(0, 200) + '...'
            : bestReflection.content

          digestData.reflectionHighlight = {
            excerpt,
            quoteAuthor: reflectionQuote?.author || 'Unknown',
          }
        }

        // Add week stats
        digestData.weekStats = {
          quotesViewed: history.length,
          reflectionsWritten: journalEntries.length,
          favoritesSaved: favorites.length,
        }

        // Generate email content
        const subject = digestData.favoriteQuote
          ? `Your weekly wisdom: "${digestData.favoriteQuote.text.substring(0, 50)}${digestData.favoriteQuote.text.length > 50 ? '...' : ''}"`
          : 'Your Weekly Quotidian Digest'

        const html = generateDigestHtml(digestData)
        const text = generateDigestText(digestData)

        // Send email
        const emailResult = await sendEmail({
          to: userEmail,
          subject,
          html,
          text,
          resendApiKey,
        })

        if (emailResult.success) {
          results.sent++
          console.log(`Sent digest to ${userEmail} (id: ${emailResult.id})`)
        } else {
          results.failed++
          results.errors.push(`Failed to send to ${userEmail}: ${emailResult.error}`)
          console.error(`Failed to send to ${userEmail}: ${emailResult.error}`)
        }
      } catch (userError) {
        results.failed++
        const errorMsg = userError instanceof Error ? userError.message : 'Unknown error'
        results.errors.push(`Error processing user ${userId}: ${errorMsg}`)
        console.error(`Error processing user ${userId}:`, userError)
      }
    }

    return new Response(JSON.stringify({
      message: 'Weekly digest completed',
      results,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Weekly digest failed:', error)

    return new Response(JSON.stringify({
      error: errorMsg,
      results,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
