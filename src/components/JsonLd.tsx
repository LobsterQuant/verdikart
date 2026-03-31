/**
 * Renders one or more <script type="application/ld+json"> blocks.
 * Pass any valid Schema.org object or array of objects as `schema`.
 */
export default function JsonLd({ schema }: { schema: Record<string, unknown> | Record<string, unknown>[] }) {
  const schemas = Array.isArray(schema) ? schema : [schema];
  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          // biome-ignore lint: dangerouslySetInnerHTML required for JSON-LD
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </>
  );
}
