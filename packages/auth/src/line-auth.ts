/** LINE Login OAuth token exchange and profile fetch (server-side only). */

export interface LineTokenResponse {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface LineProfile {
  lineUserId: string;
  displayName: string;
  pictureUrl?: string;
}

const LINE_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/token';
const LINE_PROFILE_URL = 'https://api.line.me/v2/profile';

export async function exchangeLineCode(params: {
  code: string;
  redirectUri: string;
  channelId?: string;
  channelSecret?: string;
}): Promise<LineTokenResponse> {
  const channelId = params.channelId ?? process.env.LINE_CHANNEL_ID;
  const channelSecret = params.channelSecret ?? process.env.LINE_CHANNEL_SECRET;
  if (!channelId || !channelSecret) {
    throw new Error('Missing LINE_CHANNEL_ID or LINE_CHANNEL_SECRET');
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: params.redirectUri,
    client_id: channelId,
    client_secret: channelSecret,
  });

  const res = await fetch(LINE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    throw new Error(`LINE token exchange failed: ${res.status}`);
  }

  const json = (await res.json()) as {
    access_token: string;
    id_token?: string;
    refresh_token?: string;
    expires_in: number;
  };

  return {
    accessToken: json.access_token,
    idToken: json.id_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
  };
}

export async function fetchLineProfile(accessToken: string): Promise<LineProfile> {
  const res = await fetch(LINE_PROFILE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`LINE profile fetch failed: ${res.status}`);
  }
  const json = (await res.json()) as {
    userId: string;
    displayName: string;
    pictureUrl?: string;
  };
  return {
    lineUserId: json.userId,
    displayName: json.displayName,
    pictureUrl: json.pictureUrl,
  };
}
