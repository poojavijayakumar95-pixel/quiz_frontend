import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function Loader({ text='Loading…' }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      minHeight:'50vh', gap:'1rem',
    }}>
      <div style={{
        width:'36px', height:'36px',
        border:'3px solid rgba(124,58,237,0.2)',
        borderTopColor:'#7c3aed',
        borderRadius:'50%',
        animation:'spin 0.8s linear infinite',
      }}/>
      <p style={{ color:'#475569', fontSize:'14px' }}>{text}</p>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      background:'rgba(17,17,24,0.92)',
      border:'1px solid rgba(255,255,255,0.07)',
      borderRadius:'14px', padding:'1.25rem',
      position:'relative', overflow:'hidden',
    }}>
      <div style={{
        position:'absolute', top:0, left:0, right:0,
        height:'3px', background:color, opacity:0.65,
      }}/>
      <div style={{ fontSize:'20px', marginBottom:'8px' }}>{icon}</div>
      <div style={{
        fontFamily:'Syne,sans-serif', fontWeight:'800',
        fontSize:'28px', color:'#e2e8f0',
        lineHeight:1, marginBottom:'4px',
      }}>{value}</div>
      <div style={{ fontSize:'12px', color:'#475569', fontWeight:'500', letterSpacing:'0.3px' }}>
        {label}
      </div>
    </div>
  );
}

export default function QuizHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/participant/quizzes/history')
      .then(r => setHistory(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading history…" />;

  /* Computed stats */
  const total  = history.length;
  const avgPct = total
    ? Math.round(history.reduce((a,h) => a + h.percentage, 0) / total)
    : 0;
  const best   = total ? Math.round(Math.max(...history.map(h=>h.percentage))) : 0;
  const passed = history.filter(h => h.percentage >= 60).length;

  return (
    <div style={{ maxWidth:'920px', margin:'0 auto', padding:'2rem 1.5rem' }}>

      {/* Header */}
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'flex-start',
        marginBottom:'2rem',
      }}>
        <div>
          <h1 style={{
            fontFamily:'Syne,sans-serif', fontWeight:'800',
            fontSize:'28px', color:'#e2e8f0',
            letterSpacing:'-0.5px', marginBottom:'6px',
          }}>My History</h1>
          <p style={{ color:'#475569', fontSize:'14px' }}>
            {total} quiz{total!==1?'zes':''} completed
          </p>
        </div>
        <Link to="/participant" style={{
          textDecoration:'none',
          padding:'10px 20px',
          background:'linear-gradient(135deg,#7c3aed,#6d28d9)',
          borderRadius:'10px', color:'#fff',
          fontFamily:'Syne,sans-serif', fontWeight:'700', fontSize:'13px',
          boxShadow:'0 4px 16px rgba(124,58,237,0.38)',
          transition:'opacity 0.2s',
        }}>Take a Quiz →</Link>
      </div>

      {/* Stats row */}
      {total > 0 && (
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(3,1fr)',
          gap:'1rem', marginBottom:'1.5rem',
        }}>
          <StatCard label="Average Score"  value={`${avgPct}%`}          color="#7c3aed" icon="📊" />
          <StatCard label="Best Score"     value={`${best}%`}            color="#22c55e" icon="🏆" />
          <StatCard label="Quizzes Passed" value={`${passed} / ${total}`} color="#f59e0b" icon="✅" />
        </div>
      )}

      {/* Empty state */}
      {total === 0 ? (
        <div style={{
          textAlign:'center', padding:'4rem 2rem',
          background:'rgba(17,17,24,0.85)',
          border:'1px solid rgba(255,255,255,0.06)',
          borderRadius:'16px',
        }}>
          <div style={{ fontSize:'48px', marginBottom:'16px', opacity:0.35 }}>📋</div>
          <p style={{ color:'#334155', fontSize:'16px', marginBottom:'1rem' }}>
            No quizzes taken yet.
          </p>
          <Link to="/participant" style={{
            color:'#a78bfa', textDecoration:'none', fontSize:'14px',
          }}>Browse available quizzes →</Link>
        </div>
      ) : (
        /* Table */
        <div style={{
          background:'rgba(17,17,24,0.92)',
          border:'1px solid rgba(124,58,237,0.2)',
          borderRadius:'16px', overflow:'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display:'grid',
            gridTemplateColumns:'2fr 1.2fr 90px 80px',
            gap:'1rem',
            padding:'12px 1.5rem',
            background:'rgba(10,10,15,0.65)',
            borderBottom:'1px solid rgba(255,255,255,0.06)',
          }}>
            {['Quiz','Date','Score','Result'].map(h => (
              <span key={h} style={{
                fontSize:'10px', fontWeight:'700', color:'#334155',
                letterSpacing:'0.9px', textTransform:'uppercase',
              }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {history.map((attempt, i) => {
            const pct    = Math.round(attempt.percentage);
            const passed = pct >= 60;
            return (
              <HistoryRow
                key={attempt.attemptId}
                attempt={attempt} pct={pct} passed={passed}
                last={i === total - 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function HistoryRow({ attempt, pct, passed, last }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        display:'grid',
        gridTemplateColumns:'2fr 1.2fr 90px 80px',
        gap:'1rem',
        padding:'1rem 1.5rem',
        borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.04)',
        alignItems:'center',
        background: hov ? 'rgba(124,58,237,0.04)' : 'transparent',
        transition:'background 0.18s',
        animation:'fadeIn 0.3s ease both',
      }}
    >
      {/* Title */}
      <div>
        <p style={{
          fontFamily:'Syne,sans-serif', fontWeight:'700',
          fontSize:'14px', color:'#e2e8f0', marginBottom:'3px',
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        }}>{attempt.quizTitle}</p>
        <p style={{ fontSize:'12px', color:'#334155' }}>
          {attempt.totalQuestions} questions
        </p>
      </div>

      {/* Date */}
      <div>
        <p style={{ fontSize:'13px', color:'#64748b' }}>
          {new Date(attempt.attemptDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
        </p>
        <p style={{ fontSize:'12px', color:'#334155' }}>
          {new Date(attempt.attemptDate).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
        </p>
      </div>

      {/* Score */}
      <div>
        <span style={{
          fontFamily:'Syne,sans-serif', fontWeight:'700',
          fontSize:'15px', color:'#e2e8f0',
        }}>{attempt.score}/{attempt.totalQuestions}</span>
      </div>

      {/* Badge */}
      <div>
        <span style={{
          display:'inline-block',
          padding:'4px 12px', borderRadius:'20px',
          fontSize:'13px', fontWeight:'700',
          fontFamily:'Syne,sans-serif',
          background: passed ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
          border:`1px solid ${passed ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: passed ? '#4ade80' : '#f87171',
        }}>{pct}%</span>
      </div>
    </div>
  );
}
