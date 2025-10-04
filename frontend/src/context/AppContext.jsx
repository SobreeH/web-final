import { createContext } from "react";
import { doctors } from "../assets/frontend/assets";
export const AppContext = createContext();

const AppContextProvider = (props) => {
  const value = {
    doctors,
  };

  return (
    <AppContextProvider value={value}>{props.children}</AppContextProvider>
  );
};

export default AppContextProvider;
