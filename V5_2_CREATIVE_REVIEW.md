# V5.2 — revisione creativa da approvare

**Nessuna proposta di questo documento è stata applicata.** Restano attuali i dialoghi, i 3 secondi dei commenti brevi, la concentrazione da 4,5 secondi e tutte e sei le animazioni. Le sole modifiche immediate riguardano il vetro statico e il titolo della scheda browser.

Puoi mantenere ogni frase, scegliere una variante tramite il suo ID o scriverne una nuova. Se scrivi una frase italiana, ti proporrò prima la corrispondente traduzione inglese e attenderò la tua conferma prima di aggiornare l’app. Le proposte non modificano domande, punteggi o personaggi.

## Dialoghi dell’app attualmente pubblicabili

Testi estratti dai file reali <code>src/data/translations.js</code>, <code>src/components/divinationTimeline.js</code> e dalle chiamate in <code>src/main.js</code>. Le durate indicano il comportamento normale; con movimento ridotto gli effetti possono completarsi immediatamente per accessibilità.

| Momento / ID | Italiano attuale | Inglese attuale | Durata e avanzamento | Alternative da valutare |
| --- | --- | --- | --- | --- |
| D01 · Introduzione | Prima di iniziare, vorrei farti alcune domande. Rispondi sinceramente. | Before we begin, I’d like to ask you a few questions. Answer honestly. | Senza scadenza; Inizia / Start. | Mantieni. |
| D02 · Una delle cinque reazioni dopo la quarta risposta (interesting) | Oh, interessante… | Oh, interesting… | 3,00 s; avanzamento automatico, senza pulsante. | Mantieni; vedi proposta sui tempi. |
| D03 · Una delle cinque reazioni dopo la quarta risposta (understood) | Capisco… | I see… | 3,00 s; avanzamento automatico, senza pulsante. | Mantieni; vedi proposta sui tempi. |
| D04 · Una delle cinque reazioni dopo la quarta risposta (letsSee) | Vediamo… | Let’s see… | 3,00 s; avanzamento automatico, senza pulsante. | Mantieni; vedi proposta sui tempi. |
| D05 · Una delle cinque reazioni dopo la quarta risposta (curious) | Mh, curioso… | Hmm, curious… | 3,00 s; avanzamento automatico, senza pulsante. | D05-A / D05-B, facoltative. |
| D06 · Una delle cinque reazioni dopo la quarta risposta (veryGood) | Molto bene. | Very good. | 3,00 s; avanzamento automatico, senza pulsante. | Mantieni; vedi proposta sui tempi. |
| D07 · Prima della domanda bonus 8 | Le tue risposte sono piuttosto contrastanti. Vorrei farti ancora una domanda. | Your answers are quite mixed. I’d like to ask you one more question. | Senza scadenza; Continua / Continue. | D07-A / D07-B. |
| D08 · Prima della domanda bonus 9 | Ora capisco meglio. Vorrei chiarire un ultimo dettaglio. | I understand better now. One last detail. | Senza scadenza; Continua / Continue. | D08-A / D08-B, facoltative. |
| D09 · Transizione quiz → divinazione | Avvicina le mani al bicchiere e mantieni il Nen. | Bring your hands close to the glass and maintain your Nen. | Senza scadenza; Continua / Continue. | Scegli T1, T2 o T3 e flusso F1/F2. |
| D10 · Concentrazione: titolo + istruzione | Ora concentrati.<br>Avvicina le mani al bicchiere e mantieni il Nen. | Now focus.<br>Bring your hands close to the glass and maintain your Nen. | Attesa libera; completa con pressione continua di 4,5 s oppure comando accessibile. | Rimuovere la seconda istruzione nel flusso scelto; nessuna modifica già applicata. |
| D11 · Titolo della rivelazione e didascalia inferiore durante l’effetto | Osserva il bicchiere… | Watch the glass… | Per la durata dell’effetto: da 4,8 a 7,6 s. Nessun Continua durante l’animazione. | Mantieni il testo; W1 propone di mostrarlo in una sola posizione. |
| D12 · Reazione Potenziamento | Guarda il bordo: il volume dell’acqua sta aumentando. | Watch the rim. The volume of water is increasing. | 6,20 s, insieme all’animazione. | Mantieni. |
| D13 · Reazione Emissione | Il colore si diffonde nell’acqua. È una prova di Emissione. | The colour is spreading through the water. This is Emission. | 5,00 s, insieme all’animazione. | D13-A / D13-B, facoltative. |
| D14 · Trasmutazione, prima del 90% | L’acqua sembra la stessa. Aspetta… osserviamo con calma. | The water looks the same. Wait… let us watch carefully. | Da 0 a 4,32 s dell’animazione. | Mantieni. |
| D15 · Trasmutazione, dal 90% alla conclusione | È diventata dolce. Eppure l’aspetto è lo stesso. | It tastes sweet. Yet it looks the same. | Da 4,32 a 4,80 s: soltanto 0,48 s nell’app. Nello studio la frase resta anche dopo la fine. | D15-A / D15-B; proposta L1 per la leggibilità. |
| D16 · Reazione Materializzazione | Vedi quei piccoli residui? Si stanno formando dentro l’acqua. | See those tiny specks? They are forming inside the water. | 5,60 s, insieme all’animazione. | Mantieni. |
| D17 · Reazione Manipolazione | La foglia si muove e ruota: la tua aura ne guida il movimento. | The leaf is moving and turning. Your aura is guiding it. | 6,00 s, insieme all’animazione. | Mantieni. |
| D18 · Reazione Specializzazione | La foglia sta appassendo. Questa reazione indica la Specializzazione. | The leaf is withering. This reaction indicates Specialization. | 7,60 s, insieme all’animazione. | Mantieni; D18-A / D18-B soltanto se preferisci una spiegazione meno categorica. |
| D19 · Conclusione, prima del risultato | Ecco… La tua affinità Nen si è manifestata. | There… Your Nen affinity has revealed itself. | Senza scadenza; Continua / Continue porta al risultato. | D19-A / D19-B, facoltative. |

