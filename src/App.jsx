import {
  BrowserRouter as Router, Routes, Route,
  Navigate, useNavigate, Link, useLocation,
} from 'react-router-dom';
import Login          from './pages/Login';
import Register       from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import QuizList       from './pages/QuizList';
import TakeQuiz       from './pages/TakeQuiz';
import QuizHistory    from './pages/QuizHistory';

/* ─── Protected Route ─────────────────────────────────────────── */
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');
  if (!token) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
};

/* ─── Navbar ──────────────────────────────────────────────────── */
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');

  if (!token) return null;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      height: '64px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      background: 'rgba(10,10,15,0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(124,58,237,0.2)',
    }}>
      {/* Left — logo + links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to={role === 'ADMIN' ? '/admin' : '/participant'}
          style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{
            width:'32px', height:'32px',
            background:'linear-gradient(135deg,#7c3aed,#a78bfa)',
            borderRadius:'8px',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'Syne,sans-serif', fontWeight:'800',
            fontSize:'16px', color:'#fff',
            boxShadow:'0 0 18px rgba(124,58,237,0.45)',
          }}>Q</div>
          <span style={{
            fontFamily:'Syne,sans-serif', fontWeight:'700',
            fontSize:'17px', color:'#e2e8f0', letterSpacing:'-0.3px',
          }}>QuizFlow</span>
        </Link>

        <div style={{ display:'flex', gap:'4px' }}>
          {role === 'ADMIN' && (
            <NavPill to="/admin" active={isActive('/admin')}>Dashboard</NavPill>
          )}
          {role === 'PARTICIPANT' && (
            <>
              <NavPill to="/participant" active={isActive('/participant')}>Quizzes</NavPill>
              <NavPill to="/participant/history" active={isActive('/participant/history')}>My History</NavPill>
            </>
          )}
        </div>
      </div>

      {/* Right — role badge + logout */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        <span style={{
          fontSize:'11px', fontWeight:'700',
          letterSpacing:'0.8px', textTransform:'uppercase',
          color: role === 'ADMIN' ? '#a78bfa' : '#34d399',
          background: role === 'ADMIN' ? 'rgba(124,58,237,0.12)' : 'rgba(52,211,153,0.1)',
          border:`1px solid ${role === 'ADMIN' ? 'rgba(124,58,237,0.3)' : 'rgba(52,211,153,0.22)'}`,
          padding:'3px 11px', borderRadius:'20px',
        }}>{role}</span>

        <button onClick={handleLogout} style={{
          background:'transparent',
          border:'1px solid rgba(239,68,68,0.3)',
          color:'#f87171',
          padding:'6px 16px', borderRadius:'8px',
          cursor:'pointer', fontSize:'13px', fontWeight:'500',
          transition:'all 0.2s',
          fontFamily:'inherit',
        }}
        onMouseEnter={e=>{e.target.style.background='rgba(239,68,68,0.12)';e.target.style.borderColor='rgba(239,68,68,0.55)';}}
        onMouseLeave={e=>{e.target.style.background='transparent';e.target.style.borderColor='rgba(239,68,68,0.3)';}}
        >Sign out</button>
      </div>
    </nav>
  );
};

const NavPill = ({ to, children, active }) => (
  <Link to={to} style={{
    textDecoration:'none',
    padding:'6px 14px', borderRadius:'8px',
    fontSize:'13px', fontWeight:'500',
    color: active ? '#a78bfa' : '#94a3b8',
    background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
    border:`1px solid ${active ? 'rgba(124,58,237,0.32)' : 'transparent'}`,
    transition:'all 0.2s',
  }}>{children}</Link>
);

/* ─── App ─────────────────────────────────────────────────────── */
function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ minHeight:'calc(100vh - 64px)', position:'relative', zIndex:1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/admin" element={
            <ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>
          }/>

          <Route path="/participant" element={
            <ProtectedRoute requiredRole="PARTICIPANT"><QuizList /></ProtectedRoute>
          }/>
          <Route path="/participant/quiz/:id" element={
            <ProtectedRoute requiredRole="PARTICIPANT"><TakeQuiz /></ProtectedRoute>
          }/>
          <Route path="/participant/history" element={
            <ProtectedRoute requiredRole="PARTICIPANT"><QuizHistory /></ProtectedRoute>
          }/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
