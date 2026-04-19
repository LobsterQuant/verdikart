import * as soap from 'soap';

const MATRIKKEL_URL = process.env.MATRIKKEL_URL!;
const MATRIKKEL_USER = process.env.MATRIKKEL_USER!;
const MATRIKKEL_PASS = process.env.MATRIKKEL_PASS!;

if (!MATRIKKEL_URL || !MATRIKKEL_USER || !MATRIKKEL_PASS) {
  throw new Error('Missing Matrikkel credentials in environment');
}

// Standard matrikkelContext — required on most service calls
export const matrikkelContext = {
  locale: 'no_NO_B',
  brukOriginaleKoordinater: false,
  koordinatsystemKodeId: { value: 24 }, // EUREF89 UTM sone 33
  systemVersion: '4.4',
  klientIdentifikasjon: 'verdikart',
  snapshotVersion: {
    timestamp: '9999-01-01T00:00:00+01:00', // Latest snapshot
  },
};

type ServiceName =
  | 'AdresseService'
  | 'MatrikkelsokService'
  | 'MatrikkelenhetService'
  | 'BygningService'
  | 'BruksenhetService'
  | 'StoreService';

const clientCache = new Map<ServiceName, soap.Client>();

export async function getMatrikkelClient(service: ServiceName): Promise<soap.Client> {
  const cached = clientCache.get(service);
  if (cached) return cached;

  const wsdlUrl = `${MATRIKKEL_URL}/${service}WS?wsdl`;
  const client = await soap.createClientAsync(wsdlUrl, {
    wsdl_options: {
      auth: `Basic ${Buffer.from(`${MATRIKKEL_USER}:${MATRIKKEL_PASS}`).toString('base64')}`,
    },
  });

  client.setSecurity(new soap.BasicAuthSecurity(MATRIKKEL_USER, MATRIKKEL_PASS));
  clientCache.set(service, client);
  return client;
}
