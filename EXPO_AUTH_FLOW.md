# Expo-Go Auth Flow Documentation

## Overview

This implementation provides a secure OAuth flow for expo-go apps without requiring custom URL schemes or ejecting from Expo Go.

## Flow Diagram

```
Expo App → Vercel /expo-auth → Auth0 Login → Vercel /expo-callback → Expo App
(returnUrl)                     (authorize)   (code exchange)         (tokens)
```

## Step-by-Step Flow

1. **Expo App initiates login**
   - User taps "Login with Auth0" button
   - App opens `https://your-domain.vercel.app/expo-auth?returnUrl=exp://&state=xxx`
   - Uses `WebBrowser.openAuthSessionAsync()` to open in-app browser

2. **Vercel /expo-auth page**
   - Receives `returnUrl` and `state` from Expo
   - Constructs Auth0 authorization URL
   - Redirects browser to Auth0 login page

3. **Auth0 Login**
   - User logs in with Auth0
   - Auth0 redirects back to `https://your-domain.vercel.app/expo-callback?code=xxx&state=xxx`

4. **Vercel /expo-callback page**
   - Receives authorization `code` from Auth0
   - Calls `/api/expo-auth/token` to exchange code for tokens
   - Backend securely exchanges code for access_token, id_token, refresh_token

5. **Return to Expo**
   - Constructs return URL: `exp://?access_token=xxx&id_token=xxx&state=xxx`
   - Redirects browser to this URL
   - Expo app catches the callback and extracts tokens

## Vercel Implementation

### Files Created

- `/src/app/expo-auth/page.tsx` - Initiates Auth0 login
- `/src/app/expo-callback/page.tsx` - Handles Auth0 callback
- `/src/app/api/expo-auth/token/route.ts` - Exchanges code for tokens

### Environment Variables

Required in Vercel (and local `.env.local`):

```bash
NEXT_PUBLIC_AUTH0_DOMAIN=your-domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_AUTH0_AUDIENCE=your-api-identifier  # Optional, for JWT tokens
NEXT_PUBLIC_BASE_URL=https://lens-next-demo.vercel.app
```

### Auth0 Configuration

In your Auth0 Application settings, add:

**Allowed Callback URLs:**
```
http://localhost:3000/expo-callback
https://lens-next-demo.vercel.app/expo-callback
```

**Application Type:** Single Page Application or Regular Web Application

## Expo Implementation Example

```typescript
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';

WebBrowser.maybeCompleteAuthSession();

const handleAuth0Login = async () => {
  try {
    // Generate state for CSRF protection
    const state = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Date.now().toString() + Math.random().toString()
    );

    // Build auth URL
    const vercelAuthUrl = new URL('https://lens-next-demo.vercel.app/expo-auth');
    vercelAuthUrl.searchParams.set('state', state);
    vercelAuthUrl.searchParams.set('returnUrl', 'exp://');

    // Open auth session
    const result = await WebBrowser.openAuthSessionAsync(
      vercelAuthUrl.toString(),
      'exp://'
    );

    if (result.type === 'success') {
      const url = new URL(result.url);
      const accessToken = url.searchParams.get('access_token');
      const idToken = url.searchParams.get('id_token');
      const returnedState = url.searchParams.get('state');

      // Verify state matches
      if (returnedState !== state) {
        throw new Error('State mismatch - possible CSRF attack');
      }

      if (accessToken && idToken) {
        // Store tokens and proceed
        console.log('Login successful!');
      }
    }
  } catch (error) {
    console.error('Auth error:', error);
  }
};
```

## Security Features

1. **CSRF Protection**: State parameter validation
2. **Secure Token Exchange**: Code exchange happens on backend
3. **Client Secret**: Never exposed to client (kept on server)
4. **Short-lived Codes**: Authorization codes expire quickly
5. **HTTPS Required**: All production URLs use HTTPS

## Testing

### Local Development

1. Start Next.js dev server:
   ```bash
   npm run dev
   ```

2. Test the flow manually:
   - Visit: `http://localhost:3000/expo-auth?returnUrl=exp://&state=test123`
   - Should redirect to Auth0
   - After login, should redirect to expo-callback
   - Callback will attempt to redirect to `exp://` (won't work in browser, but will in Expo)

### Production Testing

Deploy to Vercel and test with actual Expo Go app.

## Troubleshooting

### "Invalid state parameter"
- Check that state is being passed correctly from /auth to /callback
- Verify JSON parsing of state parameter

### "Token exchange failed"
- Verify AUTH0_CLIENT_SECRET is set correctly in Vercel
- Check that callback URL matches exactly in Auth0 settings
- Ensure Auth0 application type is correct

### "No access_token received"
- Check Auth0 API configuration
- Verify audience parameter if using custom API
- Check Auth0 logs for errors

### Expo app doesn't catch redirect
- Verify returnUrl is set to `exp://` (for Expo Go)
- For standalone apps, use your custom scheme
- Check that WebBrowser.maybeCompleteAuthSession() is called

## Migration from Manual Token Copy

**Old flow:**
1. User manually copies token from token-print page
2. User pastes into Expo app input field

**New flow:**
1. User taps login button in Expo app
2. Browser opens, user logs in
3. Browser closes automatically
4. Tokens are automatically available in app

Much better UX! 🎉

