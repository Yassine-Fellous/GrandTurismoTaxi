import { NextResponse } from 'next/server';
import { getAllBookings } from '@/lib/storage';

export async function GET() {
  try {
    const bookings = getAllBookings();
    
    // Sort by date (most recent first)
    bookings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
