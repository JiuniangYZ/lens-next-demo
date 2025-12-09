'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';

interface Auth0ProviderWrapperProps {
  children: ReactNode;
}

export default function Auth0ProviderWrapper({ children }: Auth0ProviderWrapperProps) {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;


  // If domain or clientId are not set, render children without Auth0Provider
  if (!domain || !clientId) {
    console.warn('Auth0 environment variables are not set');
    return <>{children}</>;
  }
  console.log("domain==>", domain);
  console.log("clientId==>", clientId);
  console.log("audience==>", audience);
  console.log("redirect_uri==>", typeof window !== 'undefined' ? window.location.origin : '');

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
        audience: audience, // 必须指定 audience 才能获取 JWT 格式的 token
      }}
      // Enable caching to prevent losing login state on page refresh
      cacheLocation="localstorage" 
      useRefreshTokens={true}
    >
      {children}
    </Auth0Provider>
  );
}

