# Nen Divination V5.3 — report di verifica

Modifiche locali, senza push, merge o pubblicazione. La scena approvata resta la stessa; gli interventi riguardano preparazione iniziale, acqua del Potenziamento e musica. [Confronto screenshot prima/dopo](confronto.html).

## 1. Perché la scena arrivava a pezzi

La prima schermata usa panorama, composizione centrale con bicchiere e mani originali, ritocco del tappeto, Wing neutro, correzione del vetro su canvas e mani su un secondo canvas. Il logo è un altro asset. Ogni immagine diventava visibile per conto proprio; il canvas delle mani aspettava due PNG, mentre quello dell’acqua aspettava anche tutti gli atlanti delle divinazioni. Wing aveva già una protezione sulla decodifica delle singole espressioni, ma mancava una preparazione coordinata dell’intera scena.

Le altre tre espressioni di Wing e gli atlanti erano richiesti subito, contendendo banda agli asset iniziali. I soli asset critici pesavano circa 9,46 MB. Le dimensioni della scena erano già riservate: il problema principale era la composizione progressiva dei livelli, non un caricamento lazy. I font sono Arial/Helvetica e Georgia/Times di sistema: nessuna richiesta a servizi di font e nessun font remoto da attendere. I ritratti dei risultati restano esclusi dalla preparazione iniziale.

## 2. Caricamento uniforme

- Preload HTML per panorama, composizione centrale e Wing neutro; i percorsi sono riscritti da Vite sotto `/nen-divination/`.
- Preparazione condivisa delle immagini tramite `decode()`, con controllo degli errori. Le mani vengono disegnate solo dopo la decodifica di entrambi gli asset; la correzione del vetro usa il Wing già decodificato.
- Indicatore discreto durante la preparazione. La scena mantiene le dimensioni previste ed è invisibile e non interattiva fino alla preparazione dei livelli essenziali.
- Comparsa comune con fade di 220 ms; nessuna attesa minima artificiale. Con movimento ridotto la comparsa è immediata.
- Espressioni successive e atlanti partono dopo la preparazione iniziale. Non si attendono musica o personaggi del risultato. Il caricamento iniziale non viene ripetuto passando tra domande o ricominciando il quiz.
- Un asset fallito viene nascosto; il quiz resta utilizzabile. Un limite di sicurezza di 45 secondi libera anche le richieste rimaste sospese e impedisce che un asset critico scaduto appaia in ritardo. Se gli sprite della divinazione non sono disponibili, è comunque possibile arrivare al risultato.

Nove PNG sono stati ricompressi senza cambiare dimensioni, canali o pixel: **13.357.656 → 9.851.403 byte, −26,2%**. Gli asset della prima composizione scendono a circa **7,07 MB**. Lo script verifica i byte dei pixel ricostruiti prima di accettare la ricompressione. [Misure per file](png-optimization.json).

## 3. Causa dell’acqua statica

La superficie dell’acqua e la sua linea anteriore sono incorporate nel PNG centrale. La precedente maschera considerava una superficie centrata a `y=105` con raggio verticale di circa 29 unità, mentre la superficie dipinta occupa circa `y=81…149`, con centro a `y=115`. Il ritocco lasciava visibile la linea anteriore originale, aggiungendo una piccola superficie superiore. Il traboccamento non corrispondeva quindi a un aumento coerente del volume interno.

## 4. Progressione corretta

Il nuovo pass locale sostituisce l’intera impronta della vecchia superficie, inclusa la linea anteriore a `y≈145`. Il materiale viene ricavato dall’acqua già dipinta sotto quella linea: mantiene colore trasmesso e riflessi dell’illustrazione. Un’unica superficie sale di 26 unità fino al bordo, sviluppa un menisco convesso di altre 2 unità e alimenta i flussi esistenti. Foglia e riflessi seguono il livello; il bordo fisso del vetro viene ricomposto davanti all’acqua. Il bicchiere, la scena e gli sprite di traboccamento non sono stati rigenerati.

Sono stati acquisiti e ispezionati screenshot prima/dopo di stato iniziale, salita, bordo/menisco, traboccamento, stato finale e reset, su desktop e WebKit mobile. I test misurano anche i pixel della vecchia linea d’acqua, non soltanto l’avanzamento dichiarato dell’animazione. Gli screenshot sono in `before/`, `after/` e `.verification/v53/`.

Le altre cinque reazioni sono confrontate con il compositore originale conservato da Git: **50 fotogrammi identici**, a 0/25/50/75/100% su Chrome desktop e WebKit mobile. [Risultati](preservation.json). Dialoghi, punteggi, durata della concentrazione di 4,5 secondi, radar e salvataggio non sono stati riscritti.

## 5. Sistema musicale

`src/services/music.js` possiede un solo elemento audio persistente e gestisce tre fasi. Intro e domande condividono la prima traccia. La seconda parte soltanto all’inizio effettivo della pressione di concentrazione, oppure tramite la rivelazione accessibile. Rimane attiva durante la manifestazione e la conclusione di Wing. La terza viene selezionata solo quando il giocatore prosegue alla scheda risultato. Il riavvio ripristina la prima.

Il cambio brano termina un fade-out prima di cambiare sorgente e iniziare il fade-in: non esistono due riproduzioni sovrapposte. Volume predefinito 0,22, fade di 280 ms per direzione, loop configurabili. Un GainNode, quando disponibile, gestisce il volume anche dove il volume del media è controllato dal dispositivo. Cambiare domanda, lingua o espressione non riavvia il brano.

