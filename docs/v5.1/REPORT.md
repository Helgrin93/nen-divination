# Nen Divination V5.1

Correzioni locali sul commit di partenza `0d6261575c84964b3f6b92ba381f39fac580f8c3`, completate il 2 novembre 2026 e lasciate nel working tree del branch attuale `main`. Nessun commit, push, merge o deploy eseguito.

Aprire [il confronto prima/dopo](confronto.html), oppure `/docs/v5.1/confronto.html` con il server locale. Contiene 104 screenshot: 13 stati × 4 viewport × prima/dopo. Sono selezionabili introduzione, domande, commento, transizione, concentrazione, rivelazione, conclusione, tutte e quattro le pose e risultato IT/EN. La baseline proviene da una copia isolata del commit iniziale; tutti i ritratti visibili sono caricati prima delle catture complete del risultato.

**Sfondo.** Le due ali e il centro erano tre immagini adiacenti ridimensionate separatamente. I campioni sui bordi dei PNG erano già opachi e cromaticamente allineati: il raccordo visibile nasceva nella composizione/rasterizzazione dei bordi alle dimensioni della camera. Ora `room-panorama.png` riunisce i tre asset esistenti in un'unica immagine 2560×1024. La parte centrale è una copia esatta, senza deformazioni o nuova generazione. Il fondo continuo riempie anche i pixel sotto il bordo subpixel della lastra centrale, conservata per il compositore dell'acqua e come fallback. Non sono state dipinte coperture né sfocate le texture. Lavagna, mobile, crepe, pannello, pavimento e prospettiva del tavolo provengono dagli asset precedenti.

**Wing.** Il precedente SVG dei gomiti riproduceva una seconda copia dello sprite con altezza diversa e una maschera curva. La sovrapposizione produceva raccordi e allungamenti artificiali. È stata rimossa la copia deformata; rimane soltanto una sottile ombra di contatto.

Il ritocco AI ha ricevuto esclusivamente ritagli della parte inferiore del corpo, senza il volto. Sono stati registrati sulla sorgente e utilizzati soltanto nelle porzioni terminali di tessuto, tra le righe native 961 e 1023. Sul neutro e sulla posa con dito alzato, i pixel fuori da questa fascia e quelli della pelle protetti dal controllo sono identici alla sorgente. Le mani e le braccia non provengono dalla generazione. La posa con dito alzato conserva il proprio corpo originale e ha un ritocco separato delle maniche.

Sorriso e occhi chiusi usano il corpo e le trasparenze del neutro corretto, mantenendo occhi, sopracciglia e bocca degli sprite approvati attraverso due ritagli locali. Questo elimina i triangoli grigi delle vecchie varianti e le variazioni di camicia/sfondo. Il confronto automatico del corpo delle tre pose a mani intrecciate restituisce zero differenze, compreso il canale alpha. Non sono stati introdotti filtri di luminosità o colore durante i cambi di espressione.

**Bicchiere.** In `GlassComposition.js` la condizione delle strisce laterali autorizzava la correzione anche fuori dal calice, riempiendo due porzioni rettangolari con il colore grigio del vetro. Ora quelle strisce vengono intersecate con la sagoma già esistente. Il contorno del calice, la foglia, il livello dell'acqua, i riflessi e la geometria degli effetti non sono stati ridisegnati. Il test verifica per tutti e quattro gli sprite che nessun pixel della correzione esca dalla sagoma ammessa.

**Header e icone.** Il logo verde/giallo è ricavato dalla variante sinistra completa di `13_LOGHI_CONFRONTO_UTENTE.png`; il riferimento `14` aveva il margine destro tagliato. Titolo esatto: `Nen Divination Test`. Header alto 64 px su desktop e 54 px su mobile, come prima; IT/EN resta funzionante a destra. La favicon è la X rossa estratta dallo stesso riferimento, disponibile in SVG e PNG 32/192, con Apple touch icon 180.

I sei kanji concordati erano già nel codice: **強, 変, 具, 特, 操, 放**. Sono stati convertiti in tracciati SVG autonomi per evitare dipendenze dai font installati, anche nelle esportazioni. Non sono stati inventati simboli alternativi. Ordine canonico, colori, etichette e dati del radar sono conservati. Il riferimento è `NEN_DIVINATION_V4_CODEX/references/RADAR_V4_APPROVATO.png`, con i caratteri specificati nella relativa tabella V4. Le etichette e percentuali superano il controllo di collisione e ritaglio a 320, 375, 390, 430, 768, 1280 e 1440 px.

