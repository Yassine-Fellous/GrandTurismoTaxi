import { NextRequest, NextResponse } from 'next/server';
import { estimerTaxi13 } from '@/lib/tarif';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const estimation = estimerTaxi13({
      distance_km: body.distance_km || 10,
      duree_minutes: body.duree_minutes || 15,
      est_nuit_ou_ferie: body.est_nuit_ou_ferie || false,
      retour_a_vide: body.retour_a_vide || false,
      nb_bagages_supp: body.nb_bagages_supp || 0,
      nb_passagers: body.nb_passagers || 1,
    });

    return NextResponse.json({
      success: true,
      estimation,
    });
  } catch (error) {
    console.error('Error calculating estimation:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors du calcul' },
      { status: 500 }
    );
  }
}
