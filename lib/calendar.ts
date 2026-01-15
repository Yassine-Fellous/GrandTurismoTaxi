import { google } from 'googleapis';
import { Booking } from '@/types/booking';

export async function addToGoogleCalendar(booking: Booking) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const startDateTime = new Date(booking.dateHeure);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +1 hour

    const event = {
      summary: `🚖 Course - ${booking.nom}`,
      description: `
Client: ${booking.nom}
Téléphone: ${booking.telephone}
Départ: ${booking.depart}
Arrivée: ${booking.arrivee}
${booking.commentaire ? `Commentaire: ${booking.commentaire}` : ''}

Réservation ID: ${booking.id}
      `.trim(),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Europe/Paris',
      },
      location: booking.depart,
      colorId: '11', // Red color
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      requestBody: event,
    });

    return { success: true, eventId: response.data.id };
  } catch (error) {
    console.error('Error adding to Google Calendar:', error);
    return { success: false, error };
  }
}