“Dopo la quarta risposta” significa tra la risposta alla domanda 4 e la visualizzazione della domanda 5: viene scelta **una sola** delle cinque battute D02–D06. Non appaiono tutte nella stessa partita. I bonus dipendono dall’esito del quiz e attendono sempre Continua.

## Alternative IT/EN facoltative

Le righe non elencate possono restare come sono. A e B sono scelte alternative, non frasi da concatenare.

| ID | Italiano proposto | Inglese proposto | Motivo |
| --- | --- | --- | --- |
| D05-A | Curioso… | That’s curious. | Elimina l’interiezione iniziale. |
| D05-B | Una risposta interessante. | An interesting answer. | Tono misurato, senza giudicare la risposta. |
| D07-A | Vorrei capire meglio la tua affinità. Ancora una domanda. | I’d like to understand your affinity better. One more question. | Evita di definire le risposte contrastanti. |
| D07-B | Ho bisogno di un altro dettaglio. Ti farò una domanda in più. | I need one more detail. I’ll ask you one more question. | Spiega il bonus senza presentarlo come errore del giocatore. |
| D08-A | Un’ultima domanda, per chiarire. | One last question, to make things clearer. | Più breve. |
| D08-B | Vorrei verificare un ultimo dettaglio. | I’d like to check one last detail. | Mantiene la calma di Wing. |
| D13-A | L’acqua sta cambiando colore. È Emissione. | The water is changing colour. That’s Emission. | Più diretto di “una prova di Emissione”. |
| D13-B | Osserva il colore dell’acqua: sta cambiando. | Watch the colour of the water. It’s changing. | Solo osservazione; il nome del tipo viene spiegato nel risultato. |
| D15-A | La variazione è nel sapore, non nell’aspetto. | The change is in the taste, not the appearance. | Spiega perché l’acqua non cambia colore, senza suggerire un gesto di assaggio assente dalla scena. |
| D15-B | L’acqua è rimasta limpida. È il sapore a essere cambiato. | The water has stayed clear. Its taste has changed. | Alternativa esplicativa, da lasciare leggere con L1. |
| D18-A | Una reazione insolita. È Specializzazione. | An unusual reaction. That’s Specialization. | Non presenta l’appassimento come unica reazione possibile della categoria. |
| D18-B | La foglia si sta sfaldando. Questa reazione è diversa dalle altre. | The leaf is breaking apart. This reaction is different from the others. | Descrizione del fenomeno visibile. |
| D19-A | Ecco. Ora possiamo vedere il risultato. | There. Now we can see the result. | Conclusione meno solenne. |
| D19-B | Ora è chiaro. Vediamo la tua affinità Nen. | It’s clear now. Let’s look at your Nen affinity. | Collega la prova alla scheda finale. |

