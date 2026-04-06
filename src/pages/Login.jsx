import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

/* ─── Reusable styled input ──────────────────────────────────── */
function Field({ label, type, value, onChange, placeholder, name, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display:'block', fontSize:'11px', fontWeight:'600',
        color:'#475569', marginBottom:'6px',
        letterSpacing:'0.6px', textTransform:'uppercase',
      }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        onFocus={() => setFocused(true)}
        onBlur={()  => setFocused(false)}
        style={{
          width:'100%', padding:'11px 14px',
          background:'rgba(10,10,15,0.85)',
          border:`1px solid ${focused ? 'rgba(124,58,237,0.7)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius:'10px', color:'#e2e8f0',
          fontSize:'14px', outline:'none',
          transition:'all 0.2s',
          boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
          fontFamily:'inherit',
        }}
      />
    </div>
  );
}

/* ─── Login Page ─────────────────────────────────────────────── */
export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role',  res.data.role);
      navigate(res.data.role === 'ADMIN' ? '/admin' : '/participant');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:'calc(100vh - 64px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'2rem', position:'relative', overflow:'hidden',
    }}>
      {/* Background glow blobs */}
      <div style={{
        position:'absolute', top:'-15%', left:'-8%',
        width:'520px', height:'520px',
        background:'radial-gradient(circle,rgba(124,58,237,0.13) 0%,transparent 70%)',
        borderRadius:'50%', pointerEvents:'none',
      }}/>
      <div style={{
        position:'absolute', bottom:'-20%', right:'-8%',
        width:'400px', height:'400px',
        background:'radial-gradient(circle,rgba(167,139,250,0.07) 0%,transparent 70%)',
        borderRadius:'50%', pointerEvents:'none',
      }}/>

      {/* Card */}
      <div style={{
        width:'100%', maxWidth:'420px',
        background:'rgba(17,17,24,0.88)',
        backdropFilter:'blur(24px)',
        border:'1px solid rgba(124,58,237,0.25)',
        borderRadius:'20px', padding:'2.5rem',
        position:'relative', zIndex:1,
        animation:'fadeIn 0.4s ease both',
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{
            width:'52px', height:'52px',
            background:'linear-gradient(135deg,#7c3aed,#a78bfa)',
            borderRadius:'14px',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 1rem',
            fontFamily:'Syne,sans-serif', fontWeight:'800',
            fontSize:'22px', color:'#fff',
            boxShadow:'0 0 28px rgba(124,58,237,0.45)',
          }}>Q</div>
          <h1 style={{
            fontFamily:'Syne,sans-serif', fontWeight:'700',
            fontSize:'24px', color:'#e2e8f0', marginBottom:'5px',
          }}>Welcome back</h1>
          <p style={{ color:'#475569', fontSize:'13px' }}>Sign in to continue to QuizFlow</p>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            background:'rgba(239,68,68,0.1)',
            border:'1px solid rgba(239,68,68,0.3)',
            borderRadius:'10px', padding:'10px 14px',
            color:'#f87171', fontSize:'13px',
            marginBottom:'1.25rem',
            display:'flex', alignItems:'center', gap:'8px',
          }}>⚠ {error}</div>
        )}

        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <Field label="Email address" type="email"    value={email}    onChange={e=>setEmail(e.target.value)}    placeholder="you@example.com"  required />
          <Field label="Password"      type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"          required />

          <button type="submit" disabled={loading} style={{
            marginTop:'4px', padding:'13px',
            background: loading
              ? 'rgba(124,58,237,0.45)'
              : 'linear-gradient(135deg,#7c3aed,#6d28d9)',
            border:'none', borderRadius:'12px',
            color:'#fff',
            fontFamily:'Syne,sans-serif', fontWeight:'700', fontSize:'15px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition:'all 0.2s',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.42)',
            letterSpacing:'0.3px',
          }}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:'1.5rem', color:'#475569', fontSize:'13px' }}>
          No account yet?{' '}
          <Link to="/register" style={{ color:'#a78bfa', textDecoration:'none', fontWeight:'500' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
