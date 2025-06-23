import React, { useEffect, useState } from 'react';
import { Tabs } from '@aws-amplify/ui-react';
import { fetchUserClaims } from '../lib/user';
import Chat from './Chat';
import Projects from './Projects';
import Register from './Register';

export default function Home(props) {
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    // React advises to declare the async function directly inside useEffect
    async function getToken() {
      setUserData(await fetchUserClaims());
    }
    getToken();
  }, []);

  if (props?.user?.authenticated && !userData) {
    return <>Loading...</>;
  }
  console.log(userData);
  const isAdmin = userData?.role === 'admin';
  const isManager = userData?.role === 'manager';
  return (
    <main>
      <h1>Hello {props?.user?.signInDetails?.loginId}</h1>
      <button onClick={props?.signOut}>Sign out</button>

      <Tabs
        justifyContent="flex-start"
        defaultValue="chat"
        items={[
          { label: 'Chat', value: 'chat', content: <Chat userData={userData} /> },
          {
            label: 'Projects',
            value: 'projects',
            content: <Projects userData={userData} />,
            isDisabled: !isAdmin && !isManager,
          },
          {
            label: 'Register User',
            value: 'register',
            content: <Register userData={userData} />,
            isDisabled: !isAdmin,
          },
        ]}
      />
    </main>
  );
}
