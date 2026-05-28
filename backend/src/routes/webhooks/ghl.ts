import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { SlackService } from '../../services/slack.service';
import { config } from '../../config';

const router = Router();

const GhlSmsEventSchema = z.object({
  type: z.enum(['InboundMessage', 'OutboundMessage', 'sms', 'SMS']).optional(),
  messageType: z.literal('SMS').optional(),
  direction: z.enum(['inbound', 'outbound']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  body: z.string().optional(),
  message: z.string().optional(),
  contactId: z.string().optional(),
  contact: z
    .object({
      id: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      name: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  dateAdded: z.string().optional(),
  timestamp: z.string().optional(),
  locationId: z.string().optional(),
});

type GhlSmsEvent = z.infer<typeof GhlSmsEventSchema>;

function normalizeGhlEvent(event: GhlSmsEvent): {
  from: string;
  to: string;
  body: string;
  contactName?: string;
  contactId?: string;
  direction: 'inbound' | 'outbound';
  timestamp: string;
} {
  const isInbound =
    event.direction === 'inbound' ||
    event.type === 'InboundMessage' ||
    event.type?.toLowerCase() === 'sms';

  const contactName = event.contact?.name ||
    (event.contact?.firstName && event.contact?.lastName
      ? `${event.contact.firstName} ${event.contact.lastName}`
      : event.contact?.firstName) ||
    undefined;

  return {
    from: event.from || event.contact?.phone || 'Unknown',
    to: event.to || '',
    body: event.body || event.message || '',
    contactName,
    contactId: event.contactId || event.contact?.id,
    direction: isInbound ? 'inbound' : 'outbound',
    timestamp: event.dateAdded || event.timestamp || new Date().toISOString(),
  };
}

router.post('/sms', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-ghl-api-key'] || req.query.apiKey;
    if (config.ghl?.webhookSecret && apiKey !== config.ghl.webhookSecret) {
      console.warn('[GHL Webhook] Invalid API key');
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    console.log('[GHL Webhook] Received SMS event:', JSON.stringify(req.body, null, 2));

    const parsed = GhlSmsEventSchema.safeParse(req.body);
    if (!parsed.success) {
      console.warn('[GHL Webhook] Invalid payload:', parsed.error.errors);
      res.status(400).json({ error: 'Invalid payload', details: parsed.error.errors });
      return;
    }

    const sms = normalizeGhlEvent(parsed.data);

    if (!sms.body) {
      console.log('[GHL Webhook] Empty message body, skipping');
      res.status(200).json({ ok: true, skipped: true });
      return;
    }

    const slackMessage = SlackService.formatSmsNotification(sms);
    const result = await SlackService.postMessage(slackMessage);

    if (result.ok) {
      console.log('[GHL Webhook] Posted to Slack:', result.ts);
      res.status(200).json({ ok: true, slackTs: result.ts });
    } else {
      console.error('[GHL Webhook] Failed to post to Slack:', result.error);
      res.status(500).json({ ok: false, error: result.error });
    }
  } catch (err) {
    next(err);
  }
});

router.post('/call', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('[GHL Webhook] Received call event:', JSON.stringify(req.body, null, 2));
    res.status(200).json({ ok: true, message: 'Call webhook received' });
  } catch (err) {
    next(err);
  }
});

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: 'ghl-webhook',
    slackConfigured: !!(config.slack?.botToken || config.slack?.webhookUrl),
  });
});

export const ghlWebhooksRouter = router;
