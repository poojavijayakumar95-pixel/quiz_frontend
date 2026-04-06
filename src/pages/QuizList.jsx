import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ACCENTS = ['#7c3aed','#0ea5e9','#10b981','#f59e0b','#ec4899','#ef4444','#06b6d4'];

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/participant/quizzes')
      .then(r => setQuizzes(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading quizzes…" />;

  return (
    <div style={{ maxWidth:'980px', margin:'0 auto', padding:'2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom:'2rem' }}>
        <h1 style={{
          fontFamily:'Syne,sans-serif', fontWeight:'800',
          fontSize:'28px', color:'#e2e8f0',
          letterSpacing:'-0.5px', marginBottom:'6px',
        }}>Available Quizzes</h1>
        <p style={{ color:'#475569', fontSize:'14px' }}>
          {quizzes.length} quiz{quizzes.length!==1?'zes':''} ready to take
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div style={{
          textAlign:'center', padding:'4rem 2rem',
          background:'rgba(17,17,24,0.85)',
          border:'1px solid rgba(255,255,255,0.06)',
          borderRadius:'16px', color:'#334155',
        }}>
          <div style={{ fontSize:'48px', marginBottom:'16px', opacity:0.35 }}>📚</div>
          <p style={{ fontSize:'16px' }}>No quizzes available yet. Check back soon!</p>
        </div>
      ) : (
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',
          gap:'1rem',
        }}>
          {quizzes.map((quiz, i) => (
            <QuizCard
              key={quiz.id} quiz={quiz}
              accent={ACCENTS[i % ACCENTS.length]}
              onStart={() => navigate(`/participant/quiz/${quiz.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QuizCard({ quiz, accent, onStart }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        background:'rgba(17,17,24,0.92)',
        border:`1px solid ${hov ? accent+'55' : 'rgba(255,255,255,0.07)'}`,
        borderRadius:'16px', padding:'1.5rem',
        display:'flex', flexDirection:'column',
        transition:'all 0.25s',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? '0 10px 36px rgba(0,0,0,0.45)' : 'none',
        position:'relative', overflow:'hidden',
        cursor:'default',
        animation:'fadeIn 0.35s ease both',
      }}
    >
      {/* Top accent stripe */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, height:'3px',
        background:`linear-gradient(90deg,${accent},transparent)`,
        opacity: hov ? 1 : 0.45, transition:'opacity 0.25s',
      }}/>

      {/* Icon */}
      <div style={{
        width:'42px', height:'42px',
        background:`${accent}18`,
        border:`1px solid ${accent}30`,
        borderRadius:'10px',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'18px', marginBottom:'1rem',
      }}>📝</div>

      <h3 style={{
        fontFamily:'Syne,sans-serif', fontWeight:'700',
        fontSize:'16px', color:'#e2e8f0',
        marginBottom:'8px', lineHeight:'1.35',
      }}>{quiz.title}</h3>

      <p style={{
        color:'#475569', fontSize:'13px',
        lineHeight:'1.55', marginBottom:'1.25rem', flex:1,
        display:'-webkit-box', WebkitLineClamp:2,
        WebkitBoxOrient:'vertical', overflow:'hidden',
      }}>{quiz.description || 'No description provided.'}</p>

      {/* Chips */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        {[`⏱ ${quiz.timeLimitInMinutes} min`,`❓ ${quiz.questions?.length||0} questions`].map(t=>(
          <span key={t} style={{
            fontSize:'11px', color:'#64748b',
            background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:'6px', padding:'3px 8px',
          }}>{t}</span>
        ))}
      </div>

      {/* CTA */}
      <button onClick={onStart} style={{
        width:'100%', padding:'11px',
        background: hov ? accent : `${accent}1e`,
        border:`1px solid ${accent}55`,
        borderRadius:'10px',
        color: hov ? '#fff' : accent,
        fontFamily:'Syne,sans-serif', fontWeight:'700', fontSize:'14px',
        cursor:'pointer', transition:'all 0.25s',
        letterSpacing:'0.2px',
      }}>
        {hov ? 'Start Quiz →' : 'Start Quiz'}
      </button>
    </div>
  );
}

export function Loader({ text='Loading…' }) {
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
