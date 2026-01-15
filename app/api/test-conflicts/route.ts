import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Test de détection de conflits Supabase...');

    // Test 1: Récupérer toutes les réservations
    const { data: allReservations, error: allError } = await supabase
      .from('reservations')
      .select('*');

    if (allError) {
      return NextResponse.json({
        success: false,
        error: 'Erreur Supabase',
        details: allError,
        message: allError.message
      }, { status: 500 });
    }

    // Test 2: Récupérer les réservations du jour
    const aujourdhui = new Date();
    const debutJournee = new Date(aujourdhui);
    debutJournee.setHours(0, 0, 0, 0);
    const finJournee = new Date(aujourdhui);
    finJournee.setHours(23, 59, 59, 999);

    const { data: reservationsJour, error: jourError } = await supabase
      .from('reservations')
      .select('*')
      .gte('date_heure', debutJournee.toISOString())
      .lte('date_heure', finJournee.toISOString())
      .in('status', ['pending', 'confirmed']);

    const diagnostics = {
      success: true,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      totalReservations: allReservations.length,
      reservationsAujourdhui: reservationsJour?.length || 0,
      dateTest: aujourdhui.toISOString(),
      plageTestee: {
        debut: debutJournee.toISOString(),
        fin: finJournee.toISOString()
      },
      reservations: allReservations.map(res => ({
        id: res.id,
        date_heure: res.date_heure,
        depart: res.depart,
        arrivee: res.arrivee,
        duree_minutes: res.duree_minutes,
        distance_km: res.distance_km,
        status: res.status,
        depart_coords: res.depart_coords,
        arrivee_coords: res.arrivee_coords,
        has_coords: !!(res.depart_coords && res.arrivee_coords)
      }))
    };

    // Vérifier les champs requis
    if (allReservations.length > 0) {
      const champsRequis = ['date_heure', 'duree_minutes', 'distance_km', 'depart_coords', 'arrivee_coords'];
      const premiereRes = allReservations[0];
      const champManquants = champsRequis.filter(champ => !(champ in premiereRes));
      
      diagnostics.champsManquants = champManquants;
      diagnostics.detectionConflitsPossible = champManquants.length === 0;
    }

    return NextResponse.json(diagnostics);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
