/* eslint-disable import/prefer-default-export */
import io from 'socket.io-client';
import CONFIG from '../../../../config';
import Service from '../../../ui/components/audio/service';
import AudioManager from '/imports/ui/services/audio-manager';
import UserListService from '/imports/ui/components/user-list/service';
import Auth from '/imports/ui/services/auth';

const { LIVE_CLASS_SERVER_URL } = CONFIG;

let isWebCamSharing = false;

export const getWebCamSharing = () => isWebCamSharing;

export const setWebCamSharing = (isSharing) => {
  isWebCamSharing = isSharing;
};

export const OUTPUT_CHANNEL = {
  SESSION_STATUS: 'SESSION_STATUS',
  TAB_STATUS: 'TAB_STATUS',
  MICROPHONE_STATUS: 'MICROPHONE_STATUS',
  WEBCAM_STATUS: 'WEBCAM_STATUS',
  SCREEN_SHARE_STATUS: 'SCREEN_SHARE_STATUS',
  MESSAGE_SENT: 'MESSAGE_SENT',
  SPEAKING_STATUS: 'SPEAKING_STATUS',
  STORE_IS_VIEWERS_GLOBAL_MIC_DISABLED: 'STORE_IS_VIEWERS_GLOBAL_MIC_DISABLED',
  STORE_SESSION_ATTENDEE_INFO: 'STORE_SESSION_ATTENDEE_INFO',
  MUTE_ONE_ATTENDEE: 'MUTE_ONE_ATTENDEE',
  UNMUTE_ONE_ATTENDEE: 'UNMUTE_ONE_ATTENDEE',
};

export const OUTPUT_MESSAGE = {
  CONFERENCE_READY: 'CONFERENCE_READY',
  SWITCHED_TO_CHAT_TAB: 'SWITCHED_TO_CHAT_TAB',
  SWITCHED_TO_VIDEO_TAB: 'SWITCHED_TO_VIDEO_TAB',
  SWITCHED_TO_USERS_TAB: 'SWITCHED_TO_USERS_TAB',
  MICROPHONE_ENABLED: 'MICROPHONE_ENABLED',
  MICROPHONE_DISABLED: 'MICROPHONE_DISABLED',
  WEBCAM_ENABLED: 'WEBCAM_ENABLED',
  WEBCAM_DISABLED: 'WEBCAM_DISABLED',
  SCREEN_SHARE_ENABLED: 'SCREEN_SHARE_ENABLED',
  SCREEN_SHARE_DISABLED: 'SCREEN_SHARE_DISABLED',
};

export const INPUT_CHANNEL = {
  CHANGE_TAB_TO: 'CHANGE_TAB_TO',
  TOGGLE_MICROPHONE_TO: 'TOGGLE_MICROPHONE_TO',
  TOGGLE_WEBCAM_TO: 'TOGGLE_WEBCAM_TO',
  TOGGLE_SCREEN_SHARE_TO: 'TOGGLE_SCREEN_SHARE_TO',
  UPDATE_IS_VIEWERS_GLOBAL_MIC_DISABLED:
    'UPDATE_IS_VIEWERS_GLOBAL_MIC_DISABLED',
  UPDATE_SESSION_ATTENDEES_INFO: 'UPDATE_SESSION_ATTENDEES_INFO',
};

export const INPUT_MESSAGE = {
  CHAT_TAB: 'CHAT_TAB',
  VIDEO_TAB: 'VIDEO_TAB',
  USERS_TAB: 'USERS_TAB',
  ENABLE_MICROPHONE: 'ENABLE_MICROPHONE',
  DISABLE_MICROPHONE: 'DISABLE_MICROPHONE',
  ENABLE_WEBCAM: 'ENABLE_WEBCAM',
  DISABLE_WEBCAM: 'DISABLE_WEBCAM',
  ENABLE_SCREEN_SHARE: 'ENABLE_SCREEN_SHARE',
  DISABLE_SCREEN_SHARE: 'DISABLE_SCREEN_SHARE',
};

let socket = null;
let socketKneuraNamespace = null;

export const getUserInfo = () => {
  const userInfo = sessionStorage.getItem('BBB_externUserID');
  const userInfoArr = userInfo.split(',');
  const userID = userInfoArr[0];
  const socketID = encodeURIComponent(userInfoArr[1]);
  const flowID = userInfoArr[2];
  const accessToken = userInfoArr[3];

  return {
    userID,
    socketID,
    flowID,
    accessToken,
  };
};

export const getUserKneuraID = () => getUserInfo().userID;

export const getFlowID = () => {
  const { flowID } = getUserInfo();
  return flowID;
};

export const getSessionID = () => sessionStorage.getItem('BBB_meetingID');

export const handleAudioConnection = () => {
  if (Service.isConnected()) {
    console.log('debug: audio is connected');
  } else {
    console.log('debug: audio is not connected');
    setTimeout(() => {
      if (!Service.isConnected()) {
        console.log(
          'debug: 5s after connect: audio is not connected:',
          Service.isConnected()
        );
        AudioManager.joinMicrophone();
      } else {
        console.log('debug: 5s after connect: audio is connected');
      }
    }, 5000);
  }
};

