import React from 'react';
import { Amplify } from 'aws-amplify';

import { useAuthenticator, Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import awsExports from './aws-exports';
import Home from './components/Home';

Amplify.configure(awsExports);

export default function App() {
  const { route, user, signOut } = useAuthenticator((context) => [context.route]);
  return route === 'authenticated' ? (
    <Home user={user} signOut={signOut} />
  ) : (
    <div style={{ marginTop: '50px' }}>
      <Authenticator loginMechanisms={['email']} hideSignUp />
    </div>
  );
}
