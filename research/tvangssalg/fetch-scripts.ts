/**
 * Henter tvangssalg-data fra SSB PxWeb v2-beta API.
 *
 * Kjør: `npx tsx research/tvangssalg/fetch-scripts.ts`
 * Output: research/tvangssalg/data-hentet.json
 *
 * Bakgrunn:
 * SSB har per april 2026 INGEN kommune-nivå tabell for tvangssalg.
 * De eneste tvangssalg-tabellene er nasjonale:
 *   - 07218: Månedlig, 1995M01-2026M03. Tvangssal fast eigedom + lausøyre.
 *            OBS: Tvangssalg-data stopper januar 2022 (admin-endring i Brønnøysund).
 *   - 08948: Kvartalsvis, 2000K1-2025K4. "Hjemmelsoverføring, tvangssalg" per eiendomstype.
 *            Dette er grunnbokbaserte tvangssalg som ble tinglyst — fortsetter i dag.
 *
 * Vi henter begge for full analyse.
 */

const API_BASE = 'https://data.ssb.no/api/v0/no/table';

type JsonStat2 = {
  label: string;
  source: string;
  updated: string;
  note?: string[];
  id: string[];
  size: number[];
  dimension: Record<
    string,
    {
      label: string;
      category: {
        index: Record<string, number>;
        label: Record<string, string>;
      };
    }
  >;
  value: (number | null)[];
};

async function fetchTable(tableId: string, query: unknown): Promise<JsonStat2> {
  const url = `${API_BASE}/${tableId}/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SSB ${tableId} ${res.status}: ${body.slice(0, 500)}`);
  }
  return (await res.json()) as JsonStat2;
}

/** Bygg radvise records fra json-stat2 (flat array i row-major rekkefølge). */
function toRecords(ds: JsonStat2): Array<Record<string, string | number | null>> {
  const dims = ds.id;
  const sizes = ds.size;
  const categories = dims.map((d) => {
    const cat = ds.dimension[d].category;
    return Object.keys(cat.index).sort((a, b) => cat.index[a] - cat.index[b]);
  });
  const total = sizes.reduce((a, b) => a * b, 1);
  const records: Array<Record<string, string | number | null>> = [];
  for (let i = 0; i < total; i++) {
    const rec: Record<string, string | number | null> = {};
    let idx = i;
    for (let d = dims.length - 1; d >= 0; d--) {
      const pos = idx % sizes[d];
      idx = Math.floor(idx / sizes[d]);
      const code = categories[d][pos];
      rec[dims[d]] = code;
      rec[`${dims[d]}_label`] = ds.dimension[dims[d]].category.label[code];
    }
    rec.value = ds.value[i] ?? null;
    records.push(rec);
  }
  return records;
}

async function main() {
  console.log('Henter 07218 (nasjonal månedlig, tvangssal + konkurs)...');
  const t07218 = await fetchTable('07218', {
    query: [
      {
        code: 'ContentsCode',
        selection: { filter: 'item', values: ['Tvalg', 'Tvang2'] },
      },
    ],
    response: { format: 'json-stat2' },
  });

  console.log('Henter 08948 (nasjonal kvartalsvis, tvangssalg per eiendomstype)...');
  const t08948 = await fetchTable('08948', {
    query: [
      { code: 'EiendomType', selection: { filter: 'all', values: ['*'] } },
      {
        code: 'ContentsCode',
        selection: { filter: 'item', values: ['Tvangssalg'] },
      },
    ],
    response: { format: 'json-stat2' },
  });

  console.log('Henter 11500 (nasjonal kvartalsvis, borettslag tvangssalg)...');
  const t11500 = await fetchTable('11500', {
    query: [
      {
        code: 'ContentsCode',
        selection: { filter: 'item', values: ['Tvangssalg'] },
      },
    ],
    response: { format: 'json-stat2' },
  });

  const output = {
    fetchedAt: new Date().toISOString(),
    note: 'SSB har ingen tvangssalg-tabell per kommune. Kun nasjonale tall er tilgjengelig.',
    tables: {
      '07218': {
        label: t07218.label,
        source: t07218.source,
        updated: t07218.updated,
        apiNote: t07218.note,
        records: toRecords(t07218),
      },
      '08948': {
        label: t08948.label,
        source: t08948.source,
        updated: t08948.updated,
        apiNote: t08948.note,
        records: toRecords(t08948),
      },
      '11500': {
        label: t11500.label,
        source: t11500.source,
        updated: t11500.updated,
        apiNote: t11500.note,
        records: toRecords(t11500),
      },
    },
  };

  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const outPath = path.resolve(
    process.cwd(),
    'research/tvangssalg/data-hentet.json',
  );
  await fs.writeFile(outPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Skrev ${outPath}`);
  console.log(
    `Records: 07218=${output.tables['07218'].records.length}, 08948=${output.tables['08948'].records.length}, 11500=${output.tables['11500'].records.length}`,
  );
}

main().catch((err) => {
  console.error('Feil:', err);
  process.exit(1);
});
