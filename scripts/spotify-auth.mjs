#!/usr/bin/env node

import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const DEFAULT_REDIRECT_URI = 'http://127.0.0.1:3003/api/spotify/callback';
const REQUIRED_SCOPE = 'user-read-currently-playing';

function getArgument(name) {
  const index = process.argv.indexOf(name);

  return index >= 0 ? process.argv[index + 1] : undefined;
}

function writeError(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

async function main() {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    writeError(
      'Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET before running this helper.'
    );
    return;
  }

  const redirectUri =
    getArgument('--redirect-uri')?.trim() ?? DEFAULT_REDIRECT_URI;
  const state = randomBytes(16).toString('hex');
  const authorizationUrl = new URL('https://accounts.spotify.com/authorize');

  authorizationUrl.search = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: REQUIRED_SCOPE,
    show_dialog: 'true',
    state
  }).toString();

  stdout.write(
    `\nOpen this URL in a browser:\n\n${authorizationUrl.toString()}\n\n`
  );
  stdout.write(
    'Approve access. The redirect may show a 404; copy its complete URL from the address bar.\n\n'
  );

  const prompt = createInterface({ input: stdin, output: stdout });
  const callbackInput = await prompt.question('Paste the redirected URL: ');
  prompt.close();

  let callbackUrl;

  try {
    callbackUrl = new URL(callbackInput.trim());
  } catch {
    writeError('The redirected URL is invalid.');
    return;
  }

  const expectedRedirectUrl = new URL(redirectUri);

  if (
    callbackUrl.origin !== expectedRedirectUrl.origin ||
    callbackUrl.pathname !== expectedRedirectUrl.pathname
  ) {
    writeError(
      'The redirected URL does not match the configured redirect URI.'
    );
    return;
  }

  if (callbackUrl.searchParams.get('state') !== state) {
    writeError('OAuth state validation failed. Start the helper again.');
    return;
  }

  const authorizationCode = callbackUrl.searchParams.get('code');

  if (!authorizationCode) {
    writeError('Spotify did not return an authorization code.');
    return;
  }

  let response;

  try {
    response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: redirectUri
      })
    });
  } catch {
    writeError('Could not reach Spotify token service. Try again later.');
    return;
  }

  if (!response.ok) {
    writeError(`Spotify token exchange failed with status ${response.status}.`);
    return;
  }

  let payload;

  try {
    payload = await response.json();
  } catch {
    writeError('Spotify returned an invalid token response.');
    return;
  }

  if (!payload || typeof payload.refresh_token !== 'string') {
    writeError(
      'Spotify did not return a refresh token. Revoke app access, then authorize again.'
    );
    return;
  }

  stdout.write(`\nRefresh token:\n${payload.refresh_token}\n`);
  stdout.write(
    '\nCopy it into SPOTIFY_REFRESH_TOKEN. This helper does not save it.\n'
  );
}

await main();
