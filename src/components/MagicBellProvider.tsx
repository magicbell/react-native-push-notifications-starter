import * as MagicBell from '@magicbell/react-headless';
import React, { PropsWithChildren } from 'react';
import { useCredentials } from '../hooks/useAuth';

interface IProps {}
export default function MagicBellProvider({ children }: PropsWithChildren<IProps>) {
  const [credentials] = useCredentials();

  if (credentials) {
    return (
      <MagicBell.MagicBellProvider serverURL={credentials.serverURL} token={credentials.userJWTToken}>
        <>{children}</>
      </MagicBell.MagicBellProvider>
    );
  }

  return children;
}
