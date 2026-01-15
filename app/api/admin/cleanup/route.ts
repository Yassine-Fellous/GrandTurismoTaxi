import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { action, reservationIds } = await request.json();

    if (action === 'delete' && reservationIds && Array.isArray(reservationIds)) {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .in('id', reservationIds);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: `${reservationIds.length} réservation(s) supprimée(s)` 
      });
    }

    if (action === 'delete_all_test') {
      // Supprimer toutes les réservations de test (celles avec des emails de test)
      const { error } = await supabase
        .from('reservations')
        .delete()
        .or('email.like.%@example.com,email.like.%@test.com,nom.eq.Test%');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Toutes les réservations de test supprimées' 
      });
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Route de nettoyage des réservations',
    actions: [
      'POST avec {"action": "delete", "reservationIds": [...]} pour supprimer des IDs spécifiques',
      'POST avec {"action": "delete_all_test"} pour supprimer toutes les réservations de test'
    ]
  });
}
