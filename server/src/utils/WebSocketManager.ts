import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import { Logger } from './Logger';
import { randomUUID } from 'crypto';

interface ClientInfo {
  ws: WebSocket;
  firstName: string;
  lastName: string;
  photoData: string;
  additionalPhotoData?: string[];
}

interface GroupRequest {
  id: string;
  creatorId: string;
  creatorName: string;
  ageRange: { min: number; max: number };
  distance: number;
  groupSize: number;
  chatTime: number;
  createdAt: Date;
}

interface ActiveGroup {
  id: string;
  members: {
    clientId: string;
    firstName: string;
    lastName: string;
  }[];
  chatTime: number;
  createdAt: Date;
}

interface GroupFormationResult {
  success: boolean;
  error?: string;
  groupId?: string;
}

interface DisbandGroupResult {
  success: boolean;
  error?: string;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, ClientInfo>;
  private groupRequests: Map<string, GroupRequest>;
  private clientToGroup: Map<string, string>; // Maps clientId to groupId
  private activeGroups: Map<string, ActiveGroup>;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Map();
    this.groupRequests = new Map();
    this.clientToGroup = new Map();
    this.activeGroups = new Map();
    this.init();
  }

  private init() {
    this.wss.on('connection', (ws: WebSocket) => {
      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          switch (data.type) {
            case 'register':
              if (data.clientId) {
                this.handleClientRegistration(
                  ws,
                  data.clientId,
                  data.firstName,
                  data.lastName,
                  data.photoData,
                  data.additionalPhotoData
                );
              }
              break;

            case 'create_group':
              if (data.clientId) {
                this.handleGroupCreation(
                  data.clientId,
                  data.ageRange,
                  data.distance,
                  data.groupSize,
                  data.chatTime
                );
              }
              break;

            case 'cancel_group':
              if (data.groupId) {
                this.handleGroupCancellation(data.groupId, data.clientId);
              }
              break;
          }
        } catch (error) {
          Logger.logError('WebSocket message handling', error);
        }
      });

      ws.on('close', () => {
        // Find and remove the client
        for (const [clientId, clientInfo] of this.clients.entries()) {
          if (clientInfo.ws === ws) {
            // Remove any group requests created by this client
            const groupId = this.clientToGroup.get(clientId);
            if (groupId) {
              this.groupRequests.delete(groupId);
              this.clientToGroup.delete(clientId);
            }

            this.clients.delete(clientId);
            Logger.logEvent('Client disconnected', { clientId });
            Logger.logWebSocketPool(this.clients, this.groupRequests, this.clientToGroup, this.activeGroups);
            break;
          }
        }
      });

      ws.on('error', (error) => {
        Logger.logError('WebSocket connection', error);
      });
    });
  }

  private handleClientRegistration(
    ws: WebSocket,
    clientId: string,
    firstName: string,
    lastName: string,
    photoData: string,
    additionalPhotoData?: string[]
  ) {
    // If client already exists, close the old connection
    const existingClient = this.clients.get(clientId);
    if (existingClient) {
      existingClient.ws.close();
      this.clients.delete(clientId);
    }

    // Register the new connection with all client information
    this.clients.set(clientId, {
      ws,
      firstName,
      lastName,
      photoData,
      additionalPhotoData
    });
    Logger.logEvent('Client registered', { clientId, firstName, lastName });
    Logger.logWebSocketPool(this.clients, this.groupRequests, this.clientToGroup, this.activeGroups);

    // Send confirmation to client
    ws.send(JSON.stringify({ type: 'registered', clientId }));
  }

  private handleGroupCreation(
    clientId: string,
    ageRange: { min: number; max: number },
    distance: number,
    groupSize: number,
    chatTime: number
  ) {
    const client = this.clients.get(clientId);
    if (!client) {
      return;
    }

    // Check if client already has a group request
    const existingGroupId = this.clientToGroup.get(clientId);
    if (existingGroupId) {
      // Remove the existing group request
      this.groupRequests.delete(existingGroupId);
      Logger.logEvent('Previous group request removed', { 
        clientId, 
        previousGroupId: existingGroupId 
      });
    }

    // Create new group request
    const groupId = randomUUID();
    const groupRequest: GroupRequest = {
      id: groupId,
      creatorId: clientId,
      creatorName: `${client.firstName} ${client.lastName}`,
      ageRange,
      distance,
      groupSize,
      chatTime,
      createdAt: new Date()
    };

    // Update mappings
    this.groupRequests.set(groupId, groupRequest);
    this.clientToGroup.set(clientId, groupId);

    Logger.logEvent('Group request created', { 
      groupId,
      ...groupRequest,
      replacedGroupId: existingGroupId 
    });
    Logger.logWebSocketPool(this.clients, this.groupRequests, this.clientToGroup, this.activeGroups);

    // Send confirmation to creator
    client.ws.send(JSON.stringify({
      type: 'group_created',
      groupId,
      request: groupRequest
    }));
  }

  private handleGroupCancellation(groupId: string, clientId: string) {
    const groupRequest = this.groupRequests.get(groupId);
    if (!groupRequest || groupRequest.creatorId !== clientId) {
      return;
    }

    this.groupRequests.delete(groupId);
    this.clientToGroup.delete(clientId);
    
    Logger.logEvent('Group request cancelled', { groupId, clientId });
    Logger.logWebSocketPool(this.clients, this.groupRequests, this.clientToGroup, this.activeGroups);

    // Send confirmation to creator
    const client = this.clients.get(clientId);
    if (client) {
      client.ws.send(JSON.stringify({
        type: 'group_cancelled',
        groupId
      }));
    }
  }

  public broadcast(message: any, excludeClientId?: string) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach((clientInfo, clientId) => {
      if (clientInfo.ws.readyState === WebSocket.OPEN && clientId !== excludeClientId) {
        clientInfo.ws.send(messageStr);
      }
    });
  }

  public sendToClient(clientId: string, message: any) {
    const clientInfo = this.clients.get(clientId);
    if (clientInfo && clientInfo.ws.readyState === WebSocket.OPEN) {
      clientInfo.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  public formGroup(groupRequestIds: string[], clientIds: string[], chatTime: number): GroupFormationResult {
    // Validate all group requests exist
    for (const groupId of groupRequestIds) {
      if (!this.groupRequests.has(groupId)) {
        return {
          success: false,
          error: `Group request ${groupId} not found`
        };
      }
    }

    // Validate all clients exist
    const groupMembers: ClientInfo[] = [];
    for (const clientId of clientIds) {
      const client = this.clients.get(clientId);
      if (!client) {
        return {
          success: false,
          error: `Client ${clientId} not found`
        };
      }
      groupMembers.push(client);
    }

    // Generate new group ID
    const groupId = randomUUID();

    // Create active group
    const activeGroup: ActiveGroup = {
      id: groupId,
      members: clientIds.map(clientId => {
        const client = this.clients.get(clientId)!;
        return {
          clientId,
          firstName: client.firstName,
          lastName: client.lastName
        };
      }),
      chatTime,
      createdAt: new Date()
    };

    // Remove group requests and update mappings
    for (const requestId of groupRequestIds) {
      const request = this.groupRequests.get(requestId)!;
      this.groupRequests.delete(requestId);
      this.clientToGroup.delete(request.creatorId);
    }

    // Add new active group
    this.activeGroups.set(groupId, activeGroup);

    // Prepare member info for sharing
    const memberInfo = groupMembers.map(member => ({
      firstName: member.firstName,
      lastName: member.lastName,
      photoData: member.photoData,
      additionalPhotoData: member.additionalPhotoData
    }));

    // Send group formation message to all members
    const message = {
      type: 'group_formed',
      groupId,
      chatTime,
      members: memberInfo
    };

    for (const client of groupMembers) {
      client.ws.send(JSON.stringify(message));
    }

    Logger.logEvent('Group formed', {
      groupId,
      groupRequestIds,
      clientIds,
      chatTime,
      memberCount: groupMembers.length
    });
    Logger.logWebSocketPool(this.clients, this.groupRequests, this.clientToGroup, this.activeGroups);

    return { success: true, groupId };
  }

  public disbandGroup(groupId: string): DisbandGroupResult {
    const group = this.activeGroups.get(groupId);
    if (!group) {
      return {
        success: false,
        error: `Group ${groupId} not found`
      };
    }

    // Send disband message to all group members
    const message = {
      type: 'group_disbanded',
      groupId
    };

    for (const member of group.members) {
      const client = this.clients.get(member.clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    }

    // Remove group from active groups
    this.activeGroups.delete(groupId);

    Logger.logEvent('Group disbanded', {
      groupId,
      members: group.members.map(m => `${m.firstName} ${m.lastName}`).join(', ')
    });
    Logger.logWebSocketPool(this.clients, this.groupRequests, this.clientToGroup, this.activeGroups);

    return { success: true };
  }
} 