## Una sola introduzione alla divinazione

La ripetizione è confermata: D09 usa <code>focus</code>, poi D10 visualizza <code>focusTitle</code> **e di nuovo <code>focus</code>**. Non è un problema delle immagini. Ecco tre formulazioni complete, ancora da scegliere:

| ID | Italiano proposto | Inglese proposto |
| --- | --- | --- |
| T1 | Ora proviamo con l’acqua. Avvicina le mani al bicchiere e mantieni il Nen. | Now let’s try the water test. Bring your hands close to the glass and maintain your Nen. |
| T2 | Avvicina le mani al bicchiere. Concentrati e lascia fluire il Nen. | Bring your hands close to the glass. Focus and let your Nen flow. |
| T3 | È il momento della prova dell’acqua. Avvicina le mani e concentrati. | It’s time for the water test. Bring your hands close and focus. |

**F2 — proposta consigliata:** una sola schermata di concentrazione mostra la frase scelta e il controllo “Tieni premuto”. Si elimina il passaggio intermedio con Continua. Il testo si legge prima di iniziare la pressione, senza scadenza; la prova richiede gli stessi 4,5 secondi. Non si aggiunge una seconda vignetta con la stessa istruzione.

**F1 — alternativa che conserva Continua:** la frase scelta compare una volta nella transizione con Continua. Dopo il clic rimangono soltanto comando, avanzamento e alternativa accessibile; niente seconda vignetta “Ora concentrati” con istruzione ripetuta.

La scelta della frase e quella del flusso sono indipendenti: per esempio puoi chiedere “T3 + F1”. Se preferisci un testo tuo, scrivilo e preparo l’inglese prima di applicarlo.

**W1, facoltativa:** durante la rivelazione D11 è duplicata nel titolo della vignetta e nella didascalia inferiore. Si può mantenere una sola occorrenza senza cambiare la frase. Anche questo resta da approvare.

**L1, consigliata per la leggibilità:** D15 compare al 90% di 4,8 s e nell’app viene sostituita dopo appena **0,48 s** dalla conclusione generica D19. Propongo di lasciarla come conclusione della sola Trasmutazione, con Continua, invece di sostituirla subito con D19. Nessuna modifica ai 4,8 s dell’animazione o ai 4,5 s di concentrazione; nessuna battuta supplementare. Nello studio animazioni D15 resta già visibile dopo la fine: questo studio non riproduce il problema di lettura del flusso principale.

## Tempi dei commenti brevi e regia

Il codice imposta <code>dialogueDeadline = performance.now() + 3000</code>. Un cambio lingua conserva la scadenza e non riavvia i tre secondi. Proporrei tempi per frase, controllati sulla più lunga delle due lingue:

| ID | Battuta attuale | Ora | Proposta |
| --- | --- | --- | --- |
| D02 | Oh, interessante… / Oh, interesting… | 3,0 s | 1,9 s |
| D03 | Capisco… / I see… | 3,0 s | 1,5 s |
| D04 | Vediamo… / Let’s see… | 3,0 s | 1,5 s |
| D05 | Mh, curioso… / Hmm, curious… | 3,0 s | 1,7 s |
| D06 | Molto bene. / Very good. | 3,0 s | 1,7 s |

