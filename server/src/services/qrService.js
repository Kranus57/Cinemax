import QRCode from 'qrcode';
import { logger } from '../utils/logger.js';

export const generateTicketQR = async (bookingData) => {
  try {
    const payload = JSON.stringify({
      bookingNumber: bookingData.bookingNumber,
      movie: bookingData.movieTitle,
      cinema: bookingData.cinemaName,
      screen: bookingData.screenName,
      showTime: bookingData.startTime,
      seats: bookingData.seats.map((s) => s.seatNumber),
      totalAmount: bookingData.totalAmount,
      validUntil: bookingData.endTime,
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      width: 256,
    });

    return qrDataUrl;
  } catch (error) {
    logger.error('Failed to generate ticket QR code:', error);
    return null;
  }
};
