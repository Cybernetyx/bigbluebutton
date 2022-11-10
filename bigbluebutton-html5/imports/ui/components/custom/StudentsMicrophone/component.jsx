import React from 'react';
import MutedIcon from './MutedIcon';
import UnmuteIcon from './UnmutedIcon';
// import { styles } from './styles.scss';
import TooltipContainer from '/imports/ui/components/common/tooltip/container';

const StudentsMicrophone = (props) => {
  const { lockSettingsProps, toggleMicrophoneLockSettings, isLock } = props;

  const label = isLock
    ? 'Enable students microphone'
    : 'Disable students microphone';

  // const toggleBtnClasses = {};
  // toggleBtnClasses[styles.btn] = false;
  // toggleBtnClasses[styles.btnWithNotificationDot] = false;

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