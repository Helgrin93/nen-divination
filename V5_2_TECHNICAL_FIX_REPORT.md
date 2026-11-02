# V5.2 — correzioni tecniche applicate

Intervento locale del 2 novembre 2026 sulla V5.1 già presente nel working tree. Nessun commit, push, merge o deploy eseguito. Le modifiche precedenti sono state conservate; il confronto usa una copia dei file all'inizio della V5.2, non il vecchio commit precedente alla V5.1.

**Bordo del bicchiere.** Il difetto segnato nello screenshot dipendeva dal compositore statico, non da un secondo asset del calice. La correzione precedente trasformava in grigio i pixel caldi dentro una corona ellittica approssimata: anche alcuni pixel del vecchio sfondo ocra diventavano un arco grigio sovrapposto. Il raccordo interno sfumato lasciava inoltre una sottile fascia ocra, e il margine della maschera non comprendeva tutto l'antialias del bordo superiore sinistro.

In `GlassComposition.js` la correzione ora stima, per ogni riga, il colore del fondale originale dai due estremi liberi del ritaglio. La componente calda trasmessa viene sostituita con il colore dello sprite realmente dietro al vetro. I pixel neutri e freddi di contorno e riflessi non ricevono la vecchia conversione grigia. I campioni originali sono immutabili durante il calcolo, così l'uscita sul lato sinistro non influenza il riferimento del lato destro. La corona indica soltanto dove può operare la correzione; non viene disegnata come una nuova linea.

È stato incluso il piccolo margine antialias del labbro, circa 2,6 pixel nativi in più ai lati, ed eliminato il raccordo interno che conservava la striscia ocra. Il test con un fondale sintetico verifica che entrambi i lati trasmettano il colore dello sprite, che l'inchiostro neutro rimanga intatto e che non ricompaiano linguette rettangolari. Il confronto fotografico conferma la rimozione dell'arco aggiunto e della fascia ocra nell'area segnata. Sagoma `glassOutline`, coordinate del calice, acqua, foglia e proporzioni restano invariati.

**Altri controlli grafici.** Nei fotogrammi esaminati non sono emersi ulteriori difetti oggettivi da ritoccare su gomiti, zone sotto le maniche, raccordi della stanza, tavolo o pavimento. Non sono stati modificati PNG, sprite, colorimetria, fondali o CSS della scena. I quattro sprite di Wing, la panoramica della stanza, gli atlanti Nen, logo e favicon sono identici byte per byte alla V5.1 iniziale. Non sono stati usati strumenti di generazione immagini in questa fase: il problema individuato era nel codice di composizione.

**Titolo del browser.** L'HTML iniziale e l'aggiornamento eseguito da `translate()` usano entrambi esattamente:

`HxH - Nen Divination Test`

L'header continua a mostrare logo Hunter × Hunter e `Nen Divination Test`. Il test verifica anche il titolo dopo cambio IT/EN e ingresso nel quiz. Nessuna modifica a logo, favicon o selettore lingua.

**File interessati dalla sola V5.2.**

| File | Cambiamento rispetto alla V5.1 iniziale |
| --- | --- |
| `src/components/GlassComposition.js` | Trasmissione del fondale e margine antialias della correzione statica del vetro. |
| `index.html` | Titolo della scheda aggiornato. |
| `src/main.js` | Una sola modifica: lo stesso titolo in `translate()`. Nessuna modifica a flusso, dialoghi o timer. |
| `e2e/v52-polish.spec.js` | Regressione sul titolo e prova del materiale del bordo. |
| `e2e/v51-polish.spec.js` | Il controllo delle linguette comprende il piccolo margine antialias corretto; resta vietato dipingere fuori da tale supporto. |
| `.gitignore` | Esclude catture e filmati locali V5.2. |
| `scripts/review-v52.mjs`, `scripts/inspect-v52-glass.mjs` | Confronti del flusso e separazione dei livelli del calice. |
| `scripts/review-v52-animations.mjs` | Catture, filmati e misure delle animazioni attuali; non ne cambia il codice. |
| `scripts/verify-v52-evidence.mjs` | Confronto con la copia V5.1 e verifica delle gallerie. |
| `docs/v5.2/` | Confronto, galleria e dati di conservazione. |
| `V5_2_CREATIVE_REVIEW.md` | Inventario dei dialoghi, proposte bilingui e revisione separata delle sei animazioni. |

