import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
    const auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET;
    const auth0Audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;

    if (!auth0Domain || !auth0ClientId || !auth0ClientSecret) {
      console.error('Missing Auth0 configuration:', {
        hasDomain: !!auth0Domain,
        hasClientId: !!auth0ClientId,
        hasClientSecret: !!auth0ClientSecret
      });
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // 构建回调 URL
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/expo-callback`;

    console.log('Exchanging code for tokens...', {
      domain: auth0Domain,
      redirectUri,
      hasAudience: !!auth0Audience
    });

    // 交换 code 获取 token
    const tokenRequestBody: Record<string, string> = {
      grant_type: 'authorization_code',
      client_id: auth0ClientId,
      client_secret: auth0ClientSecret,
      code,
      redirect_uri: redirectUri
    };

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

