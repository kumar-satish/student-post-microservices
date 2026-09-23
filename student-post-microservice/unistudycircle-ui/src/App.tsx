import {useEffect, useState, type FormEvent, type ReactNode} from "react";
import {Navigate, Route, Routes, Link, useNavigate, useParams} from "react-router-dom";
import {userManager} from "./auth/authConfig";
import {useAuth} from "./auth/AuthContext";
import {createTopic, deleteTopic, getTopic, listAdminTopics, listMyTopics, listTopics, updateTopic, type Topic} from "./api/topics";
import {createUser, deleteUser, listUsers, setUserActive, type IamUser} from "./api/users";

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
  useEffect(() => { if (!loading && !user) void login(); }, [loading, user, login]);
  if (loading) return <div className="center-card">Checking authentication…</div>;
  if (user) return <Navigate to="/" replace/>;
  return <div className="center-card">Redirecting to sign in…</div>;
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

function TopicCards({topics, emptyMessage, onEdit, onDelete}: {topics: Topic[]; emptyMessage: string; onEdit?: (topic: Topic) => void; onDelete?: (topic: Topic) => void}) {
  if (topics.length === 0) return <div className="notice">{emptyMessage}</div>;
  return <div className="topic-grid">{topics.map(topic => <article className="topic-card" key={topic.topicId}>
    <div className="topic-card-header"><h3><Link to={`/topics/${topic.topicId}`}>{topic.topicName}</Link></h3><time>{topic.topicDate}</time></div><p>{topic.topicContent.length > 160 ? `${topic.topicContent.slice(0, 160)}…` : topic.topicContent}</p><footer>Posted by {topic.ownerUsername || topic.studentName || "Student"} · {topic.visibility}</footer><Link className="read-more" to={`/topics/${topic.topicId}`}>Read topic</Link>
    {onEdit && onDelete && <div className="actions"><button onClick={() => onEdit(topic)}>Edit</button><button className="danger" onClick={() => onDelete(topic)}>Delete</button></div>}
  </article>)}</div>;
}

function TopicDetails() {
  const {id} = useParams(); const {user} = useAuth(); const [topic, setTopic] = useState<Topic | null>(null); const [error, setError] = useState("");
  useEffect(() => { if (!id || !user?.access_token) return; getTopic(id, user.access_token).then(setTopic).catch(reason => setError(reason instanceof Error ? reason.message : "Unable to load the topic.")); }, [id, user?.access_token]);
  return <Layout><section className="page-card wide-card">{error ? <div className="notice error">{error}</div> : !topic ? <p className="muted">Loading topic…</p> : <article className="topic-detail"><div className="page-heading"><div><h2>{topic.topicName}</h2><p>Posted by {topic.ownerUsername || topic.studentName || "Student"} · {topic.visibility}</p></div><time>{topic.topicDate}</time></div><p>{topic.topicContent}</p></article>}</section></Layout>;
}

function TopicEditor({topic, onCancel, onSave}: {topic: Topic; onCancel: () => void; onSave: (topic: Topic) => Promise<void>}) {
  const [topicName, setTopicName] = useState(topic.topicName); const [topicDate, setTopicDate] = useState(topic.topicDate); const [topicContent, setTopicContent] = useState(topic.topicContent); const [visibility, setVisibility] = useState(topic.visibility); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); setError(""); try { await onSave({...topic, topicName, topicDate, topicContent, visibility}); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save the topic."); } finally { setSaving(false); } }
  return <form className="topic-form editor" onSubmit={submit}><h3>Edit topic</h3><label>Topic title<input value={topicName} onChange={event => setTopicName(event.target.value)} required/></label><label>Date<input type="date" value={topicDate} onChange={event => setTopicDate(event.target.value)} required/></label><label>Visibility<select value={visibility} onChange={event => setVisibility(event.target.value as Topic["visibility"])}><option value="PRIVATE">Private — only me</option><option value="PUBLIC">Public</option></select></label><label>Topic content<textarea rows={6} value={topicContent} onChange={event => setTopicContent(event.target.value)} required/></label>{error && <div className="notice error">{error}</div>}<div className="actions"><button className="primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button><button type="button" onClick={onCancel}>Cancel</button></div></form>;
}

