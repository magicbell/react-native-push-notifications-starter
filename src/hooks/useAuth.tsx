import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { Client as UserClient } from '@magicbell/user-client';
import useDeviceToken from './useDeviceToken';

const storageKey = 'mbv2';

export type Credentials = {
  userJWTToken: string;
  serverURL: string;
};

type CredentialsContextType = {
  credentials: Credentials | null | undefined;
  signIn: (c: Credentials) => void;
  signOut: () => void;
};

const CredentialsContext = createContext<CredentialsContextType | null>(null);

export const useCredentials = () => {
  const context = useContext(CredentialsContext);
  if (!context) {
    throw new Error('useCredentials must be used within a CredentialsProvider');
  }
  return [context.credentials, context.signIn, context.signOut] as const;
};

export default function CredentialsProvider({ children }: { children: React.ReactElement }) {
  const [credentials, setCredentials] = useState<Credentials | null | undefined>(undefined);

  useDeviceToken(credentials);

  const signIn = useCallback(async (c: Credentials) => {
    storeCredentials(c);
    const validCredentials = await getCredentials();
    if (validCredentials) {
      setCredentials(validCredentials);
    } else {
      await deleteCredentials();
      setCredentials(null);
    }
  }, []);
  const signOut = useCallback(async () => {
    await deleteCredentials();
    setCredentials(null);
  }, []);

  useEffect(() => {
    getCredentials().then((c) => {
      setCredentials(c);
    });
  }, []);

  return <CredentialsContext.Provider value={{ credentials, signIn, signOut }}>{children}</CredentialsContext.Provider>;
}

const getCredentials = async () => {
  const value = await AsyncStorage.getItem(storageKey);
  if (!value) {
    return null;
  }
  try {
    const { serverURL, userJWTToken } = JSON.parse(value);
    const client = new UserClient({
      token: userJWTToken,
      baseUrl: `${serverURL}/v2`,
    });

    // Doing a basic request to see if the token is valid.
    // TODO: replace this with a more generic endpoint like `/v2/config` once that's available in the API spec
    const testResponse = await client.channels.getMobilePushExpoTokens();
    if (testResponse) {
      return { serverURL, userJWTToken };
    }
  } catch (e) {
    console.error('Error parsing credentials', e);
    await deleteCredentials();
    return null;
  }
};

const storeCredentials = async (value: Credentials) => {
  const jsonValue = JSON.stringify(value);
  await AsyncStorage.setItem(storageKey, jsonValue);
};

const deleteCredentials = async () => {
  await AsyncStorage.removeItem(storageKey);
};
