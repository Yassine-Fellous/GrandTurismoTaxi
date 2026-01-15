import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifierConflitAvecPlanning, trouverProchainCreneauDisponible } from '@/lib/conflictDetection';
import type { Course } from '@/lib/conflictDetection';
import { sendReservationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      nom,
      email,
      telephone,
      depart,
      arrivee,
      dateHeure,
      commentaire,
      estimation,
      departCoords,
      arriveeCoords,
      nombrePassagers,
      bagageVolumineux,
      retourVide,
      nuitFerie
    } = body;

    // Normaliser les coordonnées dès la réception (lon -> lng)
    const normalizedDepartCoords = departCoords ? {
      lat: departCoords.lat,
      lng: (departCoords as any).lng || (departCoords as any).lon
    } : undefined;
    
    const normalizedArriveeCoords = arriveeCoords ? {
      lat: arriveeCoords.lat,
      lng: (arriveeCoords as any).lng || (arriveeCoords as any).lon
    } : undefined;

    // Vérifier que tous les champs requis sont présents
    if (!nom || !telephone || !depart || !arrivee || !dateHeure || !estimation) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      );
    }

    // 🚦 DÉTECTION DE CONFLITS HORAIRES
    // Récupérer toutes les réservations confirmées ou en attente
    // On récupère une fenêtre large (±24h) pour détecter les courses qui débordent
    const dateReservation = new Date(dateHeure);
    const debutFenetre = new Date(dateReservation);
    debutFenetre.setHours(debutFenetre.getHours() - 24); // 24h avant
    const finFenetre = new Date(dateReservation);
    finFenetre.setHours(finFenetre.getHours() + 24); // 24h après

    const { data: reservationsExistantes, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .gte('date_heure', debutFenetre.toISOString())
      .lte('date_heure', finFenetre.toISOString())
      .in('status', ['pending', 'confirmed']);

    if (fetchError) {
      console.error('❌ ERREUR CRITIQUE - Impossible de vérifier les conflits:', fetchError);
      // ⚠️  BLOQUER la réservation si on ne peut pas vérifier les conflits
      // Cela évite les doublons de réservations
      return NextResponse.json(
        { 
          error: 'Service temporairement indisponible',
          message: 'Impossible de vérifier la disponibilité. Veuillez réessayer dans quelques instants.',
          details: { error: fetchError.message }
        },
        { status: 503 } // 503 Service Unavailable
      );
    }

    // Convertir les réservations existantes en format Course
    const coursesExistantes: Course[] = (reservationsExistantes || []).map(res => ({
      id: res.id,
      depart: res.depart,
      arrivee: res.arrivee,
      date_heure: res.date_heure,
      duree_minutes: res.duree_minutes || 30,
      distance_km: res.distance_km || 10,
      // Normaliser les coordonnées : supporter à la fois 'lng' et 'lon'
      depart_coords: res.depart_coords ? {
        lat: res.depart_coords.lat,
        lng: res.depart_coords.lng || res.depart_coords.lon
      } : undefined,
      arrivee_coords: res.arrivee_coords ? {
        lat: res.arrivee_coords.lat,
        lng: res.arrivee_coords.lng || res.arrivee_coords.lon
      } : undefined
    }));

    console.log('🔍 Détection de conflits:');
    console.log(`  - Nouvelle réservation: ${depart} → ${arrivee} à ${dateHeure}`);
    console.log(`  - Durée: ${estimation.duree_minutes} min, Distance: ${estimation.distance_km} km`);
    console.log(`  - Coords départ:`, normalizedDepartCoords);
    console.log(`  - Coords arrivée:`, normalizedArriveeCoords);
    console.log(`  - ${coursesExistantes.length} réservation(s) existante(s) dans la fenêtre ±24h`);
    coursesExistantes.forEach((c, i) => {
      console.log(`    ${i + 1}. ${c.depart} → ${c.arrivee} à ${c.date_heure} (${c.duree_minutes}min, ${c.distance_km}km)`);
      console.log(`       Coords: départ=${JSON.stringify(c.depart_coords)}, arrivée=${JSON.stringify(c.arrivee_coords)}`);
    });

    const nouvelleCourse: Course = {
      id: 'temp-' + Date.now(),
      depart,
      arrivee,
      date_heure: dateHeure,
      distance_km: estimation.distance_km,
      duree_minutes: estimation.duree_minutes,
      depart_coords: normalizedDepartCoords,
      arrivee_coords: normalizedArriveeCoords,
    };

    // Vérifier les conflits avec buffer de sécurité de 15 minutes (Marseille)
    const conflictResult = verifierConflitAvecPlanning(
      nouvelleCourse,
      coursesExistantes,
      { 
        bufferSecurite: 15, // Couvre trafic + note + déchargement
        vitesseMoyenne: 25  // Marseille trafic moyen
      }
    );

    console.log(`📊 Résultat: ${conflictResult.hasConflict ? '❌ CONFLIT DÉTECTÉ' : '✅ PAS DE CONFLIT'}`);
    console.log(`   Message: ${conflictResult.message}`);
    if (conflictResult.details) {
      console.log(`   Détails:`, conflictResult.details);
    }

    // ❌ Si conflit détecté, bloquer la réservation et proposer alternative
    if (conflictResult.hasConflict) {
      const creneauAlternatif = trouverProchainCreneauDisponible(
        nouvelleCourse,
        coursesExistantes,
        { bufferSecurite: 15, vitesseMoyenne: 25 }
      );

      return NextResponse.json(
        {
          error: 'Créneau non disponible',
          message: conflictResult.message,
          details: {
            horairesDemandes: dateHeure,
            conflit: conflictResult.details,
            creneauAlternatif: creneauAlternatif.toISOString()
          }
        },
        { status: 409 } // 409 Conflict
      );
    }

    // ✅ Pas de conflit, on peut insérer la réservation
    // Insérer la réservation dans Supabase
    const { data, error } = await supabase
      .from('reservations')
      .insert([
        {
          nom,
          email,
          telephone,
          depart,
          arrivee,
          date_heure: dateHeure,
          commentaire: commentaire || null,
          prix_total: estimation.prix_total,
          distance_km: estimation.distance_km,
          duree_minutes: estimation.duree_minutes,
          tarif_applique: estimation.tarif_applique,
          depart_coords: normalizedDepartCoords,
          arrivee_coords: normalizedArriveeCoords,
          nombre_passagers: nombrePassagers || 1,
          bagage_volumineux: bagageVolumineux || false,
          retour_vide: retourVide || false,
          nuit_ferie: nuitFerie || false,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la réservation' },
        { status: 500 }
      );
    }

    console.log('✅ Réservation créée avec succès:', data.id);

    // 📧 Envoyer l'email de notification
    try {
      await sendReservationEmail({
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
      console.log('✅ Email envoyé avec succès');
    } catch (emailError) {
      console.error('⚠️ Erreur lors de l\'envoi de l\'email (réservation créée quand même):', emailError);
      // On ne bloque pas la réservation si l'email échoue
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
