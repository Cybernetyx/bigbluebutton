import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';
import ActionsBarService from '/imports/ui/components/actions-bar/service';
import LearningDashboardService from '/imports/ui/components/learning-dashboard/service';
import UserListService from '/imports/ui/components/user-list/service';
import WaitingUsersService from '/imports/ui/components/waiting-users/service';
import logger from '/imports/startup/client/logger';
import { defineMessages, injectIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import UserOptions from './component';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { updateLockSettings } from '/imports/ui/components/lock-viewers/service';
import { CustomAppContext } from '../../../../custom/context/useCustomAppContext';

const propTypes = {
  users: PropTypes.arrayOf(Object).isRequired,
  clearAllEmojiStatus: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

const intlMessages = defineMessages({
  clearStatusMessage: {
    id: 'app.userList.content.participants.options.clearedStatus',
    description: 'Used in toast notification when emojis have been cleared',
  },
});

const { dynamicGuestPolicy } = Meteor.settings.public.app;

const meetingMuteDisabledLog = () => logger.info({
  logCode: 'useroptions_unmute_all',
  extraInfo: { logType: 'moderator_action' },
}, 'moderator disabled meeting mute');

const UserOptionsContainer = withTracker((props) => {
  const {
    users,
    clearAllEmojiStatus,
    intl,
    isLock,
    isGlobalMicMuted,
    setContext,
    sessionAttendeesInfo,
  } = props;

  const toggleStatus = () => {
    clearAllEmojiStatus(users);

    notify(
      intl.formatMessage(intlMessages.clearStatusMessage), 'info', 'clear_status',
    );
  };

  const isMeetingMuteOnStart = () => {
    const { voiceProp } = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'voiceProp.muteOnStart': 1 } });
    const { muteOnStart } = voiceProp;
    return muteOnStart;
  };

  const getMeetingName = () => {
    const { meetingProp } = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'meetingProp.name': 1 } });
    const { name } = meetingProp;
    return name;
  };

  const isRTL = layoutSelect((i) => i.isRTL);
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID });

  return {
    isLock,
    isGlobalMicMuted,
    setContext,
    customMuteAllUsers: () => {
      users.forEach((user) => {
        if (user.role !== 'MODERATOR') {
          const voiceUser = UserListService.curatedVoiceUser(user.userId);
          const subjectVoiceUser = voiceUser;

          const hasAuthority = true;

          const allowedToMuteAudio = hasAuthority
            && subjectVoiceUser.isVoiceUser
            && !subjectVoiceUser.isMuted
            && !subjectVoiceUser.isListenOnly;

          if (allowedToMuteAudio) {
            UserListService.toggleVoice(user.userId);
          }
        }
      });
    },
    customUnmuteAllUsers: () => {
      users.forEach((user) => {
        if (user.role !== 'MODERATOR') {
          const voiceUser = UserListService.curatedVoiceUser(user.userId);
          const subjectVoiceUser = voiceUser;

          const hasAuthority = true;
          const allowedToUnmuteAudio = hasAuthority
            && subjectVoiceUser.isVoiceUser
            && !subjectVoiceUser.isListenOnly
            && subjectVoiceUser.isMuted;

          if (allowedToUnmuteAudio) {
            /**
             * user is allowed to be unmuted only if isMicDisabled is false for the user
             */
            const { extId } = user;
            const userKneuraId = extId.split(',')[0];
            const findQuery = (sessionAttendeeInfo) => (
              sessionAttendeeInfo.userKneuraID === userKneuraId
            );
            const attendeeInfo = sessionAttendeesInfo.find(findQuery);
            if (!attendeeInfo.isMicDisabled) {
              UserListService.toggleVoice(user.userId);
            }
          }
        }
      });
    },
    toggleMuteAllUsers: () => {
      UserListService.muteAllUsers(Auth.userID);
      if (isMeetingMuteOnStart()) {
        return meetingMuteDisabledLog();
      }
      return logger.info({
        logCode: 'useroptions_mute_all',
        extraInfo: { logType: 'moderator_action' },
      }, 'moderator enabled meeting mute, all users muted');
    },
    toggleMuteAllUsersExceptPresenter: () => {
      UserListService.muteAllExceptPresenter(Auth.userID);
      if (isMeetingMuteOnStart()) {
        return meetingMuteDisabledLog();
      }
      return logger.info({
        logCode: 'useroptions_mute_all_except_presenter',
        extraInfo: { logType: 'moderator_action' },
      }, 'moderator enabled meeting mute, all users muted except presenter');
    },
    lockAllUsers: (users) => {
      users.forEach((user) => {
        if (!user.locked && user.role !== 'MODERATOR') {
          UserListService.toggleUserLock(user.userId, true);
        }
      })
    },
    unlockAllUsers: (users) => {
      users.forEach((user) => {
        if (user.locked && user.role !== 'MODERATOR') {
          UserListService.toggleUserLock(user.userId, false);
        }
      })
    },
    meeting,
    toggleMicrophoneLockSettings: () => {
      const { lockSettingsProps } = meeting;
      const isMicDisabled = lockSettingsProps.disableMic;
      lockSettingsProps.disableMic = !lockSettingsProps.disableMic;
      updateLockSettings(lockSettingsProps);

      /** toggling will enable microphone */
      if (isMicDisabled) {
        users.filter((user) => user.role !== 'MODERATOR').forEach((user) => {
          /** is user is not locked, lock the user */
          if (!user.locked) {
            UserListService.toggleUserLock(user.userId, true);
          }
          /** unmute all users */
          UserListService.toggleVoice(user.userId);
        })
      }
    },
    toggleStatus,
    isMeetingMuted: isMeetingMuteOnStart(),
    amIModerator: ActionsBarService.amIModerator(),
    getUsersNotAssigned: ActionsBarService.getUsersNotAssigned,
    hasBreakoutRoom: UserListService.hasBreakoutRoom(),
    isBreakoutRecordable: ActionsBarService.isBreakoutRecordable(),
    guestPolicy: WaitingUsersService.getGuestPolicy(),
    isMeteorConnected: Meteor.status().connected,
    meetingName: getMeetingName(),
    openLearningDashboardUrl: LearningDashboardService.openLearningDashboardUrl,
    dynamicGuestPolicy,
    isRTL,
  };
})(UserOptions);

UserOptionsContainer.propTypes = propTypes;

const UserOptionsContainerWithData = (props) => {
  const {
    isGlobalMicMuted,
    setContext,
    isLock,
    sessionAttendeesInfo,
  } = useContext(CustomAppContext);
  return (
    <UserOptionsContainer
      {...props}
      isLock={isLock}
      isGlobalMicMuted={isGlobalMicMuted}
      setContext={setContext}
      sessionAttendeesInfo={sessionAttendeesInfo}
    />
  );
};

export default injectIntl(UserOptionsContainerWithData);
