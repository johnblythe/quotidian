/**
 * Share card generator for Quotidian
 * Creates social preview images with quotes using HTML5 Canvas
 */

import type { Quote } from '@/types';

/** Canvas dimensions for social preview (1200x630 is standard OG image size) */
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 630;

/** Color palette matching app aesthetic */
const COLORS = {
  background: '#fafaf8',
  text: '#1a1a1a',
  author: '#666666',
  branding: '#999999',
};

/** Font settings */
const FONTS = {
  quote: 'Georgia, "Times New Roman", serif',
  author: 'Georgia, "Times New Roman", serif',
  branding: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

/**
 * Wrap text to fit within a maximum width
 * Returns array of lines
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Calculate optimal font size for quote text to fit in available space
 */
function calculateFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  minSize: number = 24,
  maxSize: number = 48
): number {
  let fontSize = maxSize;

  while (fontSize >= minSize) {
    ctx.font = `italic ${fontSize}px ${FONTS.quote}`;
    const lines = wrapText(ctx, text, maxWidth);
    const lineHeight = fontSize * 1.4;
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= maxHeight && lines.length <= 8) {
      return fontSize;
    }

    fontSize -= 2;
  }

  return minSize;
}

/**
 * Generate a share card image for a quote
 * @param quote - The quote to render
 * @returns Promise<Blob> - PNG image blob
 */
export async function generateShareCard(quote: Quote): Promise<Blob> {
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Layout constants
  const padding = 80;
  const maxTextWidth = CANVAS_WIDTH - padding * 2;
  const quoteAreaTop = 100;
  const quoteAreaHeight = 360;
  const authorY = 500;
  const brandingY = 580;

  // Calculate and set quote font size
  const fontSize = calculateFontSize(
    ctx,
    quote.text,
    maxTextWidth,
    quoteAreaHeight
  );
  ctx.font = `italic ${fontSize}px ${FONTS.quote}`;
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = 'center';

  // Draw quote text with wrapping
  const lines = wrapText(ctx, `"${quote.text}"`, maxTextWidth);
  const lineHeight = fontSize * 1.4;
  const totalTextHeight = lines.length * lineHeight;
  const startY = quoteAreaTop + (quoteAreaHeight - totalTextHeight) / 2 + fontSize;

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], CANVAS_WIDTH / 2, startY + i * lineHeight);
  }

  // Draw author attribution
  ctx.font = `400 24px ${FONTS.author}`;
  ctx.fillStyle = COLORS.author;
  ctx.fillText(`— ${quote.author}`, CANVAS_WIDTH / 2, authorY);

  // Draw source if available
  if (quote.source) {
    ctx.font = `italic 18px ${FONTS.author}`;
    ctx.fillStyle = COLORS.author;
    ctx.fillText(quote.source, CANVAS_WIDTH / 2, authorY + 30);
  }

  // Draw branding
  ctx.font = `300 16px ${FONTS.branding}`;
  ctx.fillStyle = COLORS.branding;
  ctx.fillText('quotidian.app', CANVAS_WIDTH / 2, brandingY);

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Generate share card and return as data URL
 * Useful for preview display
 */
export async function generateShareCardDataUrl(quote: Quote): Promise<string> {
  const blob = await generateShareCard(quote);
  return URL.createObjectURL(blob);
}
