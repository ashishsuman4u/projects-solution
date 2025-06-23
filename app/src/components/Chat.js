import React, { useState, useEffect, useRef } from 'react';
import { ChatClient } from './ChatClient';

export default function Chat({ userData }) {
  const socket = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [members, setMembers] = useState([]);
  const [chatRows, setChatRows] = useState([]);

  const onSocketOpen = () => {
    setIsConnected(true);
    socket.current?.send(JSON.stringify({ action: 'setUser', user: userData }));
  };

  const onSocketClose = () => {
    setMembers([]);
    setIsConnected(false);
    setChatRows([]);
  };

  const onSocketMessage = (dataStr) => {
    const data = JSON.parse(dataStr);
    console.log('data', data);
    if (data.users) {
      setMembers(data.users);
    }
    if (data.message) {
      setChatRows((oldArray) => [
        ...oldArray,
        <span>
          <b>{data.message}</b>
        </span>,
      ]);
    }
  };

  const onConnect = () => {
    if (socket.current?.readyState !== WebSocket.OPEN) {
      socket.current = new WebSocket(process.env.REACT_APP_BASE_SOCKET_API_URL);
      socket.current.addEventListener('open', onSocketOpen);
      socket.current.addEventListener('close', onSocketClose, (event) => {
        onSocketMessage(event.data);
      });
      socket.current.addEventListener('message', (event) => {
        onSocketMessage(event.data);
      });
      socket.current.addEventListener('users', (event) => {
        onSocketMessage(event.data);
      });
    }
  };

  useEffect(() => {
    return () => {
      socket.current?.close();
    };
  }, []);

  const onSendPrivateMessage = (email, to) => {
    const message = prompt('Enter private message for ' + email);
    socket.current?.send(
      JSON.stringify({
        action: 'sendPrivateMessage',
        user: userData,
        message: {
          message: `${userData.userEmail} (Private) - ${message}`,
          to,
        },
      })
    );
  };

  const onSendPublicMessage = () => {
    const message = prompt('Enter public message');
    socket.current?.send(
      JSON.stringify({
        action: 'sendPublicMessage',
        user: userData,
        message: { message: `${userData.userEmail} - ${message}` },
      })
    );
  };

  const onDisconnect = (data) => {
    console.log(data);
    if (isConnected) {
      socket.current?.close();
    }
  };

  return (
    <ChatClient
      isConnected={isConnected}
      members={members}
      chatRows={chatRows}
      onPublicMessage={onSendPublicMessage}
      onPrivateMessage={onSendPrivateMessage}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
      userData={userData}
    />
  );
}
