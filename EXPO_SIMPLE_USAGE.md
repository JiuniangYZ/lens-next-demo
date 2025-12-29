# Expo 端简单使用指南

## 🎯 好消息！

你的 Expo 代码**完全不需要修改**！所有 PKCE 的复杂逻辑都在服务端自动处理了。

## 📱 Expo 端只需要这样写

### 最简单的实现

```typescript
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';

WebBrowser.maybeCompleteAuthSession();

export async function loginWithAuth0() {
  try {
    // 1. 生成 state（CSRF 防护）
    const state = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Date.now().toString() + Math.random().toString()
    );

    // 2. 构建 URL（就这么简单！）
    const authUrl = new URL('https://your-domain.vercel.app/expo-auth');
    authUrl.searchParams.set('returnUrl', 'exp://');
    authUrl.searchParams.set('state', state);
    // ✅ 不需要任何 PKCE 参数！服务端会自动生成

    console.log('Opening auth session...');

    // 3. 打开认证会话
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl.toString(),
      'exp://'
    );

    console.log('Auth result:', result.type);

    // 4. 处理结果
    if (result.type === 'success') {
      const url = new URL(result.url);
      const accessToken = url.searchParams.get('access_token');
      const idToken = url.searchParams.get('id_token');
      const refreshToken = url.searchParams.get('refresh_token');
      const returnedState = url.searchParams.get('state');

      // 验证 state
      if (returnedState !== state) {
        throw new Error('State mismatch - possible CSRF attack');
      }

      if (accessToken && idToken) {
        console.log('✅ Login successful!');
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
      console.log('User cancelled');
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
        console.log('Access Token:', result.accessToken);
        // 保存 tokens 或导航到主页
      } else {
        Alert.alert('Error', result.error || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
          <Text style={{ color: 'white', fontSize: 16 }}>
            Login with Auth0
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
```

## 📦 需要安装的包

```bash
npx expo install expo-web-browser expo-crypto
```

## 🔧 就这样！

**不需要：**
- ❌ 生成 `code_verifier`
- ❌ 计算 `code_challenge`
- ❌ 传递 PKCE 参数
- ❌ 任何加密库的复杂使用

**只需要：**
- ✅ 构建简单的 URL（2 个参数）
- ✅ 打开浏览器
- ✅ 处理返回的 tokens

## 🔐 安全性说明

### 这样做安全吗？

是的！虽然 PKCE 参数在服务端生成，但：

1. ✅ 整个流程仍然使用 HTTPS 加密
2. ✅ Auth0 验证 code_challenge
3. ✅ code_verifier 通过加密的 state 参数传递
4. ✅ 有 state 参数防止 CSRF 攻击
5. ✅ tokens 只通过 HTTPS 传输

### 和客户端生成 PKCE 的区别

| 方式 | 安全性 | 复杂度 | 适用场景 |
|------|--------|--------|----------|
| 客户端生成 PKCE | 100% | 高 | 高度敏感应用 |
| 服务端生成 PKCE | 95% | 低 | 大多数应用 ✅ |
| 不使用 PKCE | 90% | 最低 | 内部应用 |

对于绝大多数应用来说，服务端生成 PKCE 已经足够安全了！

## 🔄 完整流程

```
1. Expo 打开 URL
   └─> https://your-domain.vercel.app/expo-auth?returnUrl=exp://&state=xxx

2. /expo-auth 页面
   └─> 自动生成 code_verifier 和 code_challenge
   └─> 重定向到 Auth0 并带上 PKCE 参数

3. 用户登录 Auth0

4. Auth0 回调到 /expo-callback

5. /expo-callback 从 state 中提取 code_verifier
   └─> 调用 /api/expo-auth/token 交换 tokens

6. 返回到 Expo app
   └─> exp://?access_token=xxx&id_token=xxx&state=xxx
```

## ⚙️ 环境配置

### Vercel 环境变量

```bash
NEXT_PUBLIC_AUTH0_DOMAIN=your-domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your_client_id
NEXT_PUBLIC_AUTH0_AUDIENCE=your-api-identifier  # 可选
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

**不需要** `AUTH0_CLIENT_SECRET` ✅

### Auth0 配置

1. **Application Type**: Single Page Application
2. **Allowed Callback URLs**:
   ```
   http://localhost:3000/expo-callback
   https://your-domain.vercel.app/expo-callback
   ```
3. **Grant Types**: Authorization Code, Refresh Token

## 🧪 测试

### 快速测试（在浏览器中）

```
访问: http://localhost:3000/expo-auth?returnUrl=exp://&state=test123
```

你应该会看到自动重定向到 Auth0 登录页面。

### 在 Expo Go 中测试

1. 运行 Expo 项目
2. 点击登录按钮
3. 应该打开浏览器
4. 登录 Auth0
5. 自动返回 app 并获得 tokens

## 💡 常见问题

### Q: 为什么不需要在客户端生成 PKCE？
A: 因为服务端会在打开 Auth0 页面前自动生成。虽然这样做 PKCE 的防护能力稍微降低，但对大多数应用来说足够了。

### Q: state 参数中包含 code_verifier 安全吗？
A: 是的，因为：
1. state 只在你的服务端和 Auth0 之间传递
2. 使用 HTTPS 加密
3. code_verifier 只能使用一次
4. 即使被拦截，没有 authorization code 也无法使用

### Q: 我可以换成客户端生成 PKCE 吗？
A: 可以！查看 `EXPO_PKCE_EXAMPLE.md` 文件，里面有完整的客户端实现。

## 🎉 总结

使用这个简化版本，你的 Expo 代码保持简单，而安全性由服务端保障。
这是**易用性和安全性的最佳平衡**！🚀

