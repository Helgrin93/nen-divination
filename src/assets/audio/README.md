# Musica autorizzata

Inserire in questa cartella tre file audio con i diritti di pubblicazione:

- `intro-quiz.mp3`: apertura, introduzione e domande.
- `divination.mp3`: dall'inizio effettivo della concentrazione fino alla conclusione di Wing.
- `result.mp3`: solo quando appare la scheda risultato.

Sono accettati anche `.m4a`, `.ogg` e `.wav`; usare un solo formato per nome.
MP3/AAC sono adatti anche a Safari su iPhone. Preferire file compressi e loop
senza pause. Nessuna traccia commerciale è inclusa o scaricata.

`src/audio/tracks.js` associa i file esistenti e configura i loop;
`musicSettings` controlla volume (0.22) e fade (280 ms per direzione).
Vite rileva i file durante avvio/build: riavviare il server dopo averli aggiunti
e rifare la build prima della pubblicazione. I percorsi distribuiti rispettano
`/nen-divination/`. Se manca un brano, quella fase rimane silenziosa senza
richieste verso file inesistenti. La preferenza dell'utente rimane salvata.

Il primo tentativo di autoplay avviene dopo la preparazione della scena.
Se il browser lo blocca, Inizia o il controllo audio possono sbloccarlo.
La traccia precedente termina il fade-out prima che parta la successiva.
