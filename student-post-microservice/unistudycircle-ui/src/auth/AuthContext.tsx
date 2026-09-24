import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from "react";
import type {User} from "oidc-client-ts";
import {userManager} from "./authConfig";
type AuthContextValue={user:User|null;loading:boolean;login:()=>Promise<void>;logout:()=>Promise<void>};
const AuthContext=createContext<AuthContextValue|undefined>(undefined);
export function AuthProvider({children}:{children:ReactNode}){
  const [user,setUser]=useState<User|null>(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{let active=true;
    userManager.getUser().then(u=>{if(active)setUser(u)}).finally(()=>{if(active)setLoading(false)});
    const loaded=(u:User)=>setUser(u), unloaded=()=>setUser(null);
    userManager.events.addUserLoaded(loaded); userManager.events.addUserUnloaded(unloaded);
    return()=>{active=false;userManager.events.removeUserLoaded(loaded);userManager.events.removeUserUnloaded(unloaded)};
  },[]);
  const value=useMemo(()=>({user,loading,login:()=>userManager.signinRedirect(),logout:()=>userManager.signoutRedirect()}),[user,loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){const v=useContext(AuthContext);if(!v)throw new Error("useAuth must be used inside AuthProvider");return v;}