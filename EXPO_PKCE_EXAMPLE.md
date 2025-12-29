# Expo 端 PKCE 实现示例（高级版）

## ⚠️ 注意

**大多数情况下你不需要阅读这个文档！**

服务端已经自动处理 PKCE 了。请查看 **`EXPO_SIMPLE_USAGE.md`** 获取简单的实现方式。

本文档仅供需要在**客户端生成 PKCE 参数**的高级场景使用。

---

## 📋 概述

如果你需要最高级别的安全性，可以在客户端（Expo 端）生成 PKCE 参数。后端已支持 **PKCE (Proof Key for Code Exchange)** 流程，你的 Auth0 应用可以保持 **SPA 类型**，不需要 Client Secret。

## 🔐 PKCE 流程

```
1. Expo 生成 code_verifier (随机字符串)
2. Expo 计算 code_challenge = BASE64URL(SHA256(code_verifier))
3. Expo 打开 /expo-auth?...&code_challenge=xxx&code_verifier=xxx
4. Auth0 验证 code_challenge
5. 后端用 code_verifier 交换 token (不需要 client_secret)
```

## 📱 Expo 端完整实现

### 安装依赖

```bash
npm install expo-web-browser expo-crypto
```

### 实现代码

```typescript
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// 生成随机字符串
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Base64 URL 编码
function base64URLEncode(str: string): string {
  return str
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// 计算 code_challenge
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const hashed = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    codeVerifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  return base64URLEncode(hashed);
}

// 主函数：发起 Auth0 登录
export async function loginWithAuth0() {
  try {
    // 1. 生成 PKCE 参数
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // 2. 生成 state 用于 CSRF 防护
    const state = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Date.now().toString() + Math.random().toString()
    );

    // 3. 构建认证 URL
    const authUrl = new URL('https://your-domain.vercel.app/expo-auth');
    authUrl.searchParams.set('returnUrl', 'exp://'); // Expo Go 的 scheme
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('code_verifier', codeVerifier); // 后端需要用这个

    console.log('Opening auth session...', {
      hasCodeVerifier: !!codeVerifier,
      hasCodeChallenge: !!codeChallenge
    });

    // 4. 打开认证会话
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl.toString(),
      'exp://' // 回调 scheme
    );

    console.log('Auth session result:', result);

    // 5. 处理结果
    if (result.type === 'success') {
      const url = new URL(result.url);
      const accessToken = url.searchParams.get('access_token');
      const idToken = url.searchParams.get('id_token');
      const refreshToken = url.searchParams.get('refresh_token');
      const returnedState = url.searchParams.get('state');

      // 6. 验证 state
      if (returnedState !== state) {
        throw new Error('State mismatch - possible CSRF attack');
      }

      if (accessToken && idToken) {
        console.log('✅ Login successful!');
        
        // 7. 存储 tokens
        // await SecureStore.setItemAsync('access_token', accessToken);
        // await SecureStore.setItemAsync('id_token', idToken);
        // if (refreshToken) {
        //   await SecureStore.setItemAsync('refresh_token', refreshToken);
        // }

        return {
          success: true,
          accessToken,
          idToken,
          refreshToken
        };
      } else {
        throw new Error('No tokens received');
      }
    } else if (result.type === 'cancel') {
      console.log('User cancelled authentication');
      return { success: false, error: 'User cancelled' };
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    console.error('Auth error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

## 🎨 在 React Native 组件中使用

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { loginWithAuth0 } from './auth';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await loginWithAuth0();
      
      if (result.success) {
        Alert.alert('Success', 'Login successful!');
        // Navigate to home screen
        // navigation.navigate('Home');
      } else {
        Alert.alert('Error', result.error || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome</Text>
      
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#0070f3',
          padding: 15,
          borderRadius: 10,
          minWidth: 200,
          alignItems: 'center'
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: 'white', fontSize: 16 }}>Login with Auth0</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
```

## 🔧 配置说明

### Vercel 环境变量

现在 **不需要** `AUTH0_CLIENT_SECRET` 了！只需要：

```bash
NEXT_PUBLIC_AUTH0_DOMAIN=your-domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your_client_id
NEXT_PUBLIC_AUTH0_AUDIENCE=your-api-identifier  # 可选，用于JWT
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

### Auth0 配置

1. **Application Type**: Single Page Application ✅
2. **Allowed Callback URLs**:
   ```
   http://localhost:3000/expo-callback
   https://your-domain.vercel.app/expo-callback
   ```
3. **Allowed Web Origins**: (可选)
4. **Advanced Settings** → **Grant Types**:
   - ✅ Authorization Code
   - ✅ Refresh Token

## 🧪 测试流程

### 本地测试（模拟）

```bash
# 在浏览器中访问（会显示错误，因为缺少 PKCE 参数）
http://localhost:3000/expo-auth?returnUrl=exp://&state=test123

# 完整的测试 URL（带 PKCE 参数）
http://localhost:3000/expo-auth?returnUrl=exp://&state=test123&code_challenge=xxx&code_challenge_method=S256&code_verifier=yyy
```

### Expo Go 测试

1. 在 Expo 项目中实现上述代码
2. 运行 `expo start`
3. 点击登录按钮
4. 应该打开浏览器进行 Auth0 登录
5. 登录后自动返回 app 并获得 tokens

## 🔍 调试技巧

### 查看后端日志

后端会输出详细日志：

```
Exchanging code for tokens...
{
  domain: "your-domain.auth0.com",
  redirectUri: "https://your-domain.vercel.app/expo-callback",
  hasAudience: true,
  usingPKCE: true,
  hasClientSecret: false
}
Using PKCE flow with code_verifier
```

### 常见问题

**问题 1**: "Invalid grant" 错误
- **原因**: code_verifier 不匹配
- **解决**: 确保传递了正确的 code_verifier

**问题 2**: "Missing code_challenge" 
- **原因**: Auth0 期望 PKCE 但没有收到 code_challenge
- **解决**: 确保 Expo 端正确生成并传递了 code_challenge

**问题 3**: Token 是 opaque 而不是 JWT
- **原因**: 没有设置 audience
- **解决**: 设置 `NEXT_PUBLIC_AUTH0_AUDIENCE` 环境变量

## 🎉 优势

✅ **不需要 Client Secret** - 更安全，不怕泄露  
✅ **标准 OAuth 2.0 流程** - 遵循最佳实践  
✅ **保持 SPA 类型** - 无需更改 Auth0 应用配置  
✅ **完全兼容 Expo Go** - 无需 custom build  

## 🔄 从手动复制 Token 迁移

**之前** (手动方式):
```typescript
// 1. 用户访问 token-print 页面
// 2. 手动复制 token
// 3. 粘贴到 app 输入框
```

**现在** (PKCE 自动化):
```typescript
// 1. 用户点击登录按钮
const result = await loginWithAuth0();
// 2. 浏览器自动打开和关闭
// 3. Tokens 自动返回
```

更流畅的用户体验！🚀