Alternativa semplice: **2,0 s per tutte e cinque**. Per una tua eventuale frase più lunga ricalcolerei il tempo; non applicherei automaticamente il minimo di 1,5 s. Introduzione, bonus, transizione e conclusione restano senza scadenza e richiedono il comando previsto. Nessuna riduzione delle animazioni o della concentrazione.

La regia attuale mantiene una o due espressioni silenziose: una fra le domande 2–4, e talvolta una fra 6–7. La selezione usa casualità separata dal quiz e viene ricordata tornando indietro o cambiando lingua. La battuta testuale resta occasionale, dopo la quarta risposta. Propongo di conservare questo comportamento e di non introdurre commenti per ogni cambio di espressione.

## Testi di interazione e didascalie, distinti dalle battute

Sono inclusi per evitare omissioni; non propongo di riscriverli.

| Momento / ID | Italiano attuale | Inglese attuale | Durata e avanzamento | Proposta |
| --- | --- | --- | --- | --- |
| U01 · Pulsante pronto | Tieni premuto | Press and hold | Nessuna scadenza; avvia la pressione. | Mantieni. |
| U02 · Durante la pressione | Mantieni la concentrazione… | Maintain your focus… | Da 0 a 4,5 s; presente anche nell’annuncio accessibile. | Mantieni. |
| U03 · Istruzione accessibile | Tieni premuto per 4,5 secondi con il dito, il mouse o la barra spaziatrice. | Hold for 4.5 seconds using your finger, mouse or space bar. | Descrizione associata al controllo, non una vignetta aggiuntiva. | Mantieni. |
| U04 · Rilascio anticipato | Riprova a concentrarti. | Try focusing again. | Annuncio accessibile; il pulsante torna a U01. | Mantieni. |
| U05 · Comando alternativo | Rivela senza tenere premuto | Reveal without holding | Rivelazione immediata senza gesto prolungato. | Mantieni. |
| R-enhancement · Didascalia nel risultato: Potenziamento | Il livello dell’acqua sale, fino a traboccare leggermente dal bordo. | The water level rises, gently spilling over the rim. | Resta nel risultato; nessun timer. | Mantieni. |
| R-emission · Didascalia nel risultato: Emissione | L’acqua cambia colore, assumendo una sfumatura rosata, mentre il vetro rimane trasparente. | The water turns a warm rose colour while the glass stays clear. | Resta nel risultato; nessun timer. | Mantieni. |
| R-transmutation · Didascalia nel risultato: Trasmutazione | Il sapore è cambiato: l’acqua è diventata dolce, pur rimanendo limpida. | The taste has changed: the water is sweet, yet remains clear. | Resta nel risultato; nessun timer. | Mantieni. |
| R-conjuration · Didascalia nel risultato: Materializzazione | Minuscoli residui si materializzano nell’acqua; alcuni restano sospesi, altri si depositano lentamente. | Tiny impurities form inside the water; some remain suspended while others slowly settle. | Resta nel risultato; nessun timer. | Mantieni. |
| R-manipulation · Didascalia nel risultato: Manipolazione | La foglia si muove e ruota sulla superficie dell’acqua. | The leaf moves and rotates across the surface of the water. | Resta nel risultato; nessun timer. | Mantieni. |
| R-specialization · Didascalia nel risultato: Specializzazione | La foglia appassisce, si scurisce e si sfalda nell’acqua. | The leaf withers, darkens and breaks apart in the water. | Resta nel risultato; nessun timer. | Mantieni. |

Nel file delle traduzioni esistono anche testi **non chiamati dal flusso attuale**. La loro presenza non significa che l’utente li veda:

