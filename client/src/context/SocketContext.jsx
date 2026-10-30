import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // In dev, connects to proxy or server port
    const socketInstance = io('/', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinShow = (showId) => {
    if (socket && showId) {
      socket.emit('join:show', showId);
    }
  };

  const leaveShow = (showId) => {
    if (socket && showId) {
      socket.emit('leave:show', showId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinShow, leaveShow }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
