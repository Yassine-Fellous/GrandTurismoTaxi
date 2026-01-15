import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // Supprimer TOUTES les réservations
    const { error } = await supabase
      .from('reservations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Condition toujours vraie pour tout supprimer

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Toutes les réservations ont été supprimées' 
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erreur serveur' 
    }, { status: 500 });
  }
}
