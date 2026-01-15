import * as brevo from '@getbrevo/brevo';

// Configuration Brevo
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

interface ReservationEmailData {
  id: string;
  nom: string;
  email?: string;
  telephone: string;
  depart: string;
  arrivee: string;
  date_heure: string;
  commentaire?: string;
  prix_total: number;
  distance_km: number;
  duree_minutes: number;
  status: string;
}

export async function sendReservationEmail(reservation: ReservationEmailData) {
  const adminEmail = process.env.ADMIN_EMAIL || 'granturismotaxi@gmail.com';
  const fromEmail = process.env.FROM_EMAIL || 'noreply@grantturismo-taxi.com';
  const fromName = process.env.FROM_NAME || 'Gran Turismo Taxi';

  try {
    // Email à l'admin
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.sender = { name: fromName, email: fromEmail };
    sendSmtpEmail.to = [{ email: adminEmail, name: 'Admin GT Taxi' }];
    sendSmtpEmail.subject = `🚖 Nouvelle réservation - ${reservation.nom}`;
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #e5e5e5; background: #0a0a0a; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #e00000 0%, #b00000 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 2px; }
            .header p { margin: 10px 0 0 0; opacity: 0.95; font-size: 16px; }
            .content { padding: 35px 30px; }
            .field { margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #2a2a2a; }
            .field:last-child { border-bottom: none; }
            .label { font-weight: 600; color: #e00000; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; }
            .value { font-size: 16px; color: #e5e5e5; }
            .price-box { background: linear-gradient(135deg, #1a0000 0%, #2a0000 100%); border: 2px solid #e00000; padding: 25px; text-align: center; border-radius: 10px; margin: 30px 0; box-shadow: 0 4px 15px rgba(224, 0, 0, 0.2); }
            .price-box .amount { font-size: 36px; font-weight: 700; color: #e00000; text-shadow: 0 0 10px rgba(224, 0, 0, 0.3); }
            .footer { background: #0a0a0a; text-align: center; padding: 25px; color: #888; font-size: 13px; border-top: 1px solid #2a2a2a; }
            .status-badge { display: inline-block; padding: 8px 20px; background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%); color: white; border-radius: 25px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
            .info-box { background: #2a0000; border-left: 4px solid #e00000; padding: 20px; margin: 25px 0; border-radius: 5px; }
            .info-box p { margin: 0; color: #e5e5e5; font-size: 15px; line-height: 1.6; }
            a { color: #e00000; text-decoration: none; font-weight: 600; }
            a:hover { color: #ff0000; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>GT TAXI</h1>
              <p>Nouvelle réservation reçue</p>
            </div>
            
            <div class="content">
              <div style="text-align: center; margin-bottom: 20px;">
                <span class="status-badge">EN ATTENTE DE VALIDATION</span>
              </div>

              <div class="field">
                <div class="label">👤 Client</div>
                <div class="value">${reservation.nom}</div>
              </div>
              
              <div class="field">
                <div class="label">📞 Téléphone</div>
                <div class="value"><a href="tel:${reservation.telephone}">${reservation.telephone}</a></div>
              </div>

              ${reservation.email ? `
              <div class="field">
                <div class="label">📧 Email</div>
                <div class="value"><a href="mailto:${reservation.email}">${reservation.email}</a></div>
              </div>
              ` : ''}
              
              <div class="field">
                <div class="label">📍 Trajet</div>
                <div class="value">
                  <strong>Départ :</strong> ${reservation.depart}<br>
                  <strong>Arrivée :</strong> ${reservation.arrivee}
                </div>
              </div>
              
              <div class="field">
                <div class="label">📅 Date et heure</div>
                <div class="value">${new Date(reservation.date_heure).toLocaleString('fr-FR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</div>
              </div>

              <div class="field">
                <div class="label">⏱️ Durée estimée</div>
                <div class="value">${reservation.duree_minutes} minutes</div>
              </div>

              <div class="field">
                <div class="label">📏 Distance</div>
                <div class="value">${reservation.distance_km.toFixed(1)} km</div>
              </div>
              
              ${reservation.commentaire ? `
              <div class="field">
                <div class="label">💬 Commentaire</div>
                <div class="value">${reservation.commentaire}</div>
              </div>
              ` : ''}

              <div class="price-box">
                <div class="label">💰 Prix estimé</div>
                <div class="amount">${reservation.prix_total.toFixed(2)} €</div>
              </div>
              
              <div class="field">
                <div class="label">🆔 Numéro de réservation</div>
                <div class="value" style="font-family: monospace; font-size: 12px;">${reservation.id}</div>
              </div>

              <div class="info-box">
                <p>📞 <strong>Action requise :</strong> Le client sera bientôt appelé pour valider la course et confirmer les détails de la réservation.</p>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Gran Turismo Taxi</strong></p>
              <p>📍 Marseille, France</p>
              <p style="margin-top: 15px; color: #666;">Gérez vos réservations sur <a href="https://grandturismotaxi.com/admin" style="color: #e00000;">grandturismotaxi.com/admin</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email envoyé avec succès via Brevo:', result);

    // Si le client a fourni un email, lui envoyer une confirmation
    if (reservation.email) {
      const clientEmail = new brevo.SendSmtpEmail();
      clientEmail.sender = { name: fromName, email: fromEmail };
      clientEmail.to = [{ email: reservation.email, name: reservation.nom }];
      clientEmail.subject = `✅ Confirmation de réservation - Gran Turismo Taxi`;
      clientEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #e5e5e5; background: #0a0a0a; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #e00000 0%, #b00000 100%); color: white; padding: 40px 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 2px; }
              .header p { margin: 10px 0 0 0; font-size: 16px; }
              .content { padding: 35px 30px; }
              .field { margin-bottom: 20px; }
              .label { font-weight: 600; color: #e00000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
              .value { font-size: 16px; margin-top: 8px; color: #e5e5e5; }
              .footer { background: #0a0a0a; text-align: center; padding: 25px; color: #888; font-size: 13px; border-top: 1px solid #2a2a2a; }
              .alert { background: #2a1800; border-left: 4px solid #ffa500; padding: 20px; margin: 25px 0; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>GT TAXI</h1>
                <p>Votre réservation a bien été enregistrée</p>
              </div>
              
              <div class="content">
                <p>Bonjour <strong>${reservation.nom}</strong>,</p>
                
                <p>Nous avons bien reçu votre demande de réservation. Voici les détails :</p>

                <div class="alert">
                  📞 <strong>Votre réservation est en attente de validation</strong><br>
                  Vous serez bientôt contacté par téléphone pour confirmer les détails de votre course.
                </div>

                <div class="field">
                  <div class="label">📍 DÉPART</div>
                  <div class="value">${reservation.depart}</div>
                </div>

                <div class="field">
                  <div class="label">📍 ARRIVÉE</div>
                  <div class="value">${reservation.arrivee}</div>
                </div>

                <div class="field">
                  <div class="label">📅 DATE ET HEURE</div>
                  <div class="value">${new Date(reservation.date_heure).toLocaleString('fr-FR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                </div>

                <div class="field">
                  <div class="label">💰 PRIX ESTIMÉ</div>
                  <div class="value" style="font-size: 24px; font-weight: bold; color: #e00000;">${reservation.prix_total.toFixed(2)} €</div>
                </div>

                <div class="field">
                  <div class="label">🆔 NUMÉRO DE RÉSERVATION</div>
                  <div class="value" style="font-family: monospace; font-size: 12px;">${reservation.id}</div>
                </div>

                <p style="margin-top: 30px;">Pour toute question, n'hésitez pas à nous contacter au <strong>${reservation.telephone}</strong>.</p>
                
                <p>À bientôt,<br><strong>L'équipe Gran Turismo Taxi</strong></p>
              </div>
              
              <div class="footer">
                <p><strong>Gran Turismo Taxi</strong></p>
                <p>📍 Marseille, France</p>
                <p style="margin-top: 15px; color: #666;">Service de transport professionnel</p>
              </div>
            </div>
          </body>
        </html>
      `;

      await apiInstance.sendTransacEmail(clientEmail);
      console.log('✅ Email de confirmation envoyé au client');
    }

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return { success: false, error };
  }
}

export async function sendConfirmationEmail(reservation: ReservationEmailData) {
  const fromEmail = process.env.FROM_EMAIL || 'granturismotaxi@gmail.com';
  const fromName = process.env.FROM_NAME || 'Gran Turismo Taxi';

  if (!reservation.email) {
    console.log('⚠️ Aucun email client, envoi annulé');
    return { success: false, error: 'No email provided' };
  }

  try {
    const clientEmail = new brevo.SendSmtpEmail();
    clientEmail.sender = { name: fromName, email: fromEmail };
    clientEmail.to = [{ email: reservation.email, name: reservation.nom }];
    clientEmail.subject = `✅ Course confirmée - Gran Turismo Taxi`;
    clientEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #e5e5e5; background: #0a0a0a; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #e00000 0%, #b00000 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 2px; }
            .header p { margin: 10px 0 0 0; font-size: 16px; }
            .content { padding: 35px 30px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: 600; color: #e00000; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
            .value { font-size: 16px; margin-top: 8px; color: #e5e5e5; }
            .footer { background: #0a0a0a; text-align: center; padding: 25px; color: #888; font-size: 13px; border-top: 1px solid #2a2a2a; }
            .success-box { background: #2a0000; border-left: 4px solid #e00000; padding: 20px; margin: 25px 0; border-radius: 5px; }
            .success-box p { margin: 0; color: #e5e5e5; font-size: 15px; line-height: 1.6; }
            .checkmark { font-size: 48px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>GT TAXI</h1>
              <p>Votre course est confirmée !</p>
            </div>
            
            <div class="content">
              <div class="checkmark">✅</div>
              
              <p>Bonjour <strong>${reservation.nom}</strong>,</p>
              
              <div class="success-box">
                <p>🎉 <strong>Bonne nouvelle !</strong><br>
                Gran Turismo Taxi a confirmé votre réservation. Votre chauffeur sera à l'heure pour vous prendre en charge.</p>
              </div>

              <p><strong>Récapitulatif de votre course :</strong></p>

              <div class="field">
                <div class="label">📍 DÉPART</div>
                <div class="value">${reservation.depart}</div>
              </div>

              <div class="field">
                <div class="label">📍 ARRIVÉE</div>
                <div class="value">${reservation.arrivee}</div>
              </div>

              <div class="field">
                <div class="label">📅 DATE ET HEURE</div>
                <div class="value">${new Date(reservation.date_heure).toLocaleString('fr-FR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</div>
              </div>

              <div class="field">
                <div class="label">💰 PRIX ESTIMÉ</div>
                <div class="value" style="font-size: 24px; font-weight: bold; color: #e00000;">${reservation.prix_total.toFixed(2)} €</div>
              </div>

              <div class="field">
                <div class="label">🆔 NUMÉRO DE RÉSERVATION</div>
                <div class="value" style="font-family: monospace; font-size: 12px;">${reservation.id}</div>
              </div>

              <div class="success-box" style="background: #2a1800; border-left-color: #ffa500;">
                <p>⏰ <strong>Conseil :</strong> Soyez prêt 5 minutes avant l'heure prévue. En cas d'imprévu, contactez-nous au <strong>06 72 36 20 15</strong>.</p>
              </div>

              <p style="margin-top: 30px;">Merci de votre confiance,<br><strong>L'équipe Gran Turismo Taxi</strong></p>
            </div>
            
            <div class="footer">
              <p><strong>Gran Turismo Taxi</strong></p>
              <p>📍 Marseille, France</p>
              <p style="margin-top: 15px; color: #666;">Service de transport professionnel</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await apiInstance.sendTransacEmail(clientEmail);
    console.log('✅ Email de confirmation envoyé au client:', result);

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de confirmation:', error);
    return { success: false, error };
  }
}
