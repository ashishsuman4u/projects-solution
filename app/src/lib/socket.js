import { io } from 'socket.io-client';
console.log(process.env.REACT_APP_BASE_SOCKET_API_URL);
export const socket = io(process.env.REACT_APP_BASE_SOCKET_API_URL, {
  autoConnect: false,
  path: '/v1/',
});
