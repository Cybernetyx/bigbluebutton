import React, { useContext, useEffect, useState } from 'react';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import UserListService from '/imports/ui/components/user-list/service';
import StudentsMicrophone from './component';
import { CustomAppContext, updateIsLockContext } from '../context/useCustomAppContext';
import { sendStoreIsViewersGlobalMicDisabled } from '../../../../utils/custom/socket/liveclass-server';

const StudentsMicrophoneContainer = (props) => {
  const [lockSettingsProps, setLockSettingsProps] = useState();
  const { isLock, setContext } = useContext(CustomAppContext);
  const users = UserListService.getUsers();
  const currentUser = users.find((user) => user.userId === Auth.userID);

  useEffect(() => {
    const meeting = Meetings.findOne({ meetingId: Auth.meetingID });
    setLockSettingsProps(meeting.lockSettingsProps);
  }, []);

  const customMuteAllUsers = () => {
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
  };

  /**
   * enable/disable mic for all students
   * mute all users when disabling mic of all users
   */
  const toggleMicrophoneLockSettings = () => {
    const isViewersGlobalMicDisabled = isLock;
    if (!isViewersGlobalMicDisabled) {
      customMuteAllUsers();
    }
    setContext(updateIsLockContext(!isLock));
    sendStoreIsViewersGlobalMicDisabled({ isViewersGlobalMicDisabled: !isLock });
  };

  if (!lockSettingsProps || currentUser.role !== 'MODERATOR') {
    return <></>;
  }

  return (
    <StudentsMicrophone
      lockSettingsProps={lockSettingsProps}
      isLock={isLock}
      toggleMicrophoneLockSettings={toggleMicrophoneLockSettings}
    />
  );
};

export default StudentsMicrophoneContainer;