| Chiave non usata | Italiano nel file | Inglese nel file |
| --- | --- | --- |
| instinct | Rispondi d’istinto. Non esistono risposte giuste o sbagliate. | Answer instinctively. There are no right or wrong answers. |
| interestingNote | Continuiamo. C’è ancora qualcosa che vorrei sapere. | Let’s continue. There is still something I would like to know. |
| revealTitle | L’acqua sta cambiando. | The water is changing. |
| bonus | UN ULTIMO SGUARDO ALLA TUA AURA | ONE LAST LOOK AT YOUR AURA |

Lo studio locale <code>review/divination.js</code> ha inoltre questi testi propri. Non sono i dialoghi della produzione e restano invariati:

| Momento nello studio | Italiano attuale | Inglese attuale |
| --- | --- | --- |
| Titolo iniziale concentrazione | Avvicina le mani al bicchiere. | Non localizzato in questo stato. |
| Istruzione iniziale concentrazione | Concentrati sull’acqua. Lascia che l’aura fluisca, senza forzare. | Non localizzato in questo stato. |
| Pulsante durante la pressione | Concentrati… | Non localizzato in questo stato. |
| Titolo durante l’effetto | Osserva l’acqua. | Watch the water. |
| Didascalia iniziale della Trasmutazione | L’acqua rimane limpida. Osserva le piccole increspature. | The water stays clear. Watch the tiny ripples. |

Le altre reazioni dello studio riusano D12–D18 e le didascalie R. I testi delle domande e le descrizioni delle card non rientrano nelle battute di Wing e non sono stati modificati.

## Revisione delle sei animazioni attuali

Apri [video e fotogrammi](docs/v5.2/animations.html), oppure [la tavola dei cinque istanti](docs/v5.2/animations/desktop-sheet.png). Per ogni effetto sono disponibili 0%, 25%, 50%, 75%, 100%, un filmato della riproduzione e la corrispondente cattura mobile. Sono anteprime dell’implementazione attuale, non simulazioni delle proposte.

