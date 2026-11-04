# Nen Divination — V4

Esperienza bilingue IT/EN ispirata alla prova dell’acqua di *Hunter × Hunter*: incontro con Wing, sette domande, fino a due bonus adattive, concentrazione di **4,5 secondi**, sei reazioni e risultato condivisibile. Vite, JavaScript, SVG e Canvas 2D; nessun backend, account o chiave API.

Questa V4 si trova sul branch locale **`final-polish-v4`**. `main` è conservato alla versione approvata; non sono stati eseguiti push, merge o deploy. La scena superiore del risultato conserva mani, calice e inquadratura esistenti; il renderer del Potenziamento corregge il livello dell’acqua e il trabocco.

## Avvio e prova locale

Richiede Node.js **22.12+**. Ambiente di verifica: Node.js 24 su Windows.

```powershell
npm.cmd ci
npm.cmd run dev
```

Aprire l’URL indicato da Vite, normalmente [http://localhost:5173/](http://localhost:5173/). Su altri sistemi si può usare `npm` senza `.cmd`. In PowerShell non occorre modificare la Execution Policy.

Due pagine di review consentono di valutare la grafica senza ripetere il quiz:

- [Risultati](http://localhost:5173/review/results.html): sei Nen, IT/EN, radar, tre personaggi più due espandibili, PNG e Story.
- [Divinazioni](http://localhost:5173/review/divination.html): sei effetti, play/pausa/replay, seek, frame 0/25/50/75/100%, dettaglio calice e inquadratura risultato.

Le review e i riferimenti restano fuori dalla build pubblica. Specifica applicata: [mandato V4](NEN_DIVINATION_V4_CODEX/NEN_DIVINATION_FINAL_POLISH_V4.md). Esiti e confronti: [V4_FINAL_REPORT.md](V4_FINAL_REPORT.md); inventario: [V4_CLEANUP_AUDIT.md](V4_CLEANUP_AUDIT.md).

Per provare su telefono, collegare PC e dispositivo alla stessa rete e aprire l’indirizzo **Network** mostrato da Vite. Il server usa già `--host 0.0.0.0`. Se necessario autorizzare Node nel firewall della rete privata. `localhost` sul telefono indica il telefono stesso.

## Flusso e comandi

La lingua non modifica domande, ordine delle risposte o punteggi. Indietro conserva le scelte; cambiando una risposta precedente vengono ricalcolate le eventuali bonus.

Le brevi reazioni di Wing sono vignette separate di circa tre secondi, senza pulsante skip. Le spiegazioni di bonus, concentrazione e rivelazione aspettano **Continua**. La quarta risposta ha sempre una reazione; Wing e il canvas rimangono montati durante il quiz.

La concentrazione supporta dito, mouse sinistro, **Spazio** e **Invio**. Rilascio anticipato, cancellazione del puntatore, perdita del focus o cambio scheda azzerano il progresso. È disponibile **Rivela senza tenere premuto**. Le opzioni restano bianche con lettere A–D; le domande lunghe e le risposte su piccoli schermi scorrono senza bloccare la pagina. Il movimento ridotto segue le preferenze di sistema.

Il radar ha posizioni fisse: dall’alto, in senso orario, **Enhancement → Transmutation → Conjuration → Specialization → Manipulation → Emission**. Medaglioni, kanji e colori non ruotano con il risultato. I valori provengono dai punteggi reali del quiz: affinità relative normalizzate fra 20 e 100, senza somma obbligata a 100 e senza equivalenza con l’efficienza canonica dell’aura.

## Salvataggio, Instagram e link

- **Salva risultato**: PNG 1080×1350.
- **Condividi**: file PNG con Web Share, se disponibile; altrimenti download. L’annullamento viene rispettato.
- **Salva Story 9:16**: composizione dedicata 1080×1920, radar, descrizione breve e soltanto i tre personaggi iniziali. Le due card espanse non entrano nell’export.
- **Copia link al quiz**: copia `https://helgrin93.github.io/nen-divination/`; se il browser nega la clipboard, mostra un campo selezionabile per la copia manuale.

Su Instagram aggiungere lo **sticker Link** nell’editor della Story e incollare il link. Un PNG non contiene collegamenti cliccabili; il sito non pubblica automaticamente su Instagram. La condivisione nativa e la clipboard dipendono dal browser, dai permessi e dal contesto HTTPS; il download resta disponibile in HTTP locale.

I tre personaggi esportati conservano nomi e testi. **I ritratti privi di permesso verificato sono omessi dalla Story**. Il renderer può includere un ritratto autorizzato, purché l’host consenta CORS: timeout, HTTP non immagine e rifiuti CORS producono una card testuale senza compromettere il PNG. Non viene stampato un avatar sostitutivo.

## Immagini esterne, fonti e permessi

Il catalogo contiene **30 identità, cinque per Nen**, con mapping editoriale approvato, descrizioni IT letterali e traduzioni EN statiche. `src/data/characterImages.json` registra ID, pagina fonte, URL, verifica tecnica e stato dei permessi. Tenrai identifica il ritratto; nessuna API decide la categoria Nen.

Le 18 copie locali preesistenti sono conservate per lo sviluppo. I 12 ritratti aggiunti vengono referenziati all’origine, senza nuove copie nel runtime. La build pubblica esclude le copie non autorizzate e usa gli URL remoti tracciati. Questo mantiene una dipendenza dalla disponibilità dell’host; errori 403/404 o rete assente lasciano leggibili nome e tecnica, con stato esplicito dell’immagine mancante.

**Disponibilità tecnica e permesso di pubblicazione sono distinti.** Tutti i 30 URL sono stati verificati nel browser, ma non è disponibile una licenza per ripubblicare le illustrazioni. I [termini Tenrai, §§3 e 6](https://tenrai.org/terms) non concedono diritti sui contenuti di terzi. Prima di pubblicare, ottenere i permessi dai titolari o sostituire i ritratti con immagini autentiche autorizzate; in alternativa pubblicare le sole schede testuali con link alla fonte.

Per integrare un’immagine autorizzata, aggiornare `portraitSrc`, `permissionStatus: 'authorized'`, credito e prova del permesso nei dati del personaggio, conservando l’ID e la provenienza. Se si usa un file in `assets/characters/`, registrare l’autorizzazione anche nel corrispondente elemento di `characterImages.json`, usato dal filtro del bundle. Dopo un aggiornamento dei metadati ricontrollare questi campi. Verificare anche CORS per l’export. Non impostare lo stato `authorized` perché un URL risponde 200.

Aggiornamento metadati e controllo tecnico (con rete disponibile):

```powershell
npm.cmd run assets:characters
node scripts/audit-character-images.mjs
```

Lo script di audit non salva nuovi file immagine. Nessun ritratto canonico è generato con AI. Le pose Wing preesistenti hanno provenienza non documentata; la V4 le preserva e non ne attribuisce diritti inesistenti. Sorgenti e prompt degli effetti restano in `assets/scene/`.

## Colonna sonora

Sono inclusi tre brani:
**The World of Adventurers** al pianoforte per apertura e domande e il tema iniziale
di **Legend of the Martial Artist** al flauto per la divinazione contemplativa.
**Hyōri Ittai**, ending degli Yuzu, accompagna la scheda finale con il primo
minuto del video scelto dall'utente, elaborato per rimuovere la voce.
Le prime due tracce sono cover campionate. Il finale conserva la registrazione
strumentale del riferimento: non è una cover e può contenere residui vocali
o artefatti della separazione.

Con Vite avviato, [lo studio musicale](http://localhost:5173/review/audio.html)
consente di ascoltare, confrontare e scaricare i tre brani senza completare il quiz.
Gli MP3 occupano circa 3,30 MB complessivi e rispettano le fasi, il volume e
il silenziamento già gestiti dall’app. La pagina d’ascolto rimane fuori dalla build.
Partiture, rigenerazione e provenienza: [documentazione audio](src/assets/audio/README.md).

Dopo `npm.cmd run build`, `npm.cmd run test:audio` verifica i tre file effettivi
sotto `/nen-divination/`: decodifica, livelli, fasi, loop e mute/riavvio in Chromium.
Per i controlli dell’ascolto: `npx.cmd playwright test e2e/audio-review.spec.js --project=desktop --project=small-mobile`.
La prova audio su Safari/iPhone fisico resta da svolgere.

## Test e catture

```powershell
npm.cmd test
npm.cmd run test:simulation
npm.cmd run build
npm.cmd run test:build
npm.cmd run test:e2e
```

La prima volta installare i browser richiesti con `npx.cmd playwright install chromium webkit`. Su Windows i progetti Chromium usano Google Chrome installato; WebKit viene fornito da Playwright.

Vitest verifica banca domande, localizzazione, scoring, spareggi, bonus, navigazione, identità e testo approvato. La simulazione esercita 30.000 partite e 6.000 profili sintetici con seed indipendente. Playwright copre cinque progetti (desktop, tablet, mobile, piccolo mobile, WebKit mobile), flusso IT/EN, sei risultati, bonus 8/9, hold, immagini mancanti, persistenza della scena, radar, export, clipboard, DPR e movimento ridotto. Sono emulazioni: la verifica fisica finale su iOS Safari/Android Chrome e nell’editor Instagram resta da svolgere.

`test:build` serve la build sotto **`/nen-divination/`**, percorre il quiz ed esporta il PNG. Richiede accesso ai CDN per controllare anche le immagini remote; ambienti che bloccano la rete restituiscono un errore esplicito. Per una verifica locale con la cache dei ritratti preesistenti: `npm.cmd run build:review`, quindi `node scripts/verify-build.mjs --review`.

Con Vite avviato, `node scripts/review-v4.mjs --phase=final` rigenera frame iniziali/intermedi/finali, risultati desktop/mobile e due video delle sei sequenze. Catture grezze, log e video sono in `.verification/v4/`, ignorata da Git. Una selezione dei confronti è conservata in `docs/v4/`.

## Scoring e dati conservati

`questions_scoring.json` e `score_calibration.json` restano invariati. Vengono estratte una domanda per ciascuna delle sei aree e una settima da un’area uniforme. Domande e opzioni sono mescolate una volta per tentativo. Il punteggio centrato usa `sqrt(7/n)`, deviazioni standard e offset esistenti; gap fra prime due categorie ≤0,35 può attivare fino a due bonus discriminanti. Gli spareggi conservano conteggi dei pesi 3, poi 2, poi ID. La pressione attiva la rivelazione e non decide il risultato.

Le percentuali della simulazione descrivono un modello casuale, non la validità psicologica. `scoring_simulation_summary.json` rimane un documento storico, senza uso runtime.

## Build e futura pubblicazione

```powershell
npm.cmd run build
npm.cmd run preview
```

Aprire l’indirizzo indicato da Vite con il prefisso `/nen-divination/`. Non aprire `index.html` con doppio clic. La configurazione usa `/` in sviluppo e `/nen-divination/` in produzione.

Il workflow `.github/workflows/deploy-pages.yml` è conservato: pubblica **solo `dist/`** dopo un push su `main` o un avvio manuale. Per un futuro rilascio, il proprietario dovrà prima provare questo branch, risolvere i permessi delle immagini, approvare il merge e abilitare **Settings → Pages → GitHub Actions**. Nessuna di queste operazioni remote fa parte della consegna V4 locale.

## Privacy e offline

Nessuna analytics, account o cookie. Solo `lang=it|en` viene salvato in localStorage; risposte e risultato restano in memoria. Il quiz già caricato funziona offline, comprese rivelazione ed esportazione testuale. Non è presente un service worker: prima visita e ricaricamento richiedono server/rete o cache del browser.

In produzione e per i 12 ritratti aggiunti, il browser contatta il CDN MyAnimeList quando carica le immagini. Le immagini usano `referrerpolicy="no-referrer"`; l’host riceve comunque le informazioni tecniche necessarie alla richiesta. I link alla fonte vengono aperti su iniziativa dell’utente.

Fan project non ufficiale, senza affiliazione ai titolari di *Hunter × Hunter*. I dialoghi sono scritti per l’esperienza e non sono presentati come citazioni canoniche.
