import {useEffect, useState, type FormEvent, type ReactNode} from "react";
import {Navigate, Route, Routes, Link, useNavigate} from "react-router-dom";
import {userManager} from "./auth/authConfig";
import {useAuth} from "./auth/AuthContext";
import {createTopic, listMyTopics, listTopics, type Topic} from "./api/topics";

function Layout({children}: {children: ReactNode}) {
  const {user, logout} = useAuth();
  const navigate = useNavigate();
  const role = String(user?.profile.role ?? user?.profile.roles ?? "STUDENT");
  return <div className="app-shell"><header className="topbar"><Link className="brand" to="/">UniStudyCircle</Link>
    <nav>{role === "ADMIN" ? <><Link to="/admin/users">Users</Link><Link to="/admin/topics">All Topics</Link></> : <>
      <Link to="/student/profile">My Profile</Link><Link to="/student/topics">Public Topics</Link><Link to="/student/my-topics">My Topics</Link><Link to="/student/topics/new">Create Topic</Link>
    </>}<button onClick={async () => { await logout(); navigate("/"); }}>Logout</button></nav>
  </header><main className="content">{children}</main></div>;
}

function Login() {
  const {user, login, loading} = useAuth();
  if (loading) return <div className="center-card">Checking authentication…</div>;
  if (user) return <Navigate to="/" replace/>;
  return <div className="center-card"><h1>UniStudyCircle</h1><p>Authentication test application</p><button className="primary" onClick={login}>Login with IAM</button><p className="muted">OAuth2 Authorization Code + PKCE</p></div>;
}

function Callback() {
  const navigate = useNavigate();
  useEffect(() => { userManager.signinCallback().then(() => navigate("/", {replace: true})).catch(error => { console.error(error); navigate("/?error=callback", {replace: true}); }); }, [navigate]);
  return <div className="center-card">Completing login…</div>;
}

function Home() {
  const {user} = useAuth();
  if (!user) return <Navigate to="/login" replace/>;
  const role = String(user.profile.role ?? user.profile.roles ?? "STUDENT");
  return <Layout><section className="hero"><h1>Welcome, {user.profile.name ?? user.profile.preferred_username ?? user.profile.sub}</h1><p>Authenticated successfully through the IAM service.</p><div className="token-card"><strong>Token present</strong><span>Access token acquired via OAuth2/OIDC.</span></div><p>Detected role: <strong>{role}</strong></p></section></Layout>;
}

function TopicCards({topics, emptyMessage}: {topics: Topic[]; emptyMessage: string}) {
  if (topics.length === 0) return <div className="notice">{emptyMessage}</div>;
  return <div className="topic-grid">{topics.map(topic => <article className="topic-card" key={topic.topicId}>
    <div className="topic-card-header"><h3>{topic.topicName}</h3><time>{topic.topicDate}</time></div><p>{topic.topicContent}</p><footer>Posted by {topic.studentName || "Student"}</footer>
  </article>)}</div>;
}

function TopicList({mine = false}: {mine?: boolean}) {
  const {user} = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const username = String(user?.profile.username ?? user?.profile.preferred_username ?? user?.profile.sub ?? "");
  const accessToken = user?.access_token;
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    if (mine && !accessToken) {
      setError("Your session does not have an access token. Please sign in again.");
      setLoading(false);
      return () => { active = false; };
    }
    const request = mine ? listMyTopics(username, accessToken!) : listTopics();
    request.then(result => { if (active) setTopics(result); }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "Unable to load topics."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [accessToken, mine, username]);
  const title = mine ? "My Topics" : "Public Topics";
  return <Layout><section className="page-card wide-card"><div className="page-heading"><div><h2>{title}</h2><p>{mine ? "Topics created under your IAM username." : "Topics shared by the UniStudyCircle community."}</p></div><Link className="primary link-button" to="/student/topics/new">Create Topic</Link></div>
    {loading ? <p className="muted">Loading topics…</p> : error ? <div className="notice error">{error}</div> : <TopicCards topics={topics} emptyMessage={mine ? "You have not created a topic yet." : "No topics have been published yet."}/>}
  </section></Layout>;
}

function CreateTopic() {
  const {user} = useAuth();
  const navigate = useNavigate();
  const username = String(user?.profile.username ?? user?.profile.preferred_username ?? user?.profile.sub ?? "");
  const [topicName, setTopicName] = useState("");
  const [topicDate, setTopicDate] = useState(new Date().toISOString().slice(0, 10));
  const [topicContent, setTopicContent] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericStudentId = Number(studentId);
    if (!user?.access_token || !Number.isInteger(numericStudentId) || numericStudentId < 1) { setError("Enter a valid student ID before creating a topic."); return; }
    setSaving(true); setError("");
    try {
      await createTopic({topicName, topicDate, topicContent, studentId: numericStudentId, studentName: username}, user.access_token);
      navigate("/student/my-topics");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create the topic.");
    } finally { setSaving(false); }
  }
  return <Layout><section className="page-card"><h2>Create Topic</h2><p>Your IAM username (<strong>{username}</strong>) will be associated with this topic.</p>
    <form className="topic-form" onSubmit={submit}>
      <label>Topic title<input value={topicName} onChange={event => setTopicName(event.target.value)} maxLength={255} required/></label>
      <label>Date<input type="date" value={topicDate} onChange={event => setTopicDate(event.target.value)} required/></label>
      <label>Student ID<input type="number" min="1" value={studentId} onChange={event => setStudentId(event.target.value)} required/></label>
      <label>Topic content<textarea value={topicContent} onChange={event => setTopicContent(event.target.value)} rows={7} required/></label>
      {error && <div className="notice error">{error}</div>}<button className="primary" disabled={saving}>{saving ? "Creating…" : "Create Topic"}</button>
    </form>
  </section></Layout>;
}

function Placeholder({title, description}: {title: string; description: string}) { return <Layout><div className="page-card"><h2>{title}</h2><p>{description}</p></div></Layout>; }

function ProtectedRoutes() {
  const {user} = useAuth();
  if (!user) return <Navigate to="/login" replace/>;
  return <Routes>
    <Route path="/" element={<Home/>}/><Route path="/student/profile" element={<Placeholder title="My Profile" description="Student profile."/>}/>
    <Route path="/student/topics" element={<TopicList/>}/><Route path="/student/my-topics" element={<TopicList mine/>}/><Route path="/student/topics/new" element={<CreateTopic/>}/>
    <Route path="/admin/users" element={<Placeholder title="Users" description="Admin view of all users."/>}/><Route path="/admin/topics" element={<TopicList/>}/><Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}

export default function App() { return <Routes><Route path="/login" element={<Login/>}/><Route path="/auth/callback" element={<Callback/>}/><Route path="/*" element={<ProtectedRoutes/>}/></Routes>; }
