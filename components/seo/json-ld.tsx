/**
 * JSON-LD ausgeben.
 *
 * Der Inhalt stammt ausschließlich aus lib/seo.ts, also aus eigenem Code und
 * nie aus Nutzereingaben — deshalb ist dangerouslySetInnerHTML hier
 * unproblematisch. Das `</script>`-Escaping ist trotzdem drin: Käme irgendwann
 * ein Freitextfeld dazu, wäre das sonst eine offene XSS-Lücke.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
