'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CallbackPageContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const stateParam = searchParams.get('state');
        const authError = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // 检查 Auth0 是否返回错误
        if (authError) {
          throw new Error(`Auth0 error: ${authError}${errorDescription ? ` - ${errorDescription}` : ''}`);
        }

        if (!code || !stateParam) {
          console.log('Waiting for query parameters...', { code, stateParam });
          return;
        }

        console.log('Received callback with code:', code.substring(0, 10) + '...');

        // 解析 state
        let state: string;
        let returnUrl: string;
        let codeVerifier: string | undefined;
        
        try {
          const parsed = JSON.parse(stateParam);
          state = parsed.state;
          returnUrl = parsed.returnUrl;
          codeVerifier = parsed.codeVerifier; // PKCE: 提取 code_verifier
        } catch {
          throw new Error('Invalid state parameter');
        }

        if (!returnUrl) {
          throw new Error('Missing returnUrl in state');
        }

        setStatus('Exchanging code for tokens...');

        console.log('Exchanging code for tokens...', {
          hasCode: !!code,
          hasCodeVerifier: !!codeVerifier,
          usingPKCE: !!codeVerifier
        });

        // 使用 code 交换 token (调用后端 API 路由)
        const response = await fetch('/api/expo-auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            code,
            code_verifier: codeVerifier // PKCE: 传递 code_verifier
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to exchange code for tokens (${response.status})`);
        }

        const tokens = await response.json();
        console.log('Successfully received tokens');

        if (!tokens.access_token) {
          throw new Error('No access_token received from token exchange');
        }

        setStatus('Redirecting back to app...');

        // 构建返回给 Expo 的 URL
        const returnUrlObj = new URL(returnUrl);
        returnUrlObj.searchParams.set('access_token', tokens.access_token);
        
        if (tokens.id_token) {
          returnUrlObj.searchParams.set('id_token', tokens.id_token);
        }
        
        if (tokens.refresh_token) {
          returnUrlObj.searchParams.set('refresh_token', tokens.refresh_token);
        }
        
        returnUrlObj.searchParams.set('state', state);

        console.log('Redirecting to:', returnUrlObj.toString());

        // 延迟一下让用户看到状态信息
        setTimeout(() => {
          window.location.href = returnUrlObj.toString();
        }, 500);

      } catch (err) {
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    handleCallback();
  }, [searchParams]);

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        flexDirection: 'column',
        fontFamily: 'monospace',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: 'red' }}>❌ Authentication Error</h2>
        <p style={{ 
          background: '#fee', 
          padding: '15px', 
          borderRadius: '8px',
          marginTop: '20px',
          maxWidth: '600px'
        }}>
          {error}
        </p>
        <p style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
          Please close this window and try again
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
          ✅
        </div>
        <p style={{ fontSize: '18px' }}>{status}</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          from { transform: scale(1); }
          50% { transform: scale(1.2); }
          to { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default function CallbackPage() {
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
      <CallbackPageContent />
    </Suspense>
  );
}

