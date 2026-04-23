import * as soap from 'soap';

const GRUNNBOK_URL = process.env.GRUNNBOK_URL;
const GRUNNBOK_USER = process.env.GRUNNBOK_USER;
const GRUNNBOK_PASS = process.env.GRUNNBOK_PASS;

type ServiceName = 'IdentService' | 'InformasjonService' | 'StoreService';

const clientCache = new Map<ServiceName, soap.Client>();

export function grunnbokConfigured(): boolean {
  return Boolean(GRUNNBOK_URL && GRUNNBOK_USER && GRUNNBOK_PASS);
}

export async function getGrunnbokClient(
  service: ServiceName
): Promise<soap.Client | null> {
  if (!grunnbokConfigured()) return null;

  const cached = clientCache.get(service);
  if (cached) return cached;

  const wsdlUrl = `${GRUNNBOK_URL}/${service}WS?wsdl`;
  const client = await soap.createClientAsync(wsdlUrl, {
    wsdl_options: {
      auth: `Basic ${Buffer.from(`${GRUNNBOK_USER}:${GRUNNBOK_PASS}`).toString('base64')}`,
    },
  });

  client.setSecurity(
    new soap.BasicAuthSecurity(GRUNNBOK_USER as string, GRUNNBOK_PASS as string)
  );
  clientCache.set(service, client);
  return client;
}
