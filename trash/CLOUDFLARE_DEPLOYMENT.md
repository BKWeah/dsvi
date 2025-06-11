# Cloudflare Pages Build Configuration

## Build Settings

**Framework preset:** None
**Build command:** `npm run build`
**Build output directory:** `dist`
**Root directory:** `/`

## Environment Variables

Add these in Cloudflare Pages project settings:

1. **BREVO_API_KEY**
   - Value: Your Brevo API key
   - Environment: Production (and Preview if needed)

## Build Error Solutions

### Rollup Platform Error

If you see errors about `@rollup/rollup-linux-x64-gnu`, it's because the package-lock.json was created on a different OS.

**Solution:** We've already:
1. Added `package-lock.json` to `.gitignore`
2. Created an alternative build command `build:cf` if needed

### Using Alternative Build Command

If you need to keep package-lock.json in the repo, change your Cloudflare Pages build command to:
```
npm run build:cf
```

This will remove the lock file and regenerate it on Cloudflare's Linux environment.

## Deployment Steps

1. Commit and push the changes:
   ```bash
   git add .
   git commit -m "fix: Remove package-lock.json for Cloudflare Pages compatibility"
   git push
   ```

2. Cloudflare Pages will automatically rebuild

3. The build should now succeed!

## Notes

- The `functions` directory will be automatically detected and deployed
- Email functionality requires the BREVO_API_KEY environment variable
- The Pages Function at `/api/brevo/*` will handle all Brevo API calls
