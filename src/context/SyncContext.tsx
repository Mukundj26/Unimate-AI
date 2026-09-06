import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext.tsx';

interface SyncEventMessage {
  id: number;
  type: string;
  userId: string;
  payload: any;
  timestamp: string;
}

interface SyncContextType {
  isConnected: boolean;
  lastEvent: SyncEventMessage | null;
  syncCount: number;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SyncEventMessage | null>(null);
  const [syncCount, setSyncCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!user) return;

    let eventSource: EventSource | null = null;

    try {
      const activeToken = token || localStorage.getItem('omni_token') || 'token-user-demo-1';
      const sseUrl = `/api/sync/events?token=${encodeURIComponent(activeToken)}`;
      eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.type !== 'connected') {
            setLastEvent(parsed);
            setSyncCount(c => c + 1);
            setRefreshTrigger(prev => prev + 1);
          }
        } catch {
          // heartbeat or unparseable
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch (err) {
      console.warn('SSE Sync not available, falling back to local updates:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [user?.id, token]);

  return (
    <SyncContext.Provider value={{ isConnected, lastEvent, syncCount, refreshTrigger, triggerRefresh }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within SyncProvider');
  return context;
};
