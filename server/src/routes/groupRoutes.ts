import { Router, Request, Response } from 'express';
import { WebSocketManager } from '../utils/WebSocketManager';
import { Logger } from '../utils/Logger';

interface FormGroupRequest {
  groupRequestIds: string[];
  clientIds: string[];
  chatTime: number;
}

interface DisbandGroupRequest {
  groupId: string;
}

export const createGroupRouter = (wsManager: WebSocketManager) => {
  const router = Router();

  router.post('/form-group', async (req: Request, res: Response) => {
    try {
      const { groupRequestIds, clientIds, chatTime }: FormGroupRequest = req.body;

      if (!clientIds?.length) {
        return res.status(400).json({
          error: 'clientIds is required and must not be empty'
        });
      }

      if (typeof chatTime !== 'number' || chatTime < 1) {
        return res.status(400).json({
          error: 'chatTime must be a positive number'
        });
      }

      const result = wsManager.formGroup(groupRequestIds, clientIds, chatTime);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        message: 'Group formed successfully',
        groupId: result.groupId,
        groupRequestIds,
        clientIds,
        chatTime
      });
    } catch (error) {
      Logger.logError('Form group request', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/disband-group', async (req: Request, res: Response) => {
    try {
      const { groupId }: DisbandGroupRequest = req.body;

      if (!groupId) {
        return res.status(400).json({
          error: 'groupId is required'
        });
      }

      const result = wsManager.disbandGroup(groupId);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        message: 'Group disbanded successfully',
        groupId
      });
    } catch (error) {
      Logger.logError('Disband group request', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}; 