Il confronto narrativo segue gli effetti che hai indicato nella specifica. Il [glossario ufficiale NTV](https://www.ntv.co.jp/hunterhunter/dictionary/index.html) conferma le sei categorie, il ruolo della divinazione dell’acqua e la natura residuale della Specializzazione. La sinossi ufficiale dell’[episodio 35](https://www.ntv.co.jp/hunterhunter/story/035.html) fornisce il contesto dell’allenamento con Wing; non descrive ogni singolo effetto. Il lettore VIZ del capitolo 60 ha rimandato all’indice in questa sessione: non presento quindi la revisione come verifica diretta di tutti i pannelli del manga. Il colore specifico, la quantità di residui e la coreografia sono scelte artistiche di questa app, non regole universali da dedurre dalle anteprime.

**N1 — Potenziamento, 6,2 s.** La superficie sale di 18 unità del compositore, circa 11,7 pixel nell’asset nativo; la foglia segue l’acqua. I 25 campioni della superficie sono piccoli passi di circa mezzo pixel nativo. Il traboccamento usa due flussi illustrati, cinque nascite di gocce e un’area umida che resta sul tavolo. L’effetto corrisponde all’aumento d’acqua richiesto, resta sobrio e conserva i riflessi. I getti sono sottili e sul telefono si leggono meno dei movimenti della superficie; non è stato osservato un distacco dal bordo nei campioni. La partenza e l’assestamento mantengono la composizione; le dissolvenze degli otto campioni di flusso possono far leggere il getto un po’ morbido. Conviene lasciarlo invariato; eventualmente valutare un solo breve richiamo di increspatura nel distacco delle gocce, senza aumentare quantità o luminosità.

**N2 — Emissione, 5,0 s.** Otto maschere di diffusione si fondono dentro la maschera dell’acqua, con foglia, linee del calice e riflessi ripristinati sopra. La variazione di colore è chiara e graduale, senza colorare l’intera stanza. Nel finale la tinta appare soprattutto rame/rosato caldo, influenzata dal tavolo; non è un rosa freddo. La propagazione è larga e morbida, più simile a un velo che a filamenti di inchiostro. Non è un difetto di fedeltà del test: conta il cambiamento di colore, non una tinta obbligatoria. Lasciarlo invariato è una buona scelta. Se vuoi una diffusione meno uniforme, si possono rivedere solo le opacità intermedie delle maschere, mantenendo il colore finale e i riflessi.

**N3 — Trasmutazione, 4,8 s.** Una piccola increspatura iniziale dura circa il primo 24%, poi l’acqua resta limpida. Questa discrezione rispetta l’idea di un cambiamento di sapore, che non richiede un nuovo colore. Non proporrei scintille o indicatori che lo facciano sembrare Emissione. Il passaggio al sorriso al 90% cambia la porzione di Wing vista attraverso il bordo: è lo sprite dietro il vetro, non un viraggio dell’acqua. Nella scena non esiste un gesto di assaggio: la frase attuale annuncia il dolce senza mostrarlo. Il punto da migliorare è soprattutto la lettura di D15, troppo breve nell’app; L1 risolve il problema narrativo senza cambiare l’animazione. Consiglio di conservare l’effetto visivo.

**N4 — Materializzazione, 5,6 s.** Sessantadue residui deterministici, distribuiti fra cinque famiglie e tre varianti, compaiono con tempi diversi; alcuni derivano e scendono. Le impurità restano nel calice grazie al ritaglio e ai riflessi ricomposti. Il gruppo a sinistra è più evidente e alcune sagome paiono piccoli frammenti, coerenti con lo stile anime ma meno fini della polvere. La distribuzione è leggibile anche su mobile. Il modello non calcola una collisione individuale con il fondo curvo: un residuo che supera la sagoma viene semplicemente ritagliato, anziché mostrare un appoggio fisico. Non si vedono particelle sul tavolo, ma il deposito potrebbe risultare più convincente. È il candidato più utile per un intervento circoscritto: fermare solo i residui che arrivano al fondo e smorzare la loro velocità, conservando numero, atlante e durata.

**N5 — Manipolazione, 6,0 s.** La foglia combina spostamento con tangenti cubiche, flessione e rotazione illustrate in 81 celle; le increspature nascono lungo il percorso. La foglia si muove nella superficie e nei campioni non esce dal calice. La direzione cambia con inerzia, senza una rotazione CSS applicata a un’immagine piatta. Gli 81 campioni in sei secondi equivalgono a circa 13 cambi di sagoma al secondo, mentre la posizione viene interpolata più spesso: nei dettagli la flessione può quindi risultare leggermente a scatti, anche se la deriva è continua. Questo può essere accettabile nel tratto anime. Solo se lo noti nel video, si può provare una fusione limitata delle pose adiacenti; il rischio è un doppio bordo semitrasparente. Consiglio di mantenere l’effetto, salvo tua preferenza esplicita per una flessione più continua.

**N6 — Specializzazione, 7,6 s.** Sei stati della foglia passano dal verde al bruno scuro, alla fragilità e alla disgregazione, con 23 frammenti animati, parte dei quali scende. Il passaggio è leggibile, il finale conserva residui e la foglia non ricompare. L’appassimento è la variante scelta per questa app, non un effetto che debba essere identico per ogni Specialista: questa è una conseguenza della categoria residuale descritta nel glossario. I frammenti sono stilizzati e alcuni restano presso la superficie; i campioni non mostrano un raddoppio persistente della foglia. L’effetto è già approvato e protetto dai fotogrammi di riferimento. Consiglio di lasciarlo invariato; un eventuale ritocco al solo rallentamento dei frammenti finali avrebbe beneficio modesto e rischio superiore rispetto agli altri candidati.

| Proposta | Miglioramento concreto, solo dopo approvazione | Impatto visivo previsto | Rischio | Conviene? |
| --- | --- | --- | --- | --- |
| N1-A | Increspatura locale sincronizzata con il distacco di una goccia, senza cambiare getti o durata. | Molto lieve, soprattutto nel dettaglio. | Basso–medio: ordine di sovrapposizione sul bordo. | Facoltativo; preferisco mantenere il Potenziamento. |
| N2-A | Ritoccare le opacità dei soli passaggi intermedi della diffusione. | Propagazione meno simile a un velo; finale uguale. | Medio: possibili bande o perdita di trasparenza. | Solo se il video attuale ti sembra troppo uniforme. |
| N3 | Nessuna modifica visiva; valutare L1 sul testo. | Stessa acqua limpida, reazione finalmente leggibile. | Basso sul testo; nessun intervento al renderer. | Sì a L1 come proposta, effetto da conservare. |
| N4-A | Smorzamento e arresto dei residui sul fondo interno, senza nuove particelle. | Deposito più credibile; differenza piccola ma osservabile. | Medio: interazione con sagoma curva e stabilità del seek. | Primo candidato, se desideri ancora un ritocco artistico. |
| N5-A | Fusione limitata fra pose della foglia adiacenti, solo durante le flessioni più rapide. | Flessione più continua; traiettoria uguale. | Medio: rischio doppio contorno. | Prova separata da confrontare; non necessaria. |
| N6-A | Smorzamento appena più graduale dei frammenti finali. | Minimo. | Medio–alto: può alterare l’effetto già approvato. | Sconsigliato; mantieni la Specializzazione. |

Non propongo laser, bagliori aggiuntivi, nuove particelle o rigenerazioni della scena. Qualunque candidato scelto richiederebbe un confronto circoscritto prima/dopo, preservando gli altri cinque effetti.

## Prestazioni e limiti della verifica

Misure di una riproduzione normale per ogni tipo su Chrome locale. Il profilo mobile usa viewport 390×844 e CPU rallentata 4×, con GPU e memoria del computer: non equivale a uno smartphone fisico. p95 è il valore sotto il quale cade il 95% dei campioni. Il costo di rendering non comprende il primo caricamento e tutta la preparazione degli asset; l’intervallo fra frame misura anche il ritmo della pagina.

| Effetto | Durata | Rendering p95 desktop | Rendering p95 mobile 4× | Frame p95 mobile | Frame mobile oltre 50 ms |
| --- | --- | --- | --- | --- | --- |
| Potenziamento | 6.2 s | 0.70 ms | 2.30 ms | 13.8 ms | 0 |
| Emissione | 5.0 s | 0.90 ms | 2.70 ms | 13.8 ms | 0 |
| Trasmutazione | 4.8 s | 0.40 ms | 1.50 ms | 7.2 ms | 1 |
| Materializzazione | 5.6 s | 0.80 ms | 3.50 ms | 14.1 ms | 0 |
| Manipolazione | 6.0 s | 0.50 ms | 1.90 ms | 7.2 ms | 0 |
| Specializzazione | 7.6 s | 0.60 ms | 2.30 ms | 13.8 ms | 0 |

Nei campioni non sono emersi errori JavaScript. I test verificano inoltre riproduzione, pausa, seek anche all’indietro, persistenza nel risultato e conservazione della Specializzazione fuori dalla correzione statica del vetro. Questo supporta la stabilità tecnica; il giudizio sul gusto artistico resta da discutere con te. [Misure complete](docs/v5.2/animations/metrics.json).

## Scelte da comunicare

Puoi rispondere con gli ID, per esempio: “Mantieni le altre frasi; D07-A; T2 + F2; tempi proposti; L1; nessuna modifica alle animazioni”. Oppure puoi modificare liberamente un testo. Nulla viene applicato automaticamente scegliendo una raccomandazione nel documento.

- Per le frasi: indica quelle da mantenere o un ID alternativo; puoi scrivere una versione italiana tua.
- Per la divinazione: scegli T1/T2/T3 e F1/F2, oppure un testo e un flusso differenti.
- Per i commenti brevi: tempi per frase, 2,0 s fissi o mantenimento dei 3,0 s.
- Per la Trasmutazione: approvazione o rifiuto di L1.
- Per le animazioni: mantieni tutte, oppure indica singolarmente N1-A, N2-A, N4-A, N5-A o N6-A. Le raccomandazioni non sono un’approvazione.
