/* eslint-disable import/prefer-default-export */
import io from 'socket.io-client';
import CONFIG from '../../../config';

const { SOCKET_SERVER_URL } = CONFIG;

let socket = null;

export const getUserInfo = () => {
  const userInfo = decodeURIComponent(sessionStorage.getItem('BBB_externUserID'));
  const userInfoArr = userInfo.split(',');
  const userID = userInfoArr[0];
  const socketID = encodeURIComponent(userInfoArr[1]);
  const canvasCode = userInfoArr[2];
  const accessToken = userInfoArr[3];

  return {
    userID,
    socketID,
    canvasCode,
    accessToken,
  };
};

export const getCanvasCode = () => {
  const { canvasCode } = getUserInfo();
  return canvasCode;
};

export const getSessionID = () => sessionStorage.getItem('BBB_meetingID');

export const initBBBNamespaceListeners = () => {
  socket.on('connect', () => {
    console.log('debug:bbb connected', socket.id);
  });
  socket.on('connect_error', (err) => {
    console.log(`debug:connect_error due to ${err.message}`);
    console.log('debug:', err);
  });
};

export const connectBBBNamespace = () => {
  if (socket !== null) {
    return;
  }
  const { userID, socketID, accessToken } = getUserInfo();
  const sessionID = sessionStorage.getItem('BBB_meetingID');
  const canvasCode = getCanvasCode();
  const url = `${SOCKET_SERVER_URL}/bbb?userID=${userID}&sessionID=${sessionID}&socketID=${socketID}&canvasCode=${canvasCode}&accessToken=${accessToken}`;
  socket = io(url);
  initBBBNamespaceListeners();
};

export const connectLiveServer = () => {
  console.log('connect live server');
  connectBBBNamespace();
};

export const disconnectLiveServer = () => {
  console.log('disconnect live server');
  if (socket === null) {
    return;
  }

  socket.disconnect();
  socket = null;
};

export const registerGlobalChannel = ({ channelName, callback }) => {
  socket.on(channelName, (data) => {
    console.log(`debug:socket event on ${channelName};payload:${data}`);
    callback(data);
  });
};

export const sendGlobalChannel = ({ channelName, msg }) => {
  socket.emit(channelName, msg);
};
