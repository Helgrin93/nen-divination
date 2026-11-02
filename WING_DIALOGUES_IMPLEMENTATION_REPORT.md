# Dialoghi definitivi di Wing

Implementazione locale del 2 novembre 2026, basata sulle tabelle IT/EN approvate dall'utente. Nessun commit, push o merge eseguito per questa revisione.

## Comportamento

- Testi e punteggiatura delle 18 battute conservati esattamente nelle due lingue. La fixture `e2e/fixtures/wing-dialogues-approved.json` contiene la tabella di riferimento.
- Flusso: ultima domanda ed eventuali bonus → unico dialogo 10 → Continua → concentrazione → divinazione → conclusione → risultato. La vecchia transizione e la seconda vignetta di concentrazione sono eliminate.
- Il dialogo 10 riutilizza la composizione `.interlude` della precedente transizione, senza modificare gli stili. Durante la concentrazione resta il comando «Tieni premuto» con i controlli accessibili esistenti.
- Commenti occasionali 2–6: 2.000 ms, anche cambiando lingua. Dialoghi importanti ancora in attesa di Continua; concentrazione ancora di 4,5 secondi.
- Le osservazioni seguono l'avvio dei fenomeni nel renderer esistente. La Trasmutazione passa dall'osservazione alla scoperta dopo 2 secondi, nella stessa schermata e senza alterare la durata dell'effetto. Nessuna categoria anticipata nelle battute.

## File applicativi

| File | Modifica |
| --- | --- |
| `src/data/translations.js` | Battute IT/EN approvate; eliminazione delle vecchie istruzioni duplicate. |
| `src/components/divinationTimeline.js` | Solo testi delle osservazioni IT/EN; timeline invariata. |
| `src/game/stateMachine.js` | Stato esplicito dell'unica introduzione e ingresso protetto nella concentrazione. |
| `src/game/wingDialogue.js` | Durata dei commenti e scelta della battuta secondo il fenomeno in corso. |
| `src/main.js` | Sequenza delle schermate, controlli di concentrazione e aggiornamento sincronizzato delle battute. |

## File di verifica

- `src/tests/navigation.test.js`: percorsi 7/8/9 e transizioni protette.
- `src/tests/wingDialogue.test.js`: corrispondenza esatta delle frasi e sincronizzazione.
- `e2e/approved-dialogues.spec.js`: IT/EN, percorsi 7/8/9, stile responsive, concentrazione, durata esatta di ciascuna reazione e sei fenomeni.
- `e2e/fixtures/wing-dialogues-approved.json`: testi definitivi di riferimento.
- `e2e/app.spec.js`, `e2e/v4-dialogue.spec.js`, `e2e/divination-effects.spec.js`: aspettative aggiornate ai testi e ai 2 secondi approvati.

## Parti preservate

Confronto con HEAD `b7665b2`: nessuna modifica ad asset pubblici, CSS, sprite, stanza, bicchiere, mani, header, domande, punteggi, radar, scheda risultato, esportazione o condivisione. Il codice della timeline precedente all'oggetto dei dialoghi è identico. Renderer e timer della concentrazione invariati.

## Verifiche

- `npm.cmd test`: 32 test superati in 7 file.
- `npx.cmd playwright test e2e/approved-dialogues.spec.js --workers=2`: 119 test superati su desktop, tablet, mobile, small-mobile, mobile-webkit, small-mobile-webkit e android. Tutti i percorsi IT/EN da 7/8/9 domande, i cinque commenti e i sei fenomeni verificati su ciascun profilo.
- `npm.cmd run build`: build completata.
- `npm.cmd run test:build`: produzione verificata su desktop e mobile sotto `/nen-divination/`, caricamento asset e download PNG riusciti.
- Suite di regressione desktop (`app`, `v4-dialogue`, `divination-art`, `divination-effects`): 16 test superati, inclusi hold reale, salvataggio, condivisione, replay e conservazione grafica degli effetti.
- Controllo `git diff --check`: superato.

Le immagini di controllo sono locali in `.verification/` e non sono incluse nei file da pubblicare.
