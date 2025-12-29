'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// 生成随机字符串
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').substring(0, length);
}

// Base64 URL 编码
function base64URLEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// 生成 code_challenge
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(hash);
}

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

    // 在服务端生成 PKCE 参数
    const initAuth = async () => {
      // 1. 生成 code_verifier (128 个字符的随机字符串)
      const codeVerifier = generateRandomString(128);
      
      // 2. 生成 code_challenge
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      console.log('Generated PKCE parameters on server side', {
        codeVerifierLength: codeVerifier.length,
        codeChallengeLength: codeChallenge.length
      });

      // 3. 构建 Auth0 登录 URL
      const auth0Url = new URL(`https://${auth0Domain}/authorize`);
      auth0Url.searchParams.set('response_type', 'code');
      auth0Url.searchParams.set('client_id', auth0ClientId);
      auth0Url.searchParams.set('redirect_uri', `${window.location.origin}/expo-callback`);
      auth0Url.searchParams.set('scope', 'openid profile email offline_access');
      
      // 如果配置了 audience，添加它以获取 JWT token
      if (auth0Audience) {
        auth0Url.searchParams.set('audience', auth0Audience);
      }
      
      // 4. PKCE: 添加 code_challenge
      auth0Url.searchParams.set('code_challenge', codeChallenge);
      auth0Url.searchParams.set('code_challenge_method', 'S256');
      console.log('Using server-generated PKCE flow');
      
      // 5. 将 state, returnUrl 和 codeVerifier 编码到 state 参数中
      auth0Url.searchParams.set('state', JSON.stringify({ 
        state, 
        returnUrl,
        codeVerifier // 保存 code_verifier 用于后续 token 交换
      }));

      console.log('Redirecting to Auth0...');

      // 6. 重定向到 Auth0
      window.location.href = auth0Url.toString();
    };

    initAuth();
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
          Expected URL format: /expo-auth?returnUrl=exp://&amp;state=xxx
        </p>
        <p style={{ marginTop: '10px', color: '#888', fontSize: '14px' }}>
          PKCE parameters will be generated automatically on the server.
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

