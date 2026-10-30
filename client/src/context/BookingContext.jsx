import React, { createContext, useContext, useState, useEffect } from 'react';
import { bookingApi } from '../api/bookingApi';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [selectedSeats, setSelectedSeats] = useState([]); // array of seat objects: { seatNumber, category, price }
  const [activeShow, setActiveShow] = useState(null);
  const [activeMovie, setActiveMovie] = useState(null);
  const [activeCinema, setActiveCinema] = useState(null);

  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [reservation, setReservation] = useState(null);

  // Countdown timer for locked seats
  useEffect(() => {
    if (!lockExpiresAt) {
      setRemainingSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(lockExpiresAt).getTime();
      const diffSecs = Math.max(0, Math.floor((target - now) / 1000));

      setRemainingSeconds(diffSecs);

      if (diffSecs <= 0) {
        clearInterval(interval);
        // Automatically clear selection on timeout
        setSelectedSeats([]);
        setLockExpiresAt(null);
        setReservation(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  const toggleSeat = (seat) => {
    // Cannot toggle if already locked and checked out
    if (reservation) return;

    const exists = selectedSeats.find((s) => s.seatNumber === seat.seatNumber);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        alert('You can select a maximum of 8 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const lockSeatsAction = async (showId) => {
    const seatNumbers = selectedSeats.map((s) => s.seatNumber);
    const response = await bookingApi.lockSeats(showId, seatNumbers);
    const lockData = response.data;

    setLockExpiresAt(lockData.lockExpiresAt);
    setRemainingSeconds(lockData.remainingSeconds);
    return lockData;
  };

  const releaseSeatsAction = async () => {
    if (activeShow && selectedSeats.length > 0) {
      try {
        const seatNumbers = selectedSeats.map((s) => s.seatNumber);
        await bookingApi.releaseSeats(activeShow._id, seatNumbers);
      } catch (err) {
        console.error('Failed to release seats:', err);
      }
    }
    clearBooking();
  };

  const clearBooking = () => {
    setSelectedSeats([]);
    setLockExpiresAt(null);
    setRemainingSeconds(0);
    setReservation(null);
  };

  // Pricing calculations
  const subtotal = selectedSeats.reduce((acc, s) => acc + (s.price || 0), 0);
  const convenienceFee = selectedSeats.length * 1.5;
  const taxes = Math.round((subtotal + convenienceFee) * 0.08 * 100) / 100;
  const totalAmount = Math.round((subtotal + convenienceFee + taxes) * 100) / 100;

  return (
    <BookingContext.Provider
      value={{
        selectedSeats,
        activeShow,
        activeMovie,
        activeCinema,
        lockExpiresAt,
        remainingSeconds,
        reservation,
        subtotal,
        convenienceFee,
        taxes,
        totalAmount,
        setActiveShow,
        setActiveMovie,
        setActiveCinema,
        setReservation,
        toggleSeat,
        lockSeatsAction,
        releaseSeatsAction,
        clearBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