**Frasi rimosse esattamente.** Sono le sole due righe cerchiate nello screenshot del risultato, insieme ai rispettivi elementi e margini. Le descrizioni dei poteri, le card, i pulsanti e le altre informazioni restano presenti.

Italiano:

- «Su Instagram, aggiungi uno sticker Link alla Story e incolla il link al quiz.»
- «Quiz ludico ispirato alla teoria di Hisoka: non è un metodo canonico o scientifico per determinare la personalità.»

Inglese:

- «On Instagram, add a Link sticker to your Story and paste the quiz link.»
- «A playful quiz inspired by Hisoka’s theory, not a canonical or scientific personality assessment.»

**Asset di produzione modificati o aggiunti.**

| Asset | Intervento |
| --- | --- |
| `public/assets/scene-v3/wing-neutral.png` | Raccordo locale delle maniche. |
| `public/assets/scene-v3/wing-smile.png` | Corpo/alpha condivisi con il neutro, caratteristiche dell'espressione conservate. |
| `public/assets/scene-v3/wing-eyes-closed.png` | Stesso corpo/alpha, occhi chiusi originali conservati. |
| `public/assets/scene-v3/wing-gesture.png` | Maniche corrette localmente, posa originale conservata. |
| `public/assets/room-v5/room-panorama.png` | Composizione degli asset già esistenti; centro identico al pixel. |
| `public/assets/brand/hunter-logo.png` | Logo fornito, ritagliato e ridotto con trasparenza. |
| `public/favicon.svg`, `public/favicon-32.png`, `public/icon-192.png`, `public/apple-touch-icon.png` | X rossa fornita e formati browser/mobile. |
| `src/data/nenSymbols.json` | Tracciati dei sei kanji approvati; nessun font esterno richiesto. |

La panoramica pesa circa 3,92 MB e sostituisce il caricamento delle due ali separate da circa 1,30 MB complessivi: il costo aggiuntivo delle immagini della stanza è circa 2,62 MB. Le sorgenti precedenti restano disponibili. Screenshot, ritagli AI, copia isolata della baseline e originali di lavoro sono esclusi dalla produzione.

**Verifiche completate.**

| Controllo | Esito |
| --- | --- |
| `npm.cmd test` | 29 test superati, 6 file. |
| Browser: `v51-polish`, stanza, radar, rendering e sei effetti su desktop e WebKit mobile | 43 superati; 3 skip previsti dai filtri di browser/profilo. |
| Browser: scena, esportazione e condivisione su desktop, WebKit 320×568 e Android 412×915 | 23 superati; 4 skip previsti dai filtri di profilo. |
| `npm.cmd run build` | Produzione compilata correttamente. |
| `npm.cmd run test:build` | Percorso `/nen-divination/`, flusso completo desktop/mobile, immagini e salvataggio PNG verificati. |
| `node scripts/review-v51.mjs` e baseline isolata | Screenshot completi 1920×1080, 1440×900, 390×844, 375×667. Nessun errore JavaScript nelle catture. |
| `node scripts/verify-v51-evidence.mjs` | 17 sorgenti protette conservate; centro della panoramica con zero canali cambiati; valori radar identici prima/dopo; 104 immagini del confronto decodificate. |
| `git diff --check` | Superato. |

I test degli effetti verificano pausa, avanzamento, riproduzione, persistenza, movimento ridotto e trasmissione del colore dello sprite senza riavviare l'animazione. La Specializzazione coincide con i fotogrammi approvati fuori dalla sola correzione statica del vetro. Gli atlanti, la logica del quiz, i testi delle domande e il componente delle card risultano conservati; per i file di testo il confronto normalizza soltanto LF/CRLF. Dati e hash sono in [preservation.json](preservation.json).

**Limiti della verifica.** Nei ritagli e nelle schermate ispezionate non risultano più visibili le giunzioni verticali, i vecchi raccordi duplicati dei gomiti o i tasselli grigi del bicchiere. Le prove mobile usano emulazione WebKit/Chrome, senza dispositivi fisici o barre del browser reale. I fotogrammi delle rivelazioni catturati nel flusso non sono sincronizzati al millisecondo: per il comportamento delle animazioni fanno fede anche i test dedicati. Nessun riferimento grafico richiesto risulta mancante.
