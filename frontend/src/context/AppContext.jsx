import { createContext, useMemo, useState } from 'react';

export const AppContext = createContext(null);

export function AppContextProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = useMemo(
    () => ({
      user,
      setUser,
    }),
    [user]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
