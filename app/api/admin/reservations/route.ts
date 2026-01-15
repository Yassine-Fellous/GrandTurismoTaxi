import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendConfirmationEmail, sendRejectionEmail } from '@/lib/email';

// GET - Récupérer toutes les réservations
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des réservations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reservations: data });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour le statut d'une réservation
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, maps_link } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      );
    }

    // Préparer les champs à mettre à jour
    const updateData: any = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (maps_link !== undefined) updateData.maps_link = maps_link;

    const { data, error } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de la réservation' },
        { status: 500 }
      );
    }

    // Si le statut passe à "confirmed", envoyer un email au client
    if (status === 'confirmed' && data) {
      console.log('📧 Envoi de l\'email de confirmation au client...');
      try {
        await sendConfirmationEmail({
          id: data.id,
          nom: data.nom,
          email: data.email,
          telephone: data.telephone,
          depart: data.depart,
          arrivee: data.arrivee,
          date_heure: data.date_heure,
          commentaire: data.commentaire,
          prix_total: data.prix_total,
          distance_km: data.distance_km,
          duree_minutes: data.duree_minutes,
          status: data.status
        });
        console.log('✅ Email de confirmation envoyé');
      } catch (emailError) {
        console.error('⚠️ Erreur lors de l\'envoi de l\'email (réservation confirmée quand même):', emailError);
      }
    }

    // Si le statut passe à "rejected", envoyer un email de refus au client
    if (status === 'rejected' && data) {
      console.log('📧 Envoi de l\'email de refus au client...');
      try {
        await sendRejectionEmail({
          id: data.id,
          nom: data.nom,
          email: data.email,
          telephone: data.telephone,
          depart: data.depart,
          arrivee: data.arrivee,
          date_heure: data.date_heure,
          commentaire: data.commentaire,
          prix_total: data.prix_total,
          distance_km: data.distance_km,
          duree_minutes: data.duree_minutes,
          status: data.status
        });
        console.log('✅ Email de refus envoyé');
      } catch (emailError) {
        console.error('⚠️ Erreur lors de l\'envoi de l\'email (réservation rejetée quand même):', emailError);
      }
    }

    return NextResponse.json({ success: true, reservation: data });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
