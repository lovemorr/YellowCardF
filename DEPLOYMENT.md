# YellowCardF - Vercel Deployment

## Structure

```
YellowCardF/
├── public/              # Static verification site (HTML/CSS/JS)
│   ├── index.html       # Landing page
│   ├── form.html        # Policy form
│   ├── generator.html   # Policy generator
│   ├── YellowCard-policy-verify.html  # Verification page
│   ├── master_policy_list.html        # Policy list
│   ├── css/             # Stylesheets
│   └── js/              # Client-side JavaScript
├── api/                 # Serverless API functions
│   ├── auth/            # Authentication endpoints
│   └── policies/        # Policy management endpoints
├── admin/               # Next.js admin panel
└── vercel.json          # Vercel configuration
```

## Deployment

### Prerequisites
- Vercel account
- Environment variables configured in Vercel dashboard:
  - `DATABASE_URL` - Neon PostgreSQL connection string
  - `JWT_SECRET` - Secret for JWT token signing

### Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Environment Variables

Set these in Vercel Dashboard (Settings → Environment Variables):

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key-here
```

## URLs

After deployment:
- **Main site**: `https://your-project.vercel.app/`
- **Admin panel**: `https://your-project.vercel.app/admin`
- **API**: `https://your-project.vercel.app/api/*`

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   cd admin && npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL and JWT_SECRET
   ```

3. **Run locally**:
   ```bash
   vercel dev
   ```

## Notes

- Static files are served from `/public/`
- API endpoints are serverless functions in `/api/`
- Admin panel is a Next.js app in `/admin/`
- All routing is configured in `vercel.json`
