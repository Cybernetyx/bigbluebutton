import React from 'react';
import Button from '/imports/ui/components/button/component';
import MutedIcon from './MutedIcon';
import UnmuteIcon from './UnmutedIcon';
import cx from 'classnames';
import { styles } from '../../nav-bar/styles.scss';
import TooltipContainer from '/imports/ui/components/tooltip/container';

const StudentsMicrophone = (props) => {
  const { lockSettingsProps, toggleMicrophoneLockSettings, isLock } = props;

  const label = isLock
    ? 'Enable students microphone'
    : 'Disable students microphone';

  const toggleBtnClasses = {};
  toggleBtnClasses[styles.btn] = false;
  toggleBtnClasses[styles.btnWithNotificationDot] = false;

  const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' };

  return (
    <>
      <TooltipContainer
        title={label}
      >
        <div onClick={toggleMicrophoneLockSettings} style={containerStyle}>
          {isLock ? <MutedIcon /> : <UnmuteIcon />}
        </div>
      </TooltipContainer>
    </>
  );
};

export default StudentsMicrophone;