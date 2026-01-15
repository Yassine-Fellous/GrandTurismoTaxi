import { NextRequest, NextResponse } from 'next/server';
import { updateBookingStatus, getBookingById } from '@/lib/storage';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status invalide' },
        { status: 400 }
      );
    }

    const success = updateBookingStatus(params.id, status);

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Réservation non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Statut mis à jour',
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = getBookingById(params.id);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Réservation non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