**Verifiche.**

| Verifica | Esito |
| --- | --- |
| `npm.cmd test` | 29 test unitari superati, 6 file. |
| Browser: vetro V5.2, titolo, controlli V5.1, rendering, sei effetti e dialoghi su Chrome desktop e WebKit 390×844 | 45 test superati; 1 skip previsto del confronto PNG della Specializzazione su WebKit. |
| `npm.cmd run build` | Produzione compilata correttamente. |
| `npm.cmd run test:build` | Flusso desktop/mobile, immagini e download PNG verificati sotto `/nen-divination/`. |
| Catture prima/dopo | 1920×1080, 1440×900, 390×844, 375×667; aggiunto 1920×912 per il dettaglio vicino allo screenshot fornito. |
| Controllo dei file rispetto alla copia V5.1 | 95 file conservati esattamente; le sole modifiche di `main.js` e `index.html` sono quelle del titolo. Nessun testo o codice delle animazioni modificato. |
| Confronto e galleria | Tutte le scelte di viewport/stato, i fotogrammi e i metadati dei 12 filmati caricati correttamente. |
| `git diff --check` | Superato. |

I test confermano inoltre che i commenti brevi durano ancora tre secondi, i dialoghi importanti aspettano Continua, Wing rimane decodificato durante le sostituzioni e i sei effetti mantengono pausa, seek, riproduzione e stato finale. I fotogrammi approvati della Specializzazione coincidono fuori dalla sola correzione statica del vetro.

Aprire [il confronto prima/dopo](docs/v5.2/confronto.html) o [le animazioni attuali](docs/v5.2/animations.html) dal server locale. I 72 screenshot del flusso e i ritagli aggiuntivi del vetro restano locali. Le animazioni hanno 120 immagini fra schermate e dettagli, più tavole riassuntive e 12 filmati. [Dati di conservazione](docs/v5.2/preservation.json).

**Cosa resta da decidere.** La ripetizione dell'istruzione prima della divinazione è ancora presente perché la tua Fase B richiede l'approvazione del nuovo testo e del flusso. Anche i commenti di tre secondi restano invariati: il documento creativo propone 1,5–1,9 s per frase oppure 2,0 s fissi. La reazione sul sapore dolce ha solo 0,48 s di lettura nel flusso attuale; la proposta L1 affronta questo punto senza cambiare le durate delle animazioni. Non sono stati implementati nuovi dialoghi, nuove traduzioni o ritocchi artistici degli effetti.

Le verifiche mobile usano viewport, tocco e browser emulati; le misure con CPU rallentata 4× non costituiscono prove su smartphone fisici. Nei confronti ispezionati il difetto del bordo segnato non è più visibile; le decisioni narrative e artistiche rimangono intenzionalmente aperte nella [revisione creativa](V5_2_CREATIVE_REVIEW.md).

**Aggiornamento successivo — favicon richiesta dall'utente.** La X rossa è stata sostituita, su richiesta esplicita successiva alla Fase A, dal simbolo nero con centro rosso mostrato nel nuovo riferimento. La sagoma geometrica è riprodotta in `public/favicon.svg`; i PNG 16, 32, 180 e 192 derivano da quel vettore. I collegamenti hanno una versione per rinnovare la cache del browser. Il titolo della scheda e il logo nell'header sono conservati. `scripts/prepare-favicon.mjs` rigenera i formati; la preparazione precedente degli asset ora lo riusa, evitando di ripristinare la vecchia X. I dati di conservazione e i 95 file invariati riportati sopra si riferiscono alla Fase A precedente a questa nuova richiesta.
