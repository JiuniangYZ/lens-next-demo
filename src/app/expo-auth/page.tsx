'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function AuthPageContent() {
  const searchParams = useSearchParams();
  
  const returnUrl = searchParams.get('returnUrl');
  const state = searchParams.get('state');

  // Auth0 配置
  const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const auth0Audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;

  useEffect(() => {
    // 检查参数和配置
    if (!returnUrl || !state) {
      console.error('Missing required parameters (returnUrl or state)');
      return;
    }

    if (!auth0Domain || !auth0ClientId) {
      console.error('Auth0 configuration missing');
      console.error('Missing AUTH0_DOMAIN or AUTH0_CLIENT_ID');
      return;
    }

    // 构建 Auth0 登录 URL
    const auth0Url = new URL(`https://${auth0Domain}/authorize`);
    auth0Url.searchParams.set('response_type', 'code');
    auth0Url.searchParams.set('client_id', auth0ClientId);
    auth0Url.searchParams.set('redirect_uri', `${window.location.origin}/expo-callback`);
    auth0Url.searchParams.set('scope', 'openid profile email offline_access');
    
    // 如果配置了 audience，添加它以获取 JWT token
    if (auth0Audience) {
      auth0Url.searchParams.set('audience', auth0Audience);
    }
    
    // 将 state 和 returnUrl 编码到 state 参数中
    auth0Url.searchParams.set('state', JSON.stringify({ state, returnUrl }));

    console.log('Redirecting to Auth0:', auth0Url.toString());

    // 重定向到 Auth0
    window.location.href = auth0Url.toString();
  }, [returnUrl, state, auth0Domain, auth0ClientId, auth0Audience]);

  // 显示错误信息（如果有）
  if (!returnUrl || !state) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        fontFamily: 'monospace',
        padding: '20px'
      }}>
        <h2 style={{ color: 'red' }}>❌ Error</h2>
        <p>Missing required parameters (returnUrl or state)</p>
        <p style={{ marginTop: '20px', color: '#666' }}>
          Expected URL format: /expo-auth?returnUrl=exp://&state=xxx
        </p>
      </div>
    );
  }

  if (!auth0Domain || !auth0ClientId) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        fontFamily: 'monospace',
        padding: '20px'
      }}>
        <h2 style={{ color: 'red' }}>❌ Error</h2>
        <p>Auth0 configuration missing</p>
        <p style={{ marginTop: '20px', color: '#666' }}>
          Please check your environment variables
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'monospace'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '20px',
          animation: 'spin 2s linear infinite'
        }}>
          🔄
        </div>
        <p style={{ fontSize: '18px' }}>Redirecting to Auth0...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'monospace'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <p style={{ fontSize: '18px' }}>Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}

