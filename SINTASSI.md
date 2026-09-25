# La sintassi dei file

Due tipi di file, tutti e due markdown normale: il diario di una classe e un mazzo di
slide.

## Il diario di una classe — `sito/<classe>/lezioni.md`

```markdown
# 3A

Matematica e fisica — una riga di presentazione, se serve.

## 2026-09-21 — Vettori nel piano

Testo libero: promemoria, argomenti, quello che si vuole.

### Link
- [I vettori su Math Rocks](https://mporfido.github.io/math-rocks/)
- [Scheda di ripasso](https://example.org/scheda.pdf)

### Slide
- [Esercizi sui vettori](../slides/?deck=2026-09-21-3A)

### A casa
- Esercizi 12–18 di pagina 45
- [Quiz di autovalutazione](https://example.org/quiz)
```

Le regole sono poche:

- **`#`** è il nome della classe, e il paragrafo che lo segue la sua presentazione.
- **`##` è un giorno di lezione.** La data si scrive `2026-09-21` (anche `21/09/2026`
  va bene) e, dopo un trattino, ci può essere il titolo del giorno. In pagina diventa
  *lunedì 21 settembre 2026 — Vettori nel piano*.
- **`###` apre una sezione dentro il giorno.** Ne sono riconosciute tre, con qualche
  sinonimo perché scrivendo di fretta non si ha voglia di ricordarsi la parola esatta:
  - materiale → `Link`, `Link utili`, `Materiale`, `Risorse`
  - slide → `Slide`, `Slides`, `Presentazione`
  - compiti → `A casa`, `Casa`, `Compiti`, `Per casa`
  Un titolo diverso da questi funziona lo stesso: diventa una sezione con quel nome.
- **Quello che scrivi prima della prima `###`** è la nota del giorno.
- **Una sezione vuota, o che non c'è, non compare in pagina.** Un giorno con la sola
  data compare con la data e basta.
- I giorni si scrivono nell'ordine che si vuole: in pagina escono comunque dal più
  recente. Il giorno di oggi è segnato in rosso.
- Le formule si scrivono fra dollari: `$x^2$` in riga, `$$...$$` a blocco.

## Un mazzo di slide — `sito/slides/AAAA-MM-GG-<classe>.md`

```markdown
# Vettori nel piano

3A · 21 settembre

---

## Che cos'è un vettore

- da dove parte
- quanto è lunga
- dove punta

---

## Le componenti

$$\vec{v} = (v_x,\ v_y)$$
```

- **Una riga di soli trattini (`---`) separa una slide dalla successiva.**
- Il titolo del mazzo è il primo titolo della prima slide.
- Il nome del file dice giorno e classe: da lì il visualizzatore ricava il link per
  tornare a quel giorno del diario. Va rispettato: `2026-09-21-3A.md`.
- Il link da mettere nel diario è `../slides/?deck=2026-09-21-3A`.
- In proiezione: freccia destra o barra spaziatrice per andare avanti, freccia sinistra
  per tornare indietro, `F` per lo schermo intero. Sul telefono o sul tablet si tocca la
  metà destra o sinistra dello schermo. Il numero della slide resta nell'indirizzo:
  ricaricando la pagina si riprende da lì.

## Il link a una lezione sola

Dentro la pagina di una classe ogni data è cliccabile: si apre quel giorno da solo,
senza gli altri — comodo da mandare a chi era assente.

L'indirizzo si può anche scrivere a mano, mettendo la data dopo la classe:

```
https://mporfido.github.io/lezioni/4BLS/2026-09-23
```

Va bene anche `23-09-2026`. In casa, servendo la cartella `sito/` in locale, la forma
corta non funziona (la traduce `404.html`, che solo GitHub Pages usa): lì si scrive
`4BLS/?giorno=2026-09-23`, che è esattamente ciò che la pagina legge.
