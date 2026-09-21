"""Fa una copia in forma di script di ogni file di contenuto del sito.

Il filtro di rete di alcune scuole blocca il download dei file .md e .json, ma
lascia passare gli script: su quelle lavagne le pagine si aprivano vuote. Per
ogni lezioni.md, mazzo di slide e classi.json qui accanto nasce un file .js
(lezioni.md → lezioni.md.js) con dentro lo stesso testo, e la veste lo legge
da lì. I file markdown restano la fonte: queste copie esistono solo nella
pubblicazione e non vanno committate.

Uso: python3 .github/incorpora.py sito
"""
import json
import sys
from pathlib import Path

radice = Path(sys.argv[1] if len(sys.argv) > 1 else 'sito')
copie = 0
for file in sorted(radice.rglob('*')):
    if file.suffix not in ('.md', '.json') or 'veste' in file.relative_to(radice).parts:
        continue
    testo = file.read_text(encoding='utf-8')
    # ensure_ascii: accenti e simboli viaggiano come \uXXXX, così la copia si
    # legge bene anche su un browser che sbaglia la codifica dello script.
    file.with_name(file.name + '.js').write_text(
        "(window.CONTENUTI = window.CONTENUTI || {})"
        "[document.currentScript.src.split('?')[0]] = "
        + json.dumps(testo, ensure_ascii=True) + ";\n",
        encoding='ascii',
    )
    copie += 1
print(f'{copie} file di contenuto copiati in forma di script')