/**
 * Note:
 * toggle microphone of self
 * @param {*} msg
 */
export const handleToggleMicrophoneSelf = (msg) => {
  console.log('debug:bbb received', msg);

  const users = UserListService.getUsers();
  const user = users.find((user) => user.userId === Auth.userID);
  if (!user) {
    return;
  }

  const { extId, userId } = user;
  const userKneuraID = extId.split(',')[0];

  if (msg === INPUT_MESSAGE.ENABLE_MICROPHONE) {
    console.log('debug:bbb received enable microphone');
    UserListService.toggleVoice(userId);
    sendStoreUnmuteOne({ userKneuraID });
  } else if (msg === INPUT_MESSAGE.DISABLE_MICROPHONE) {
    console.log('debug:bbb received disable microphone', {
      userKneuraID,
      userId,
    });
    UserListService.toggleVoice(userId);
    sendStoreMuteOne({ userKneuraID });
  }
};

export const initBBBNamespaceListeners = () => {
  socket.on('connect', () => {
    console.log('debug:bbb connected', socket.id);
    handleAudioConnection();
  });
  socket.on('connect_error', (err) => {
    console.log(`debug:connect_error due to ${err.message}`);
    console.log('debug:', err);
  });
  socket.on(INPUT_CHANNEL.TOGGLE_MICROPHONE_TO, handleToggleMicrophoneSelf);
};

export const connectBBBNamespace = () => {
  if (socket !== null) {
    return;
  }
  const { userID, socketID, accessToken } = getUserInfo();
  const sessionID = sessionStorage.getItem('BBB_meetingID');
  const url = `${LIVE_CLASS_SERVER_URL}/bbb?userID=${userID}&sessionID=${sessionID}&socketID=${socketID}&token=${accessToken}`;
  socket = io(url, { path: '/live-class-server-socket' });
  initBBBNamespaceListeners();
};

export const getKneuraNamespaceSocketURL = () => {
  const { accessToken, flowID } = getUserInfo();
  const paramsObj = {
    token: accessToken,
    flowID,
    device: 'WEB',
  };
  const searchParams = new URLSearchParams(paramsObj).toString();
  return `${LIVE_CLASS_SERVER_URL}/kneura?${searchParams}`;
};

export const initKneuraNamespaceListeners = () => {
  socketKneuraNamespace.on('connect', () => {
    console.log('debug:hello kneura', socketKneuraNamespace.id);
  });
};

export const connectKneuraNamespace = () => {
  if (socketKneuraNamespace !== null) {
    return;
  }

  const url = getKneuraNamespaceSocketURL();
  socketKneuraNamespace = io(url, { path: '/live-class-server-socket' });
  initKneuraNamespaceListeners();
};

export const connectLiveServer = () => {
  connectBBBNamespace();
};

export const disconnectLiveServer = () => {
  if (socket === null) {
    return;
  }

  socket.disconnect();
  socket = null;
};

export const onLiveServerConnected = (callback) => {
  socket.on('connect', () => callback());
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

export const sendVideoEnabledMessage = () => {
  sendGlobalChannel({
    channelName: OUTPUT_CHANNEL.WEBCAM_STATUS,
    msg: OUTPUT_MESSAGE.WEBCAM_ENABLED,
  });
};

export const sendVideoDisabledMessage = () => {
  sendGlobalChannel({
    channelName: OUTPUT_CHANNEL.WEBCAM_STATUS,
    msg: OUTPUT_MESSAGE.WEBCAM_DISABLED,
  });
};

const serializeData = ({ isViewersGlobalMicDisabled }) => {
  const payload = { isViewersGlobalMicDisabled };
  return JSON.stringify(payload);
};

const constructStoreIsViewersGlobalMicStatus = (data) => {
  const { isViewersGlobalMicDisabled } = data;
  return serializeData({ isViewersGlobalMicDisabled });
};

export const sendStoreIsViewersGlobalMicDisabled = ({
  isViewersGlobalMicDisabled,
}) => {
  sendGlobalChannel({
    channelName: OUTPUT_CHANNEL.STORE_IS_VIEWERS_GLOBAL_MIC_DISABLED,
    msg: constructStoreIsViewersGlobalMicStatus({ isViewersGlobalMicDisabled }),
  });
};

export const sendStoreMuteOne = ({ userKneuraID }) => {
  sendGlobalChannel({
    channelName: OUTPUT_CHANNEL.MUTE_ONE_ATTENDEE,
    msg: JSON.stringify({ userKneuraID }),
  });
};

export const sendStoreUnmuteOne = ({ userKneuraID }) => {
  sendGlobalChannel({
    channelName: OUTPUT_CHANNEL.UNMUTE_ONE_ATTENDEE,
    msg: JSON.stringify({ userKneuraID }),
  });
};
