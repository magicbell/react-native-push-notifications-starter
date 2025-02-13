import * as MagicBell from '@magicbell/react-headless';
import React, { PropsWithChildren } from 'react';
import { Credentials, useCredentials } from '../hooks/useAuth';

export type ClientSettings = {
  apiKey: string;
  userEmail?: string;
  userExternalId?: string;
  userKey?: string;
  serverURL: string;
};

/**
 * MagicBellProvider does not support authentication via JWT Tokens yet.
 *
 * This is a workaround that deconstructs the JWT token to get to the base set of credentials.
 * Unfortunately we don't support HMAC this way.
 */
function clientSettingsFromCredentials(credentials: Credentials): ClientSettings {
  let jwtDataString = atob(credentials.userJWTToken.split('.')[1]);
  let jwtData = JSON.parse(jwtDataString);

  let tokenRole = jwtData['Role'];
  if (tokenRole !== 'USER') {
    console.error('JWT Token without User role');
  }

  let user = jwtData['UserKey'];
  let project = jwtData['ProjectKey'];

  let serverURL = credentials.serverURL;
  let apiKey = project['APIKey'];
  let userEmail = user['Email'];
  let userExternalId = user['ExternalID'];

  return {
    serverURL,
    apiKey,
    ...(Boolean(userEmail) && { userEmail }),
    ...(Boolean(userExternalId) && { userExternalId }),
  };
}

interface IProps {}
export default function MagicBellProvider({ children }: PropsWithChildren<IProps>) {
  const [credentials] = useCredentials();

  if (credentials) {
    return (
      <MagicBell.MagicBellProvider {...clientSettingsFromCredentials(credentials)}>
        <>{children}</>
      </MagicBell.MagicBellProvider>
    );
  }

  return children;
}