function TopicList({mine = false, admin = false}: {mine?: boolean; admin?: boolean}) {
  const {user} = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Topic | null>(null);
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
    const request = admin ? listAdminTopics(accessToken!) : mine ? listMyTopics(accessToken!) : listTopics();
    request.then(result => { if (active) setTopics(result); }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "Unable to load topics."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [accessToken, mine, admin, username]);
  const title = admin ? "All Topics" : mine ? "My Topics" : "Public Topics";
  const editable = mine || admin;
  async function save(topic: Topic) { if (!accessToken) return; const updated = await updateTopic(topic.topicId, topic, accessToken); setTopics(current => current.map(item => item.topicId === updated.topicId ? updated : item)); setEditing(null); }
  async function remove(topic: Topic) { if (!accessToken || !window.confirm(`Delete “${topic.topicName}”?`)) return; try { await deleteTopic(topic.topicId, accessToken); setTopics(current => current.filter(item => item.topicId !== topic.topicId)); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to delete the topic."); } }
  return <Layout><section className="page-card wide-card"><div className="page-heading"><div><h2>{title}</h2><p>{mine ? "Topics created under your IAM username." : admin ? "Manage topics from every student." : "Topics shared by the UniStudyCircle community."}</p></div>{!admin && <Link className="primary link-button" to="/student/topics/new">Create Topic</Link>}</div>
    {editing && <TopicEditor topic={editing} onCancel={() => setEditing(null)} onSave={save}/>} {loading ? <p className="muted">Loading topics…</p> : error ? <div className="notice error">{error}</div> : <TopicCards topics={topics} emptyMessage={mine ? "You have not created a topic yet." : "No topics have been published yet."} onEdit={editable ? setEditing : undefined} onDelete={editable ? remove : undefined}/>}
  </section></Layout>;
}

function AdminUsers() {
  const {user} = useAuth(); const token = user?.access_token; const [users, setUsers] = useState<IamUser[]>([]); const [error, setError] = useState(""); const [username, setUsername] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [role, setRole] = useState<IamUser["role"]>("STUDENT");
  useEffect(() => { if (!token) return; listUsers(token).then(setUsers).catch(reason => setError(reason instanceof Error ? reason.message : "Unable to load users.")); }, [token]);
  async function add(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!token) return; setError(""); try { const added = await createUser({username, email, password, role}, token); setUsers(current => [...current, added]); setUsername(""); setEmail(""); setPassword(""); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to create user."); } }
  async function active(account: IamUser) { if (!token) return; try { const updated = await setUserActive(account.id, !account.enabled, token); setUsers(current => current.map(item => item.id === updated.id ? updated : item)); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to update user."); } }
  async function remove(account: IamUser) { if (!token || !window.confirm(`Delete user “${account.username}”?`)) return; try { await deleteUser(account.id, token); setUsers(current => current.filter(item => item.id !== account.id)); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to delete user."); } }
  return <Layout><section className="page-card wide-card"><h2>IAM Users</h2><p>Create, deactivate, reactivate, or remove student accounts.</p><form className="user-form" onSubmit={add}><input placeholder="Username" value={username} onChange={event => setUsername(event.target.value)} minLength={3} required/><input type="email" placeholder="Email" value={email} onChange={event => setEmail(event.target.value)} required/><input type="password" placeholder="Password (8+ chars)" value={password} onChange={event => setPassword(event.target.value)} minLength={8} required/><select value={role} onChange={event => setRole(event.target.value as IamUser["role"])}><option value="STUDENT">Student</option><option value="ADMIN">Admin</option></select><button className="primary">Add user</button></form>{error && <div className="notice error">{error}</div>}<div className="user-list">{users.map(account => <div className="user-row" key={account.id}><div><strong>{account.username}</strong><span>{account.email} · {account.role} · {account.enabled ? "Active" : "Deactivated"}</span></div><div className="actions"><button onClick={() => active(account)}>{account.enabled ? "Deactivate" : "Activate"}</button><button className="danger" onClick={() => remove(account)}>Delete</button></div></div>)}</div></section></Layout>;
}

function CreateTopic() {
  const {user} = useAuth();
  const navigate = useNavigate();
  const username = String(user?.profile.username ?? user?.profile.preferred_username ?? user?.profile.sub ?? "");
  const [topicName, setTopicName] = useState("");
  const [topicDate, setTopicDate] = useState(new Date().toISOString().slice(0, 10));
  const [topicContent, setTopicContent] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PRIVATE");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user?.access_token) { setError("Please sign in again."); return; }
    setSaving(true); setError("");
    try {
      await createTopic({topicName, topicDate, topicContent, visibility}, user.access_token);
      navigate("/student/my-topics");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create the topic.");
    } finally { setSaving(false); }
  }
  return <Layout><section className="page-card"><h2>Create Topic</h2><p>Your IAM username (<strong>{username}</strong>) will be associated with this topic.</p>
    <form className="topic-form" onSubmit={submit}>
      <label>Topic title<input value={topicName} onChange={event => setTopicName(event.target.value)} maxLength={255} required/></label>
      <label>Date<input type="date" value={topicDate} onChange={event => setTopicDate(event.target.value)} required/></label>
      <label>Visibility<select value={visibility} onChange={event => setVisibility(event.target.value as "PUBLIC" | "PRIVATE")}><option value="PRIVATE">Private — only me</option><option value="PUBLIC">Public</option></select></label>
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
    <Route path="/student/topics" element={<TopicList/>}/><Route path="/student/my-topics" element={<TopicList mine/>}/><Route path="/student/topics/new" element={<CreateTopic/>}/><Route path="/topics/:id" element={<TopicDetails/>}/>
    <Route path="/admin/users" element={<AdminUsers/>}/><Route path="/admin/topics" element={<TopicList admin/>}/><Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}

export default function App() { return <Routes><Route path="/login" element={<Login/>}/><Route path="/auth/callback" element={<Callback/>}/><Route path="/*" element={<ProtectedRoutes/>}/></Routes>; }
