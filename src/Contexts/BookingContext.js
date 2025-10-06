import React, { createContext, useContext} from "react";
import { useFavorites } from "../Hooks/LocalStorage";
import { useBookmarks } from "../Hooks/LocalStorage";
import { useShortlist } from "../Hooks/LocalStorage";

const AppContext = createContext();

export const AppProvider = ({children}) => {

    const favorites = useFavorites();
    const bookmarks = useBookmarks();
    const shortlist = useShortlist();

    const value = {
        favorites,
        bookmarks,
        shortlist
    };

    return(
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context){
        throw new Error('useApp must be usd within an AppProvider');
    }
    return context;
};
