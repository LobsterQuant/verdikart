export type GrunnbokContext = {
  locale: string;
  systemVersion: string;
  clientIdentification: string;
  snapshotVersion: {
    timestamp: string;
  };
};

export const grunnbokContext: GrunnbokContext = {
  locale: 'no_NO_B',
  systemVersion: '1.0',
  clientIdentification: 'verdikart',
  snapshotVersion: {
    timestamp: '9999-01-01T00:00:00+01:00',
  },
};
