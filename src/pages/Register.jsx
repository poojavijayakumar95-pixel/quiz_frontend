import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function Field({ label, type, value, onChange, placeholder, required }) {
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
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{
          width:'100%', padding:'11px 14px',
          background:'rgba(10,10,15,0.85)',
          border:`1px solid ${focused ? 'rgba(124,58,237,0.7)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius:'10px', color:'#e2e8f0',
          fontSize:'14px', outline:'none', transition:'all 0.2s',
          boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
          fontFamily:'inherit',
        }}
      />
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState({
    username:'', email:'', password:'', role:'PARTICIPANT',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        'Registration failed. Email may already be in use.'
      );
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
      <div style={{
        position:'absolute', top:'-12%', right:'-6%',
        width:'480px', height:'480px',
        background:'radial-gradient(circle,rgba(124,58,237,0.11) 0%,transparent 70%)',
        borderRadius:'50%', pointerEvents:'none',
      }}/>

      <div style={{
        width:'100%', maxWidth:'440px',
        background:'rgba(17,17,24,0.88)',
        backdropFilter:'blur(24px)',
        border:'1px solid rgba(124,58,237,0.22)',
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
          }}>Create account</h1>
          <p style={{ color:'#475569', fontSize:'13px' }}>Join QuizFlow today</p>
        </div>

        {error && (
          <div style={{
            background:'rgba(239,68,68,0.1)',
            border:'1px solid rgba(239,68,68,0.3)',
            borderRadius:'10px', padding:'10px 14px',
            color:'#f87171', fontSize:'13px', marginBottom:'1.25rem',
          }}>⚠ {error}</div>
        )}

        <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <Field label="Username"      type="text"     value={form.username} onChange={set('username')} placeholder="johndoe"            required />
          <Field label="Email address" type="email"    value={form.email}    onChange={set('email')}    placeholder="you@example.com"    required />
          <Field label="Password"      type="password" value={form.password} onChange={set('password')} placeholder="Create a strong password" required />

          {/* Role toggle */}
          <div>
            <div style={{
              fontSize:'11px', fontWeight:'600', color:'#475569',
              marginBottom:'8px', letterSpacing:'0.6px', textTransform:'uppercase',
            }}>I am a</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              {[
                { value:'PARTICIPANT', emoji:'🧑‍🎓', label:'Participant' },
                { value:'ADMIN',       emoji:'⚙️',   label:'Admin'       },
              ].map(r => (
                <button key={r.value} type="button"
                  onClick={() => setForm(f=>({...f,role:r.value}))}
                  style={{
                    padding:'10px',
                    background: form.role===r.value ? 'rgba(124,58,237,0.18)' : 'rgba(10,10,15,0.65)',
                    border:`1px solid ${form.role===r.value ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius:'10px',
                    color: form.role===r.value ? '#a78bfa' : '#64748b',
                    cursor:'pointer',
                    fontFamily:'Syne,sans-serif', fontWeight:'700', fontSize:'13px',
                    transition:'all 0.2s', letterSpacing:'0.2px',
                  }}
                >{r.emoji} {r.label}</button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            marginTop:'4px', padding:'13px',
            background: loading ? 'rgba(124,58,237,0.45)' : 'linear-gradient(135deg,#7c3aed,#6d28d9)',
            border:'none', borderRadius:'12px',
            color:'#fff',
            fontFamily:'Syne,sans-serif', fontWeight:'700', fontSize:'15px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition:'all 0.2s',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.42)',
          }}>
            {loading ? 'Creating account…' : 'Create account →'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:'1.5rem', color:'#475569', fontSize:'13px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#a78bfa', textDecoration:'none', fontWeight:'500' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
