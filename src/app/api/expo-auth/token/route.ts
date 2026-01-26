import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, code_verifier, audience } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    if (!audience) {
      return NextResponse.json(
        { error: 'Audience is required' },
        { status: 400 }
      );
    }

    // 根据 audience 判断项目并选择对应的 Auth0 配置
    const isPeako = audience === process.env.NEXT_PUBLIC_AUTH0_PEAKO_AUDIENCE;
    const isVita = audience === process.env.NEXT_PUBLIC_AUTH0_VITA_AUDIENCE;

    if (!isPeako && !isVita) {
      console.error('Invalid audience:', audience);
      return NextResponse.json(
        { error: 'Invalid audience' },
        { status: 400 }
      );
    }

    // 根据项目选择对应的 Auth0 配置
    const auth0Domain = isPeako 
      ? process.env.NEXT_PUBLIC_AUTH0_PEAKO_DOMAIN 
      : process.env.NEXT_PUBLIC_AUTH0_VITA_DOMAIN;
    const auth0ClientId = isPeako 
      ? process.env.NEXT_PUBLIC_AUTH0_PEAKO_CLIENT_ID 
      : process.env.NEXT_PUBLIC_AUTH0_VITA_CLIENT_ID;
    const auth0ClientSecret = isPeako 
      ? process.env.AUTH0_PEAKO_CLIENT_SECRET 
      : process.env.AUTH0_VITA_CLIENT_SECRET;
    const auth0Audience = audience;

    // PKCE flow: code_verifier is required if no client_secret
    const usingPKCE = !!code_verifier;
    
    if (!auth0Domain || !auth0ClientId) {
      console.error('Missing Auth0 configuration:', {
        hasDomain: !!auth0Domain,
        hasClientId: !!auth0ClientId,
        project: isPeako ? 'PEAKO' : 'VITA'
      });
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!usingPKCE && !auth0ClientSecret) {
      console.error('Either code_verifier (PKCE) or client_secret is required');
      return NextResponse.json(
        { error: 'Server configuration error: No authentication method available' },
        { status: 500 }
      );
    }

    // 构建回调 URL
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/expo-callback`;

    console.log('Exchanging code for tokens...', {
      project: isPeako ? 'PEAKO' : 'VITA',
      domain: auth0Domain,
      redirectUri,
      audience: auth0Audience,
      usingPKCE,
      hasClientSecret: !!auth0ClientSecret
    });

    // 交换 code 获取 token
    const tokenRequestBody: Record<string, string> = {
      grant_type: 'authorization_code',
      client_id: auth0ClientId,
      code,
      redirect_uri: redirectUri
    };

    // PKCE flow: use code_verifier instead of client_secret
    if (usingPKCE) {
      tokenRequestBody.code_verifier = code_verifier;
      console.log('Using PKCE flow with code_verifier');
    } else if (auth0ClientSecret) {
      tokenRequestBody.client_secret = auth0ClientSecret;
      console.log('Using client_secret flow');
    }

    // 如果配置了 audience，添加它
    if (auth0Audience) {
      tokenRequestBody.audience = auth0Audience;
    }

    const tokenResponse = await fetch(`https://${auth0Domain}/oauth/token`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(tokenRequestBody)
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorData
      });
      
      return NextResponse.json(
        { 
          error: 'Token exchange failed',
          details: errorData.error_description || errorData.error || 'Unknown error',
          status: tokenResponse.status
        },
        { status: tokenResponse.status }
      );
    }

    const tokens = await tokenResponse.json();
    
    console.log('Successfully exchanged code for tokens', {
      hasAccessToken: !!tokens.access_token,
      hasIdToken: !!tokens.id_token,
      hasRefreshToken: !!tokens.refresh_token
    });

    // 返回 tokens 给前端
    return NextResponse.json({
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type
    });

  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { 
        error: 'Token exchange failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

