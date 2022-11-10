import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import BreakoutService from '/imports/ui/components/breakout-room/service';
import Auth from '/imports/ui/services/auth';
import UserListItem from './component';
import UserListService from '/imports/ui/components/user-list/service';
import { layoutDispatch } from '../../../../layout/context';
import { sendStoreMuteOne, sendStoreUnmuteOne } from '../../../../../../utils/custom/socket/liveclass-server';

const UserListItemContainer = (props) => {
  const layoutContextDispatch = layoutDispatch();

  const {
    toggleVoice,
    removeUser,
    toggleUserLock,
    changeRole,
    ejectUserCameras,
    assignPresenter,
    getAvailableActions,
    normalizeEmojiName,
    getGroupChatPrivate,
    hasPrivateChatBetweenUsers,
  } = UserListService;

  const { user } = props;

  const customMuteUser = () => {
    const voiceUser = UserListService.curatedVoiceUser(user.userId);
    const subjectVoiceUser = voiceUser;

    const hasAuthority = true;

    const allowedToMuteAudio = hasAuthority
      && subjectVoiceUser.isVoiceUser
      && !subjectVoiceUser.isMuted
      && !subjectVoiceUser.isListenOnly;

    const { extId } = user;
    const userKneuraID = extId.split(',')[0];

    if (allowedToMuteAudio) {
      UserListService.toggleVoice(user.userId);
      sendStoreMuteOne({ userKneuraID });
    }
  };
  const customUnmuteUser = () => {
    const voiceUser = UserListService.curatedVoiceUser(user.userId);
    const subjectVoiceUser = voiceUser;

    const hasAuthority = true;

    const allowedToUnmuteAudio = hasAuthority
      && subjectVoiceUser.isVoiceUser
      && subjectVoiceUser.isMuted
      && !subjectVoiceUser.isListenOnly;

    const { extId } = user;
    const userKneuraID = extId.split(',')[0];

    if (allowedToUnmuteAudio) {
      UserListService.toggleVoice(user.userId);
      sendStoreUnmuteOne({ userKneuraID });
    }
  };

  return <UserListItem {
    ...{
      layoutContextDispatch,
      toggleVoice,
      removeUser,
      toggleUserLock,
      changeRole,
      ejectUserCameras,
      assignPresenter,
      getAvailableActions,
      normalizeEmojiName,
      getGroupChatPrivate,
      hasPrivateChatBetweenUsers,
      customMuteUser,
      customUnmuteUser,
      ...props,
    }
  } />;
};
const isMe = (intId) => intId === Auth.userID;

export default withTracker(({ user }) => {
  const findUserInBreakout = user ? BreakoutService.getBreakoutUserIsIn(user.userId) : false;
  const findUserLastBreakout = user ? BreakoutService.getBreakoutUserWasIn(user.userId, null) : null;
  const breakoutSequence = (findUserInBreakout || {}).sequence;

  return {
    isMe,
    userInBreakout: !!findUserInBreakout,
    userLastBreakout: findUserLastBreakout,
    breakoutSequence,
    isMeteorConnected: Meteor.status().connected,
    voiceUser: user ? UserListService.curatedVoiceUser(user.userId) : null,
    getEmojiList: UserListService.getEmojiList(),
    getEmoji: UserListService.getEmoji(),
    usersProp: UserListService.getUsersProp(),
    selectedUserId: Session.get('dropdownOpenUserId'),
  };
})(UserListItemContainer);
