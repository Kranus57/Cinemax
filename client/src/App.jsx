import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { BookingProvider } from './context/BookingContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <BookingProvider>
            <AppRoutes />
          </BookingProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
