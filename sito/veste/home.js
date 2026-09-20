/* ============================================================
   La home: l'elenco delle classi
   ============================================================
   Le classi sono quelle scritte in `classi.json`: per ognuna c'è una cartella
   con dentro il suo `lezioni.md`. Di ogni classe la home scarica il file per
   dire quante lezioni ci sono e qual è l'ultima — se il file non c'è ancora,
   la scheda compare lo stesso, senza il conteggio.
   ============================================================ */

async function riassumiClasse(slug) {
    try {
        const testo = await scaricaMarkdown(`${slug}/lezioni.md`);
        const date = testo.split('\n')
            .filter((riga) => riga.startsWith('## '))
            .map((riga) => leggiData(riga.slice(3)))
            .filter(Boolean)
            .sort((a, b) => b.data - a.data);
        if (!date.length) return '';
        const quante = `${date.length} lezion${date.length === 1 ? 'e' : 'i'}`;
        return `${quante} · ultima ${date[0].data.getDate()} ${MESI[date[0].data.getMonth()]}`;
    } catch (errore) {
        return '';
    }
}

async function mostraHome() {
    const configurazione = await leggiConfigurazione('classi.json');
    const contenuto = document.querySelector('.contenuto');
    document.title = configurazione.titolo || 'Lezioni';

    contenuto.innerHTML = `<h1 class="titolo">${configurazione.titolo || 'Lezioni'}</h1>` +
        (configurazione.sottotitolo ? `<p class="sottotitolo">${configurazione.sottotitolo}</p>` : '');

    const classi = configurazione.classi || [];
    if (!classi.length) {
        contenuto.insertAdjacentHTML('beforeend',
            '<div class="vuoto"><p>Nessuna classe ancora. Si aggiungono in <code>sito/classi.json</code>.</p></div>');
    } else {
        const griglia = document.createElement('div');
        griglia.className = 'classi';
        griglia.innerHTML = classi.map((classe) => `
            <a class="classe-card" href="${classe.slug}/"${classe.colore ? ` style="--classe-colore: ${classe.colore};"` : ''}>
                <h2>${classe.nome || classe.slug}</h2>
                ${classe.descrizione ? `<p>${classe.descrizione}</p>` : ''}
                <p class="quante" data-classe="${classe.slug}"></p>
            </a>`).join('');
        contenuto.appendChild(griglia);

        for (const classe of classi) {
            riassumiClasse(classe.slug).then((riga) => {
                const posto = griglia.querySelector(`[data-classe="${classe.slug}"]`);
                if (posto) posto.textContent = riga;
            });
        }
    }

    disegnaTestata('.', '');
    disegnaPiede(configurazione.docente || '');
}

document.addEventListener('DOMContentLoaded', mostraHome);
