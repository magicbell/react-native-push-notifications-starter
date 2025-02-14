import { useCallback, useEffect, useState } from 'react';

import { Credentials } from './useAuth';
import { useURLMemo } from './useURLMemo';
import { Platform } from 'react-native';

/**
 * Parses a launch URL and if is a review environment connection URL, uses the embedded credentials to sign in to the app.
 *
 * ATTENTION: This is only for MagicBell internal use. You should not follow this example in your production app.
 *
 * Example URL:
 *   x-magicbell-review://connect?apiHost=[...]&userJWTToken=[...]
 *
 */
const parseLaunchURLCredentials = (url: URL): Credentials | null => {
  var serverURL = url.searchParams.get('apiHost');
  const userJWTToken = url.searchParams.get('userJWTToken');

  if (!serverURL || !userJWTToken) {
    console.warn('Could not parse credentials from launch URL: ', url.toString());
    return null;
  }

  // Map localhost on Android emulators
  // https://stackoverflow.com/a/6310592/25724
  if (Platform.OS === 'android' && serverURL.indexOf('localhost')) {
    var url = new URL(serverURL);
    url.hostname = '10.0.2.2';
    serverURL = url.href;
  }

  const credentials: Credentials = {
    serverURL,
    userJWTToken,
  };
  return credentials;
};

export default function useReviewCredentials() {
  const deepLink = useURLMemo();
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  useEffect(() => {
    let url;
    try {
      url = deepLink ? new URL(deepLink) : null;
    } catch (error) {
      console.warn('Could not parse launch URL: ', error);
    }

    let parsedCredentials = null;
    if (url) {
      // ignore non review connect URLs
      if (url.protocol === 'x-magicbell-review:' && url.host === 'connect') {
        parsedCredentials = parseLaunchURLCredentials(url);
      }
    }
    setCredentials(parsedCredentials);
  }, [deepLink]);

  return credentials;
}
