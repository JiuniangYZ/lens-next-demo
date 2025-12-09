'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';

interface Auth0ProviderWrapperProps {
  children: ReactNode;
}

export default function Auth0ProviderWrapper({ children }: Auth0ProviderWrapperProps) {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;

  // If domain or clientId are not set, render children without Auth0Provider
  if (!domain || !clientId) {
    console.warn('Auth0 environment variables are not set');
    return <>{children}</>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
      }}
      // Enable caching to prevent losing login state on page refresh
      cacheLocation="localstorage" 
      useRefreshTokens={true}
    >
      {children}
    </Auth0Provider>
  );
}