Il primo tentativo di autoplay avviene dopo la preparazione della scena; un rifiuto di `play()` viene gestito senza promessa non intercettata. Non ci sono timer di tentativi ripetuti. Inizia e il pulsante audio possono fornire il gesto esplicito necessario. L’icona attiva richiede un evento/riproduzione effettivi; caricamento, blocco e indisponibilità mantengono l’icona disattivata. La preferenza è salvata in `localStorage` con chiave `nen-music-enabled` e rimane rispettata tra fasi e ricaricamenti.

Il controllo ha area di 44 × 44 px, etichette IT/EN e stato accessibile. Si trova accanto al selettore lingua. Su mobile logo e testo sono adattati nello spazio dell’header per evitare sovrapposizioni; gli elementi mantengono la loro posizione.

## 6. Dove inserire le tre tracce

Inserire esclusivamente file autorizzati in:

| Fase | File |
| --- | --- |
| Intro / quiz | `src/assets/audio/intro-quiz.mp3` |
| Divinazione | `src/assets/audio/divination.mp3` |
| Risultato | `src/assets/audio/result.mp3` |

Sono supportati anche `.m4a`, `.ogg`, `.wav`; usare un solo formato per nome. La configurazione è in `src/audio/tracks.js`. Riavviare il server dopo l’aggiunta e rifare la build prima di pubblicare. Vite rileva solo file realmente presenti e genera URL compatibili con il base path. Senza file la fase rimane silenziosa: nessuna richiesta verso nomi inventati, nessun errore di file assenti, nessun precaricamento musicale durante l’apertura.

**Non sono incluse tracce musicali.** I toni originali usati dai test esistono solo in memoria nel processo di verifica e non vengono distribuiti. Non sono state scaricate OST né aggiunti servizi di streaming. [Istruzioni nella cartella audio](../../src/assets/audio/README.md).

## 7. Verifiche

- `npm.cmd run test`: 40 test unitari superati, inclusi autoplay rifiutato, muting persistente, fasi, risorse assenti, errori, promise pendenti e cambi rapidi durante i fade.
- `npm.cmd run test:simulation`: 30.000 tentativi completati con la calibrazione originale.
- Build Vite e `npm.cmd run test:build`: flusso completo su desktop e mobile servendo esclusivamente `dist` sotto `/nen-divination/`, export PNG e controllo degli asset distribuiti.
- 51 test browser sulle nuove funzionalità, sei animazioni, bordo del vetro e branding V5.2, su Chrome desktop 1440 × 900, Chrome mobile 320 × 568 e WebKit mobile 390 × 844.
- Altri 17 test di regressione superati su Chrome desktop e WebKit mobile: quiz completo IT/EN, salvataggio e condivisione PNG, sei risultati anche offline, riavvio, pressione nativa di 4,5 secondi, cancellazione dell’interazione e persistenza delle espressioni di Wing. Un caso duplicato del test offline è escluso su mobile dalla suite originale.
- Test separato con autoplay esplicitamente consentito nel browser di verifica: riproduzione reale Chromium, volume, errore temporaneo del media e recupero manuale superati. Le opzioni di autoplay del test non sono presenti nell’app.
- Due test aggiuntivi su desktop/WebKit mobile verificano il completamento del quiz e il riavvio anche con uno sprite della divinazione fallito.
- Build separata con tre toni di prova in una copia isolata dei sorgenti: rilevamento dei file opzionali, nomi distribuiti e prefisso `/nen-divination/` corretti. Nessun file di prova entra nei sorgenti o nella build di produzione. [Esito](audio-build-check.json).
- Cache vuota e ricaricamento normale su desktop/WebKit mobile; 1,6 Mbps e 150 ms di latenza su Chromium. Preparazione completa in circa 37,4 s sul collegamento rallentato, senza fallback e con CLS rilevato pari a 0. Su WebKit è stato simulato il ritardo delle risposte degli asset, perché non dispone del medesimo controllo CDP della banda. [Misure](loading-checks.json).
- Errori e richieste sospese degli asset critici: caricamento sbloccato, asset non validi nascosti, quiz utilizzabile. Atlanti ritardati: non bloccano l’apertura.
- Controllo in sola lettura del [sito GitHub Pages attuale](https://helgrin93.github.io/nen-divination/): base path e immagini pubblicate verificati. [Acquisizione](published-check.json). La V5.3 non è stata pubblicata.

## 8. Limiti

Le musiche definitive devono ancora essere fornite. La compressione senza perdita lascia circa 7 MB di immagini critiche: su reti molto lente l’indicatore resta visibile più a lungo, fino al limite di sicurezza. Non viene nascosto con una durata artificiale.

Le verifiche smartphone usano viewport e interazioni touch automatizzate; non sostituiscono una prova su un iPhone fisico. Il WebKit di Playwright su questa macchina Windows non dispone di un backend audio funzionante: restituisce `NotSupportedError` anche per il WAV di prova pur dichiarandolo supportato. Su quel motore i test audio verificano controller e interfaccia con un trasporto simulato; la riproduzione reale è verificata in Chromium. La prova finale dei tre file su Safari/iPhone resta quindi necessaria quando saranno disponibili.

Riferimenti tecnici consultati: [decodifica immagini](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode), [restrizioni di autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay).
