# 应用路由说明

## 现有路由（不受影响）

### 主页面
- **`/`** (`/src/app/page.tsx`)
  - 当前的Token Printer页面
  - 使用 Auth0 SPA SDK，手动复制token的方式
  - 不受新流程影响

### 备份页面
- **`/page-bk`** (`/src/app/page-bk.tsx`)
  - 原始的多页面导航demo
  - 保留作为备份

### 现有API
- **`/api/auth-proxy`** (`/src/app/api/auth-proxy/route.ts`)
  - 现有的Auth代理API
  - 功能保持不变，不受影响

## Expo专用路由（新增）

这些是为Expo-Go应用专门创建的独立Auth流程，使用 **`expo-`** 前缀命名空间：

### Expo Auth 页面
- **`/expo-auth`** (`/src/app/expo-auth/page.tsx`)
  - **用途**: Expo应用发起Auth0登录的入口
  - **参数**: 
    - `returnUrl` - Expo应用的回调URL（通常是 `exp://`）
    - `state` - CSRF防护token
  - **示例**: `https://your-domain.vercel.app/expo-auth?returnUrl=exp://&state=abc123`

### Expo Callback 页面
- **`/expo-callback`** (`/src/app/expo-callback/page.tsx`)
  - **用途**: Auth0登录后的回调处理页面
  - **功能**: 
    - 接收Auth0返回的授权码
    - 调用后端API交换token
    - 将token返回给Expo应用
  - **Auth0配置**: 需要添加到 "Allowed Callback URLs"

### Expo Token Exchange API
- **`/api/expo-auth/token`** (`/src/app/api/expo-auth/token/route.ts`)
  - **用途**: 后端安全地用授权码交换access token
  - **方法**: POST
  - **请求体**: `{ "code": "authorization_code" }`
  - **返回**: `{ access_token, id_token, refresh_token, expires_in, token_type }`

## 路由设计原则

### 命名空间隔离
- 使用 **`expo-`** 前缀区分Expo专用路由
- 避免与现有路由冲突
- 为未来扩展预留空间

### 职责分离
- `/` - 传统的Token Printer（手动复制方式）
- `/expo-auth/*` - Expo自动化OAuth流程
- `/api/auth-proxy` - 原有的代理功能（未修改）
- `/api/expo-auth/*` - Expo专用的后端API

### 向后兼容
- 所有现有功能保持不变
- 新增功能使用独立路由
- 不产生breaking changes

## 使用场景

### 场景1: 手动Token复制（现有）
1. 访问 `/` 页面
2. 登录Auth0
3. 手动复制token
4. 粘贴到应用中

### 场景2: Expo自动化流程（新增）
1. Expo应用调用 `WebBrowser.openAuthSessionAsync('/expo-auth?...')`
2. 用户登录Auth0
3. 自动跳转回Expo应用，带上tokens
4. 无需手动操作

## 环境变量

所有路由共享相同的Auth0配置：

```bash
NEXT_PUBLIC_AUTH0_DOMAIN=your-domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_AUTH0_AUDIENCE=your-api-identifier
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

## Auth0配置要求

在Auth0应用设置中添加：

```
Allowed Callback URLs:
  - http://localhost:3000/expo-callback
  - https://your-domain.vercel.app/expo-callback
```

注意：原有的回调URL保持不变。

