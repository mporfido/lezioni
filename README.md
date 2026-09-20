# lezioni

Il diario delle lezioni, una pagina per classe, pubblicato su
<https://mporfido.github.io/lezioni>.

In classe si apre `mporfido.github.io/lezioni/<classe>` e si trova l'elenco dei giorni,
dal più recente: per ogni giorno le note, il materiale, le slide e i compiti — solo le
parti che ci sono davvero.

## Com'è fatto

Tutto quello che finisce online sta in `sito/`. Non c'è nessuna compilazione: i file
markdown che stanno nel repo sono esattamente quelli che il browser scarica e impagina,
quindi quello che si vede in locale è quello che si vede pubblicato.

```
sito/
├── index.html          elenco delle classi
├── classi.json         quali classi esistono (nome, descrizione, colore)
├── <classe>/
│   ├── index.html      copia identica di veste/modello-classe.html
│   └── lezioni.md      IL FILE DA SCRIVERE: i giorni di lezione di quella classe
├── slides/
│   ├── index.html      il visualizzatore
│   └── AAAA-MM-GG-<classe>.md   un mazzo di slide
└── veste/              grafica e impaginazione (tema, font, script)
```

La veste grafica è quella di [math-rocks](https://github.com/mporfido/math-rocks): il
file `veste/tema.css` e i font sono copiati da lì tali e quali, così i due siti si
somigliano. Per cambiare aspetto si tocca quel file.

La sintassi dei file markdown è descritta in [SINTASSI.md](SINTASSI.md).

## Come si pubblica

Si fa `git push` e basta: una GitHub Action prende la cartella `sito/` e la pubblica.
Un paio di minuti dopo il sito è aggiornato.

Una volta sola, alla creazione del repo su GitHub: **Settings → Pages → Source:
GitHub Actions**. Senza quella spunta l'Action gira ma non pubblica niente.

## Aggiungere una classe

1. si crea `sito/<classe>/` e ci si copia dentro `sito/veste/modello-classe.html`
   col nome `index.html`;
2. si aggiunge la classe in `sito/classi.json`;
3. si scrive `sito/<classe>/lezioni.md`.

Il file `index.html` di una classe è sempre uguale: capisce da solo di che classe si
tratta guardando il nome della cartella.

## Guardarlo in locale prima di pubblicare

```
cd sito && python3 -m http.server 8777
```
e poi <http://localhost:8777>. Aprire i file col doppio clic non funziona: le pagine
scaricano i markdown, e il browser lo permette solo da un server.
