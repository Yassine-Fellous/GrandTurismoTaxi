import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Booking } from '@/types/booking';
import { addBooking } from '@/lib/storage';
import { sendReservationEmail } from '@/lib/email';
import { addToGoogleCalendar } from '@/lib/calendar';

const bookingSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  telephone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, 'Numéro de téléphone invalide'),
  depart: z.string().min(3, 'Adresse de départ requise'),
  arrivee: z.string().min(3, 'Adresse d\'arrivée requise'),
  dateHeure: z.string().min(1, 'Date et heure requises'),
  commentaire: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = bookingSchema.parse(body);

    // Create booking object
    const booking: Booking = {
      id: `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...validatedData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Save booking to storage
    addBooking(booking);

    // Send email notification (non-blocking)
    sendReservationEmail(booking).catch((err) =>
      console.error('Failed to send email:', err)
    );

    // Add to Google Calendar (non-blocking)
    addToGoogleCalendar(booking).catch((err) =>
      console.error('Failed to add to calendar:', err)
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Réservation enregistrée avec succès',
        bookingId: booking.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing booking:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Données invalides',
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de la réservation',
      },
      { status: 500 }
    );
  }
}
