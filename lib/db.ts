import { put, list, getDownloadUrl } from '@vercel/blob';

export type RSVP = {
  id: string;
  name: string;
  whatsapp: string;
  attending: 'yes' | 'maybe' | 'no';
  guest_count: number;
  dietary: string | null;
  message: string | null;
  created_at: string;
};

export async function saveRsvp(data: Omit<RSVP, 'id' | 'created_at'>): Promise<RSVP> {
  const rsvp: RSVP = {
    ...data,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
  };

  await put(`rsvps/${rsvp.id}.json`, JSON.stringify(rsvp), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });

  return rsvp;
}

export async function getAllRsvps(): Promise<RSVP[]> {
  const { blobs } = await list({ prefix: 'rsvps/' });

  const rsvps = await Promise.all(
    blobs.map(async (blob) => {
      const res = await fetch(blob.downloadUrl);
      return res.json() as Promise<RSVP>;
    })
  );

  return rsvps.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
