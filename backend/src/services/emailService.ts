import nodemailer from 'nodemailer';
import logger from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendBookingConfirmation = async (booking: any) => {
  try {
    const studentEmail = booking.student.email;
    const tutorEmail = booking.tutor.user.email;
    const startTime = new Date(booking.slot.startTime).toLocaleString();
    const endTime = new Date(booking.slot.endTime).toLocaleString();

    const studentEmailContent = `
      <h2>Booking Confirmed!</h2>
      <p>Dear ${booking.student.firstName},</p>
      <p>Your tutoring session has been confirmed.</p>
      <h3>Details:</h3>
      <ul>
        <li><strong>Tutor:</strong> ${booking.tutor.user.firstName} ${booking.tutor.user.lastName}</li>
        <li><strong>Subject:</strong> ${booking.subject}</li>
        <li><strong>Start Time:</strong> ${startTime}</li>
        <li><strong>End Time:</strong> ${endTime}</li>
        <li><strong>Duration:</strong> ${booking.slot.duration} minutes</li>
      </ul>
      ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
      <p>You will receive a reminder 1 hour before your session.</p>
      <p>Best regards,<br>Tutor Booking System</p>
    `;

    const tutorEmailContent = `
      <h2>New Booking Received!</h2>
      <p>Dear ${booking.tutor.user.firstName},</p>
      <p>You have a new tutoring session booked.</p>
      <h3>Details:</h3>
      <ul>
        <li><strong>Student:</strong> ${booking.student.firstName} ${booking.student.lastName}</li>
        <li><strong>Subject:</strong> ${booking.subject}</li>
        <li><strong>Start Time:</strong> ${startTime}</li>
        <li><strong>End Time:</strong> ${endTime}</li>
        <li><strong>Duration:</strong> ${booking.slot.duration} minutes</li>
      </ul>
      ${booking.notes ? `<p><strong>Student Notes:</strong> ${booking.notes}</p>` : ''}
      <p>Best regards,<br>Tutor Booking System</p>
    `;

    await Promise.all([
      transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: studentEmail,
        subject: 'Tutoring Session Confirmed',
        html: studentEmailContent,
      }),
      transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: tutorEmail,
        subject: 'New Tutoring Session Booked',
        html: tutorEmailContent,
      }),
    ]);

    logger.info(`Booking confirmation emails sent for booking ${booking.id}`);
  } catch (error) {
    logger.error('Error sending booking confirmation emails:', error);
  }
};

export const sendBookingCancellation = async (booking: any) => {
  try {
    const studentEmail = booking.student.email;
    const tutorEmail = booking.tutor.user.email;
    const startTime = new Date(booking.slot.startTime).toLocaleString();

    const reason = booking.cancellationReason ? `<p><strong>Reason:</strong> ${booking.cancellationReason}</p>` : '';

    const studentEmailContent = `
      <h2>Booking Cancelled</h2>
      <p>Dear ${booking.student.firstName},</p>
      <p>Your tutoring session has been cancelled.</p>
      <h3>Cancelled Session Details:</h3>
      <ul>
        <li><strong>Tutor:</strong> ${booking.tutor.user.firstName} ${booking.tutor.user.lastName}</li>
        <li><strong>Subject:</strong> ${booking.subject}</li>
        <li><strong>Scheduled Time:</strong> ${startTime}</li>
      </ul>
      ${reason}
      <p>You can book another session at any time.</p>
      <p>Best regards,<br>Tutor Booking System</p>
    `;

    const tutorEmailContent = `
      <h2>Booking Cancelled</h2>
      <p>Dear ${booking.tutor.user.firstName},</p>
      <p>A tutoring session has been cancelled.</p>
      <h3>Cancelled Session Details:</h3>
      <ul>
        <li><strong>Student:</strong> ${booking.student.firstName} ${booking.student.lastName}</li>
        <li><strong>Subject:</strong> ${booking.subject}</li>
        <li><strong>Scheduled Time:</strong> ${startTime}</li>
      </ul>
      ${reason}
      <p>The time slot is now available for new bookings.</p>
      <p>Best regards,<br>Tutor Booking System</p>
    `;

    await Promise.all([
      transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: studentEmail,
        subject: 'Tutoring Session Cancelled',
        html: studentEmailContent,
      }),
      transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: tutorEmail,
        subject: 'Tutoring Session Cancelled',
        html: tutorEmailContent,
      }),
    ]);

    logger.info(`Cancellation emails sent for booking ${booking.id}`);
  } catch (error) {
    logger.error('Error sending cancellation emails:', error);
  }
};

export const sendBookingReminder = async (booking: any) => {
  try {
    const studentEmail = booking.student.email;
    const tutorEmail = booking.tutor.user.email;
    const startTime = new Date(booking.slot.startTime).toLocaleString();

    const emailContent = (firstName: string, role: string) => `
      <h2>Session Reminder</h2>
      <p>Dear ${firstName},</p>
      <p>This is a reminder that you have a tutoring session in 1 hour.</p>
      <h3>Session Details:</h3>
      <ul>
        <li><strong>${role === 'student' ? 'Tutor' : 'Student'}:</strong> ${
          role === 'student'
            ? `${booking.tutor.user.firstName} ${booking.tutor.user.lastName}`
            : `${booking.student.firstName} ${booking.student.lastName}`
        }</li>
        <li><strong>Subject:</strong> ${booking.subject}</li>
        <li><strong>Start Time:</strong> ${startTime}</li>
        <li><strong>Duration:</strong> ${booking.slot.duration} minutes</li>
      </ul>
      <p>Please be ready on time.</p>
      <p>Best regards,<br>Tutor Booking System</p>
    `;

    await Promise.all([
      transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: studentEmail,
        subject: 'Tutoring Session Reminder - Starting in 1 Hour',
        html: emailContent(booking.student.firstName, 'student'),
      }),
      transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: tutorEmail,
        subject: 'Tutoring Session Reminder - Starting in 1 Hour',
        html: emailContent(booking.tutor.user.firstName, 'tutor'),
      }),
    ]);

    logger.info(`Reminder emails sent for booking ${booking.id}`);
  } catch (error) {
    logger.error('Error sending reminder emails:', error);
  }
};
