import { createContext, useCallback, useState } from 'react';

const CustomAppContext = createContext();

// TODO rehydrate from persistent storage (localStorage.getItem(myLastSavedStateKey)) ?
/**
 * isLock: used for global students mic enable/disable, Note: students mic will still be in disabled
 * isGlobalMicMuted: used to mute/unmute all students
 * @returns
 */
const getDefaultState = () => ({
  isLock: true,
  isGlobalMicMuted: true,
  sessionAttendeesInfo: [],
});

export const updateIsLockContext = (values = true) => ({ isLock: values });
export const updateIsGlobalMicMutedContext = (values = true) => ({
  isGlobalMicMuted: values,
});
export const updateAttendeesInfoContext = (values = []) => ({
  sessionAttendeesInfo: [...values],
});

const useCustomAppContext = () => {
  const [state, setState] = useState(getDefaultState());

  // here we only re-create setContext when its dependencies change ([state, setState])
  const setContext = useCallback(
    (updates) => {
      setState({ ...state, ...updates });
    },
    [state, setState],
  );

  /**
   * here context value is just returning an object,
   * but only re-creating the object when its dependencies change ([state, setContext])
   */
  const getContextValue = useCallback(
    () => ({
      ...state,
      setContext,
    }),
    [state, setContext],
  );

  return { setContext, getContextValue };
};

export { CustomAppContext, useCustomAppContext };