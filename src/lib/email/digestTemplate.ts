/**
 * Weekly Digest Email Template
 *
 * Generates HTML email for the weekly Quotidian digest.
 * Matches app aesthetic: Georgia serif, warm colors, generous whitespace.
 */

export interface DigestData {
  userName?: string;
  favoriteQuote?: {
    text: string;
    author: string;
    source?: string;
  };
  reflectionHighlight?: {
    excerpt: string;
    quoteAuthor: string;
  };
  weekStats?: {
    quotesViewed: number;
    reflectionsWritten: number;
    favoritesSaved: number;
  };
  unsubscribeUrl: string;
  appUrl?: string;
}

/**
 * Generate the HTML for the weekly digest email
 */
export function generateDigestHtml(data: DigestData): string {
  const {
    userName,
    favoriteQuote,
    reflectionHighlight,
    weekStats,
    unsubscribeUrl,
    appUrl = 'https://quotidian.app',
  } = data;

  const greeting = userName ? `Hi ${userName},` : 'Hi there,';
  const hasContent = favoriteQuote || reflectionHighlight;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Weekly Quotidian Digest</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }

    /* Client-specific resets */
    #outlook a { padding: 0; }
    .ReadMsgBody { width: 100%; }
    .ExternalClass { width: 100%; }
    .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }

    /* Mobile styles */
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 20px !important; }
      .quote-text { font-size: 20px !important; line-height: 1.6 !important; }
      .content-padding { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

  <!-- Preheader text (shows in email previews) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${favoriteQuote ? `"${favoriteQuote.text.substring(0, 80)}..." — Your weekly wisdom from Quotidian` : 'Your weekly philosophical reflection awaits'}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <!-- Email wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f3;">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Main container -->
        <table role="presentation" class="container" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #fafaf8; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px 40px; text-align: center; border-bottom: 1px solid #e8e8e6;">
              <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: normal; color: #1a1a1a; letter-spacing: -0.5px;">
                Quotidian
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #666666;">
                Your Weekly Digest
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td class="content-padding" style="padding: 30px 40px 20px 40px;">
              <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 18px; color: #3d3d3d; line-height: 1.6;">
                ${greeting}
              </p>
              <p style="margin: 16px 0 0 0; font-size: 16px; color: #666666; line-height: 1.6;">
                ${hasContent
                  ? "Here's your weekly dose of philosophical wisdom and reflection."
                  : "A new week brings fresh opportunities for reflection and growth."}
              </p>
            </td>
          </tr>

          ${favoriteQuote ? `
          <!-- Quote of the Week -->
          <tr>
            <td class="content-padding" style="padding: 10px 40px 30px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 6px; border: 1px solid #e8e8e6;">
                <tr>
                  <td style="padding: 30px;">
                    <p style="margin: 0 0 16px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999999;">
                      Quote of the Week
                    </p>
                    <blockquote style="margin: 0; padding: 0;">
                      <p class="quote-text" style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-style: italic; color: #1a1a1a; line-height: 1.7;">
                        "${favoriteQuote.text}"
                      </p>
                      <footer style="margin-top: 20px;">
                        <cite style="font-style: normal; font-size: 15px; color: #666666;">
                          — ${favoriteQuote.author}${favoriteQuote.source ? `<br><span style="font-size: 13px; color: #999999;">${favoriteQuote.source}</span>` : ''}
                        </cite>
                      </footer>
                    </blockquote>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          ${reflectionHighlight ? `
          <!-- Reflection Highlight -->
          <tr>
            <td class="content-padding" style="padding: 0 40px 30px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fdfdfb; border-radius: 6px; border-left: 3px solid #d4c4a8;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999999;">
                      Your Reflection
                    </p>
                    <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 16px; font-style: italic; color: #3d3d3d; line-height: 1.6;">
                      "${reflectionHighlight.excerpt}"
                    </p>
                    <p style="margin: 12px 0 0 0; font-size: 13px; color: #999999;">
                      On a quote by ${reflectionHighlight.quoteAuthor}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          ${weekStats ? `
          <!-- Week Stats -->
          <tr>
            <td class="content-padding" style="padding: 0 40px 30px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 16px; background-color: #ffffff; border-radius: 6px; border: 1px solid #e8e8e6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td width="33%" style="text-align: center; padding: 10px;">
                          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #1a1a1a;">${weekStats.quotesViewed}</p>
                          <p style="margin: 4px 0 0 0; font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 0.5px;">Quotes</p>
                        </td>
                        <td width="33%" style="text-align: center; padding: 10px; border-left: 1px solid #e8e8e6; border-right: 1px solid #e8e8e6;">
                          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #1a1a1a;">${weekStats.reflectionsWritten}</p>
                          <p style="margin: 4px 0 0 0; font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 0.5px;">Reflections</p>
                        </td>
                        <td width="33%" style="text-align: center; padding: 10px;">
                          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #1a1a1a;">${weekStats.favoritesSaved}</p>
                          <p style="margin: 4px 0 0 0; font-size: 12px; color: #999999; text-transform: uppercase; letter-spacing: 0.5px;">Favorites</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- CTA Button -->
          <tr>
            <td class="content-padding" style="padding: 10px 40px 40px 40px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 6px; background-color: #1a1a1a;">
                    <a href="${appUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 500; color: #ffffff; text-decoration: none; border-radius: 6px;">
                      Continue Your Journey →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f5f5f3; border-top: 1px solid #e8e8e6; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #999999;">
                You're receiving this because you enabled weekly digests in Quotidian.
              </p>
              <p style="margin: 0;">
                <a href="${unsubscribeUrl}" target="_blank" style="font-size: 13px; color: #666666; text-decoration: underline;">
                  Unsubscribe from weekly digest
                </a>
              </p>
              <p style="margin: 20px 0 0 0; font-size: 12px; color: #cccccc;">
                © ${new Date().getFullYear()} Quotidian · Daily wisdom for thoughtful living
              </p>
            </td>
          </tr>

        </table>
        <!-- End main container -->

      </td>
    </tr>
  </table>

</body>
</html>
`.trim();
}

/**
 * Generate plain text version of the digest email
 */
export function generateDigestText(data: DigestData): string {
  const {
    userName,
    favoriteQuote,
    reflectionHighlight,
    weekStats,
    unsubscribeUrl,
    appUrl = 'https://quotidian.app',
  } = data;

  const greeting = userName ? `Hi ${userName},` : 'Hi there,';
  const hasContent = favoriteQuote || reflectionHighlight;

  let text = `QUOTIDIAN - Your Weekly Digest
================================

${greeting}

${hasContent
  ? "Here's your weekly dose of philosophical wisdom and reflection."
  : "A new week brings fresh opportunities for reflection and growth."}

`;

  if (favoriteQuote) {
    text += `
QUOTE OF THE WEEK
-----------------
"${favoriteQuote.text}"

— ${favoriteQuote.author}${favoriteQuote.source ? ` (${favoriteQuote.source})` : ''}

`;
  }

  if (reflectionHighlight) {
    text += `
YOUR REFLECTION
---------------
"${reflectionHighlight.excerpt}"

On a quote by ${reflectionHighlight.quoteAuthor}

`;
  }

  if (weekStats) {
    text += `
THIS WEEK
---------
• ${weekStats.quotesViewed} quotes viewed
• ${weekStats.reflectionsWritten} reflections written
• ${weekStats.favoritesSaved} favorites saved

`;
  }

  text += `
Continue your journey: ${appUrl}

---

You're receiving this because you enabled weekly digests in Quotidian.
Unsubscribe: ${unsubscribeUrl}

© ${new Date().getFullYear()} Quotidian · Daily wisdom for thoughtful living
`;

  return text.trim();
}

/**
 * Generate both HTML and text versions of the digest email
 */
export function generateDigestEmail(data: DigestData): { html: string; text: string; subject: string } {
  return {
    html: generateDigestHtml(data),
    text: generateDigestText(data),
    subject: data.favoriteQuote
      ? `Your weekly wisdom: "${data.favoriteQuote.text.substring(0, 50)}${data.favoriteQuote.text.length > 50 ? '...' : ''}"`
      : 'Your Weekly Quotidian Digest',
  };
}
