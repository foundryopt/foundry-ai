import { Router } from 'express';
import { ghlWebhooksRouter } from './ghl';

export const webhooksRouter = Router();

webhooksRouter.use('/ghl', ghlWebhooksRouter);
