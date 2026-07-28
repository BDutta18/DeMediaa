# Deploy Frontend On Vercel

1. In Vercel, set **Root Directory** to `frontend`.
2. Make sure there is no custom install command like `npm i --legacy-peer-deps`.
3. Add env variable:
   - `NEXT_PUBLIC_API_BASE_URL=https://demedia.onrender.com`
4. Deploy.

This project includes [`vercel.json`](./vercel.json), which forces:

- `npm ci`
- `npm run build`
