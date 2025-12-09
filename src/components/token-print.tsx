"use client";
import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

// 你的 Auth0 配置
// const domain = "YOUR_AUTH0_DOMAIN";
// const clientId = "YOUR_CLIENT_ID";
// const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
// const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE; // API 标识符，用于获取 JWT 格式的 token

// 内部组件：负责登录和显示 Token
const TokenPrinter = () => {
  const { loginWithRedirect, logout, user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [token, setToken] = useState("");

  const handleGetToken = async () => {
    try {
      // 获取原始 JWT Token
      const accessToken = await getAccessTokenSilently({
        authorizationParams: {
          audience: audience, // 必须指定 audience 才能获取 JWT 格式的 token
          scope: "openid profile email offline_access" // 关键：请求 offline_access
        }
      });
      setToken(accessToken);
    } catch (e: unknown) {
      alert("获取 Token 失败: " + e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <button 
          onClick={() => loginWithRedirect()}
          style={{ padding: '20px', fontSize: '20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '8px' }}
        >
          🚀 登录 Auth0 (获取 Token)
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>欢迎, {user?.name}</h2>
      <button onClick={() => logout()}>退出</button>
      <hr />
      
      {!token ? (
        <button onClick={handleGetToken} style={{ padding: '10px', fontSize: '16px' }}>
          📄 点击生成 Access Token
        </button>
      ) : (
        <div>
          <p>👇 复制下面的 Token 到 Expo App 👇</p>
          <textarea 
            readOnly 
            value={token} 
            style={{ width: '100%', height: '300px', fontSize: '12px', background: '#f0f0f0', padding: '10px' }} 
            onClick={(e) => e.currentTarget.select()}
          />
          <button 
            onClick={() => navigator.clipboard.writeText(token)}
            style={{ marginTop: '10px', padding: '10px', background: 'green', color: 'white' }}
          >
            📋 一键复制
          </button>
        </div>
      )}
    </div>
  );
};

export default TokenPrinter;

// // 根组件：包裹 Provider
// export default function App() {
//   return (
//     <Auth0Provider
//       domain={domain}
//       clientId={clientId}
//       authorizationParams={{
//         redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
//       }}
//       // 开启缓存，防止刷新页面丢失登录态
//       cacheLocation="localstorage" 
//       useRefreshTokens={true}
//     >
//       <TokenPrinter />
//     </Auth0Provider>
//   );
// }