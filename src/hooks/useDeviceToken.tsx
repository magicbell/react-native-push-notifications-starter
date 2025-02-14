import {
  applicationId,
  ApplicationReleaseType,
  getIosApplicationReleaseTypeAsync,
  getIosPushNotificationServiceEnvironmentAsync,
} from 'expo-application';
import { getDevicePushTokenAsync, requestPermissionsAsync } from 'expo-notifications';
import { ApnsToken, FcmToken, Client as UserClient } from '@magicbell/user-client';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Credentials } from './useAuth';

const apnsTokenPayload = async (token: string): Promise<ApnsToken> => {
  const isSimulator = (await getIosApplicationReleaseTypeAsync()) === ApplicationReleaseType.SIMULATOR;
  const installationId =
    (await getIosPushNotificationServiceEnvironmentAsync()) || isSimulator ? 'development' : 'production';
  return {
    deviceToken: token,
    installationId: installationId,
    appId: applicationId || undefined,
  };
};

const fcmTokenPayload = (token: string): FcmToken => {
  return {
    deviceToken: token,
  };
};

/**
 * Registers the device token with the MagicBell API (v2).
 *
 * Note that the v2 payload differs from the v1 payload.
 * Make sure you are using the latest API spec before copying this approach, or check out the previous version in the git history:
 * https://github.com/magicbell/mobile-inbox/blob/08448958455cd9beffc6fd4a1469d2c16bc93b22/src/hooks/useDeviceToken.tsx#L21-L61
 */
const registerTokenWithCredentials = async (token: string, credentials: Credentials) => {
  const client = new UserClient({ baseUrl: `${credentials.serverURL}/v2`, token: credentials.userJWTToken });
  console.info('posting token', token);
  if (Platform.OS === 'ios') {
    const payload = await apnsTokenPayload(token);
    try {
      await client.channels.saveMobilePushApnsToken(payload);
    } catch (error) {
      console.error('Error registering APNS token: ', error);
    }
  } else if (Platform.OS === 'android') {
    const payload = await fcmTokenPayload(token);
    try {
      await client.channels.saveMobilePushFcmToken(payload);
    } catch (error) {
      console.error('Error registering FCM token: ', error);
    }
  } else {
    console.warn(`not posting token on platform ${Platform.OS}`);
  }
};

const unregisterTokenWithCredentials = async (token: string, credentials: Credentials) => {
  console.log('deleting token', token);
  const client = new UserClient({ baseUrl: `${credentials.serverURL}/v2`, token: credentials.userJWTToken });

  if (Platform.OS === 'ios') {
    await client.channels.discardMobilePushApnsToken(token);
  } else if (Platform.OS === 'android') {
    await client.channels.discardMobilePushFcmToken(token);
  }
};

export default function useDeviceToken(credentials: Credentials | null | undefined) {
  const [token, setToken] = React.useState<string | null>(null);
  const [credentialsUsedToRegister, setCredentialsUsedToRegister] = React.useState<Credentials | null>(null);

  useEffect(() => {
    requestPermissionsAsync().then((permissions) => {
      console.log('permissions', permissions);
    });
    console.log('asking for token');
    getDevicePushTokenAsync().then((t) => {
      console.log('got token');
      if (t.type !== 'web') {
        // no handling for web tokens in this demo
        setToken(t.data);
      }
    });
  }, []);

  useEffect(() => {
    // No token, nothing to register/unregister
    if (!token) {
      return;
    }
    const loginChanged = credentialsUsedToRegister !== credentials;
    // If the credentials didn't change, we don't need to register/unregister
    if (!loginChanged) {
      return;
    }

    // The token was previously registered and needs to be unregistered after the login changed
    // (i.e. when logging in as a different user, or logging out)
    if (credentialsUsedToRegister) {
      unregisterTokenWithCredentials(token, credentialsUsedToRegister);
      setCredentialsUsedToRegister(null);
    }

    // We're logged in (after a logout, or after logging in as a new user) and need to register the token
    if (credentials) {
      registerTokenWithCredentials(token, credentials);
      setCredentialsUsedToRegister(credentials);
    }
  }, [token, credentials, credentialsUsedToRegister]);

  return token;
}
