import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test Ethereal account if no SMTP credentials provided
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      logger.info(`Initialized Ethereal test mailer with account: ${testAccount.user}`);
    } catch (err) {
      logger.warn('Failed to create Ethereal test email account. Email sending will be logged to console.');
      return null;
    }
  }

  return transporter;
};

export const sendBookingConfirmationEmail = async ({
  to,
  userName,
  bookingNumber,
  movieTitle,
  cinemaName,
  screenName,
  startTime,
  seats,
  totalAmount,
}) => {
  try {
    const mailer = await getTransporter();
    const formattedDate = new Date(startTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const seatList = seats.map((s) => `${s.seatNumber} (${s.category})`).join(', ');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #0f172a; color: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 16px;">
          <h1 style="color: #ef4444; margin: 0; font-size: 28px;">🎬 CineVerse</h1>
          <p style="color: #94a3b8; margin: 4px 0 0;">Booking Confirmation & E-Ticket</p>
        </div>

        <div style="padding: 24px 0;">
          <p style="font-size: 16px;">Hello <strong>${userName}</strong>,</p>
          <p style="color: #cbd5e1;">Your booking is confirmed! Here are your ticket details:</p>

          <div style="background-color: #1e293b; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 6px 0; font-size: 14px; color: #94a3b8;">Booking Code: <strong style="color: #38bdf8; font-size: 16px;">${bookingNumber}</strong></p>
            <h2 style="color: #ffffff; margin: 10px 0;">${movieTitle}</h2>
            <p style="margin: 6px 0; color: #cbd5e1;">📍 <strong>${cinemaName}</strong> - ${screenName}</p>
            <p style="margin: 6px 0; color: #cbd5e1;">🗓️ <strong>${formattedDate}</strong></p>
            <p style="margin: 6px 0; color: #cbd5e1;">🎟️ <strong>Seats:</strong> ${seatList}</p>
            <p style="margin: 12px 0 0; font-size: 18px; color: #4ade80;">💵 <strong>Total Paid:</strong> $${totalAmount.toFixed(2)}</p>
          </div>

          <p style="font-size: 13px; color: #94a3b8; text-align: center;">
            Please present this confirmation email or your CineVerse app e-ticket with QR code at the cinema gate for fast entry.
          </p>
        </div>

        <div style="text-align: center; border-top: 1px solid #334155; padding-top: 16px; font-size: 12px; color: #64748b;">
          &copy; ${new Date().getFullYear()} CineVerse Inc. All rights reserved.
        </div>
      </div>
    `;

    if (!mailer) {
      logger.info(`[MOCK EMAIL SENT to ${to}] Booking ${bookingNumber} confirmed for ${movieTitle}`);
      return;
    }

    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"CineVerse" <no-reply@cineverse.com>',
      to,
      subject: `🎬 Booking Confirmed: ${movieTitle} [${bookingNumber}]`,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`Email sent! Preview URL: ${previewUrl}`);
    }
  } catch (error) {
    logger.error('Failed to send booking confirmation email:', error);
  }
};
