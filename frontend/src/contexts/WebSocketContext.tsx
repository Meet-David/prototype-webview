import React, { createContext, useContext, useRef, useState } from 'react';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface WebSocketContextType {
  status: ConnectionStatus;
  connect: (
    clientId: string,
    firstName: string,
    lastName: string,
    photoData: string,
    additionalPhotoData?: string[]
  ) => void;
  createGroup: (
    clientId: string,
    ageRange: { min: number; max: number },
    distance: number,
    groupSize: number,
    chatTime: number
  ) => void;
  cancelGroup: (groupId: string, clientId: string) => void;
  onGroupFormed: (callback: (members: Member[], groupId: string, chatTime: number) => void) => void;
  onGroupDisbanded: (callback: (groupId: string) => void) => void;
}

interface Member {
  firstName: string;
  lastName: string;
  photoData: string;
  additionalPhotoData?: string[];
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const ws = useRef<WebSocket | null>(null);
  const retryCount = useRef(0);
  const clientIdRef = useRef<string | null>(null);
  const firstNameRef = useRef<string | null>(null);
  const lastNameRef = useRef<string | null>(null);
  const photoDataRef = useRef<string | null>(null);
  const additionalPhotoDataRef = useRef<string[] | undefined>(undefined);
  const groupFormedCallbackRef = useRef<((members: Member[], groupId: string, chatTime: number) => void) | null>(null);
  const groupDisbandedCallbackRef = useRef<((groupId: string) => void) | null>(null);

  const cleanup = () => {
    console.log('🧹 Cleanup: Closing WebSocket connection');
    if (ws.current) {
      ws.current.close();
      ws.current = null;
      console.log('WebSocket connection closed');
    }
    setStatus('disconnected');
  };

  const connect = (
    clientId: string,
    firstName: string,
    lastName: string,
    photoData: string,
    additionalPhotoData?: string[]
  ) => {
    if (status !== 'disconnected') {
      console.log('⚠️ Connection attempt skipped - already connecting/connected');
      return;
    }
    console.log('🔌 Connect requested:', {
      clientId,
      firstName,
      lastName,
      photoData: 'base64_data',
      additionalPhotoData: additionalPhotoData?.length || 0,
      currentStatus: status
    });

    cleanup();
    clientIdRef.current = clientId;
    firstNameRef.current = firstName;
    lastNameRef.current = lastName;
    photoDataRef.current = photoData;
    additionalPhotoDataRef.current = additionalPhotoData;
    retryCount.current = 0;
    console.log('🔄 Starting connection attempt');
    attemptConnection();
  };

  const attemptConnection = () => {
    console.log(`🔄 Attempting connection: ${retryCount.current + 1} of ${MAX_RETRIES}`);
    if (retryCount.current >= MAX_RETRIES) {
      console.log('❌ Max retry attempts reached');
      setStatus('disconnected');
      return;
    }

    setStatus('connecting');
    const wsUrl = import.meta.env.VITE_WS_URL;
    console.log('🌐 Connecting to WebSocket URL:', wsUrl);
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('✅ WebSocket connection opened');
      if (ws.current && clientIdRef.current && photoDataRef.current) {
        const message = {
          type: 'register',
          clientId: clientIdRef.current,
          firstName: firstNameRef.current,
          lastName: lastNameRef.current,
          photoData: photoDataRef.current,
          additionalPhotoData: additionalPhotoDataRef.current
        };
        console.log('📤 Sending registration message:', {
          ...message,
          photoData: 'base64_data',
          additionalPhotoData: message.additionalPhotoData?.length || 0
        });
        ws.current.send(JSON.stringify(message));
      }
    };

    ws.current.onmessage = (event) => {
      console.log('📥 Received message:', event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'registered') {
          console.log('✅ Registration confirmed for client:', data.clientId);
          setStatus('connected');
          retryCount.current = 0;
        } else if (data.type === 'group_formed' && groupFormedCallbackRef.current) {
          console.log('✅ Group formed with members:', data.members);
          groupFormedCallbackRef.current(data.members, data.groupId, data.chatTime);
        } else if (data.type === 'group_disbanded' && groupDisbandedCallbackRef.current) {
          console.log('❌ Group disbanded:', data.groupId);
          groupDisbandedCallbackRef.current(data.groupId);
        }
      } catch (error) {
        console.error('❌ Failed to parse WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('🔌 WebSocket connection closed');
      if (status === 'connected') {
        console.log('⚠️ Unexpected connection loss');
        setStatus('disconnected');
      }
      
      if (status !== 'disconnected') {
        retryCount.current++;
        console.log('🔄 Scheduling reconnection attempt', {
          attempt: retryCount.current,
          maxRetries: MAX_RETRIES,
          delay: RETRY_DELAY
        });
        setTimeout(attemptConnection, RETRY_DELAY);
      }
    };

    ws.current.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      if (ws.current) {
        console.log('🧹 Closing connection due to error');
        ws.current.close();
      }
    };
  };

  const createGroup = (
    clientId: string,
    ageRange: { min: number; max: number },
    distance: number,
    groupSize: number,
    chatTime: number
  ) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'create_group',
        clientId,
        ageRange,
        distance,
        groupSize,
        chatTime
      };
      console.log('📤 Creating group:', message);
      ws.current.send(JSON.stringify(message));
    } else {
      console.log('⚠️ Cannot create group: WebSocket not connected');
    }
  };

  const cancelGroup = (groupId: string, clientId: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'cancel_group',
        groupId,
        clientId
      };
      console.log('📤 Cancelling group:', message);
      ws.current.send(JSON.stringify(message));
    } else {
      console.log('⚠️ Cannot cancel group: WebSocket not connected');
    }
  };

  const onGroupFormed = (callback: (members: Member[], groupId: string, chatTime: number) => void) => {
    groupFormedCallbackRef.current = callback;
  };

  const onGroupDisbanded = (callback: (groupId: string) => void) => {
    groupDisbandedCallbackRef.current = callback;
  };

  return (
    <WebSocketContext.Provider value={{ 
      status, 
      connect, 
      createGroup, 
      cancelGroup, 
      onGroupFormed,
      onGroupDisbanded 
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}; 