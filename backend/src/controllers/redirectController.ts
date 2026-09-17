import { Request, Response } from 'express';
import { LinkService } from '../services/linkService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const handleRedirect = asyncHandler(async (req: Request, res: Response) => {
  const { shortCode } = req.params;

  if (!shortCode || shortCode.trim() === '') {
    res.status(404).send('Invalid short link code');
    return;
  }

  // 1. Indexed lookup
  const link = await LinkService.findLinkForRedirect(shortCode.trim());

  // 2. Check existence & active status
  if (!link || !link.isActive) {
    res.status(404).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Link Not Found | Linkora</title>
        <style>
          body { background-color: #090d16; color: #f8fafc; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
          .card { background: #0f172a; border: 1px solid #1e293b; padding: 2.5rem; border-radius: 1rem; text-align: center; max-w: 420px; shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
          h1 { color: #40E07B; font-size: 1.75rem; margin-top: 0; }
          p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; }
          a { display: inline-block; margin-top: 1.5rem; background: #40E07B; color: #0a0e17; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Link Not Available</h1>
          <p>The short link <strong>/r/${shortCode}</strong> does not exist or has been deactivated by its owner.</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}">Go to Linkora Home</a>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // 3. Extract request telemetry info
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'];
  const referrer = req.headers['referer'] || req.headers['referrer'] as string;

  // 4. Asynchronous, non-blocking click event logging!
  LinkService.recordClickAsync(link, clientIp, userAgent, referrer);

  // 5. Instant HTTP 302 redirect
  res.redirect(302, link.originalUrl);
});
