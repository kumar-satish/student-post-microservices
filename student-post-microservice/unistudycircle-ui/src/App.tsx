import {useEffect} from "react";
import {Navigate,Route,Routes,Link,useNavigate} from "react-router-dom";
import {userManager} from "./auth/authConfig";
import {useAuth} from "./auth/AuthContext";

function Layout({children}:{children:React.ReactNode}){
 const {user,logout}=useAuth(); const navigate=useNavigate();
 const role=String(user?.profile.role??user?.profile.roles??"STUDENT");
 return <div className="app-shell"><header className="topbar"><Link className="brand" to="/">UniStudyCircle</Link>
 <nav>{role==="ADMIN"?<><Link to="/admin/users">Users</Link><Link to="/admin/topics">All Topics</Link></>:<>
 <Link to="/student/profile">My Profile</Link><Link to="/student/topics">Public Topics</Link><Link to="/student/my-topics">My Topics</Link><Link to="/student/topics/new">Create Topic</Link></>}
 <button onClick={async()=>{await logout();navigate("/")}}>Logout</button></nav></header><main className="content">{children}</main></div>;
}
function Login(){const {user,login,loading}=useAuth();if(loading)return <div className="center-card">Checking authentication…</div>;if(user)return <Navigate to="/" replace/>;
 return <div className="center-card"><h1>UniStudyCircle</h1><p>Authentication test application</p><button className="primary" onClick={login}>Login with IAM</button><p className="muted">OAuth2 Authorization Code + PKCE</p></div>;
}
function Callback(){const navigate=useNavigate();useEffect(()=>{userManager.signinCallback().then(()=>navigate("/",{replace:true})).catch(e=>{console.error(e);navigate("/?error=callback",{replace:true})})},[navigate]);return <div className="center-card">Completing login…</div>;}
function Home(){const {user}=useAuth();if(!user)return <Navigate to="/login" replace/>;const role=String(user.profile.role??user.profile.roles??"STUDENT");
 return <Layout><section className="hero"><h1>Welcome, {user.profile.name??user.profile.preferred_username??user.profile.sub}</h1><p>Authenticated successfully through the IAM service.</p><div className="token-card"><strong>Token present</strong><span>Access token acquired via OAuth2/OIDC.</span></div><p>Detected role: <strong>{role}</strong></p></section></Layout>;
}
function Placeholder({title,description}:{title:string;description:string}){return <Layout><div className="page-card"><h2>{title}</h2><p>{description}</p><div className="notice">Backend endpoint is intentionally not guessed. Connect this page to your existing Student/Topic controller after confirming the exact API contract.</div></div></Layout>;}
function ProtectedRoutes(){const {user}=useAuth();if(!user)return <Navigate to="/login" replace/>;return <Routes>
 <Route path="/" element={<Home/>}/>
 <Route path="/student/profile" element={<Placeholder title="My Profile" description="Student profile."/>}/>
 <Route path="/student/topics" element={<Placeholder title="Public Topics" description="View public topics only."/>}/>
 <Route path="/student/my-topics" element={<Placeholder title="My Topics" description="View, update and delete your own topics."/>}/>
 <Route path="/student/topics/new" element={<Placeholder title="Create Topic" description="Create a new topic post."/>}/>
 <Route path="/admin/users" element={<Placeholder title="Users" description="Admin view of all users."/>}/>
 <Route path="/admin/topics" element={<Placeholder title="All Topics" description="Admin view of all topics/posts."/>}/>
 <Route path="*" element={<Navigate to="/" replace/>}/>
 </Routes>;}
export default function App(){return <Routes><Route path="/login" element={<Login/>}/><Route path="/auth/callback" element={<Callback/>}/><Route path="/*" element={<ProtectedRoutes/>}/></Routes>;}