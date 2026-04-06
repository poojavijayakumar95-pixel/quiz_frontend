import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

/* ─── Loader ─────────────────────────────────────────────────── */
function Loader({ text='Loading…' }) {
  return (
    <div style={{
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      minHeight:'60vh', gap:'1rem',
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

/* ─── Result Screen ──────────────────────────────────────────── */
function ResultScreen({ result, quizTitle, navigate }) {
  const pct    = Math.round(result.percentage);
  const passed = pct >= 60;
  const emoji  = pct >= 80 ? '🏆' : pct >= 60 ? '✅' : '📖';

  return (
    <div style={{
      minHeight:'calc(100vh - 64px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'2rem', position:'relative', overflow:'hidden',
    }}>
      <div style={{
        position:'absolute', top:'35%', left:'50%',
        transform:'translate(-50%,-50%)',
        width:'500px', height:'500px',
        background:`radial-gradient(circle,${passed ? 'rgba(34,197,94,0.09)':'rgba(239,68,68,0.09)'} 0%,transparent 70%)`,
        pointerEvents:'none',
      }}/>

      <div style={{
        maxWidth:'460px', width:'100%',
        background:'rgba(17,17,24,0.95)',
        border:`1px solid ${passed ? 'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'}`,
        borderRadius:'20px', padding:'2.5rem',
        textAlign:'center', position:'relative',
        animation:'fadeIn 0.4s ease both',
      }}>
        <div style={{ fontSize:'52px', marginBottom:'1rem' }}>{emoji}</div>

        <h2 style={{
          fontFamily:'Syne,sans-serif', fontWeight:'800',
          fontSize:'26px', color:'#e2e8f0', marginBottom:'6px',
        }}>Quiz Complete!</h2>
        <p style={{ color:'#475569', fontSize:'14px', marginBottom:'2rem' }}>
          {quizTitle}
        </p>

        {/* Score card */}
        <div style={{
          background:'rgba(10,10,15,0.75)',
          border:'1px solid rgba(255,255,255,0.07)',
          borderRadius:'14px', padding:'1.5rem', marginBottom:'1.5rem',
        }}>
          <div style={{
            fontFamily:'Syne,sans-serif', fontWeight:'800',
            fontSize:'58px', lineHeight:1,
            color: passed ? '#4ade80' : '#f87171',
            marginBottom:'4px',
          }}>{pct}%</div>
          <p style={{ color:'#64748b', fontSize:'14px' }}>
            {result.score} of {result.totalQuestions} correct
          </p>
          {/* Progress bar */}
          <div style={{
            marginTop:'1rem', height:'6px',
            background:'rgba(255,255,255,0.06)',
            borderRadius:'3px', overflow:'hidden',
          }}>
            <div style={{
              height:'100%', width:`${pct}%`,
              background: passed
                ? 'linear-gradient(90deg,#16a34a,#4ade80)'
                : 'linear-gradient(90deg,#dc2626,#f87171)',
              borderRadius:'3px', transition:'width 1s ease-out',
            }}/>
          </div>
        </div>

        {/* Grade label */}
        <div style={{
          display:'inline-block',
          padding:'5px 16px',
          borderRadius:'20px',
          fontSize:'13px', fontWeight:'700',
          fontFamily:'Syne,sans-serif',
          marginBottom:'1.5rem',
          background: pct>=80 ? 'rgba(245,158,11,0.12)' : passed ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
          border:`1px solid ${pct>=80 ? 'rgba(245,158,11,0.35)' : passed ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: pct>=80 ? '#fbbf24' : passed ? '#4ade80' : '#f87171',
        }}>
          {pct>=80 ? 'Excellent!' : pct>=60 ? 'Passed' : 'Needs Improvement'}
        </div>

        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={() => navigate('/participant')} style={{
            flex:1, padding:'12px',
            background:'rgba(255,255,255,0.06)',
            border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:'10px', color:'#94a3b8',
            fontFamily:'inherit', fontWeight:'500', fontSize:'14px',
            cursor:'pointer',
          }}>← Quizzes</button>
          <button onClick={() => navigate('/participant/history')} style={{
            flex:1, padding:'12px',
            background:'linear-gradient(135deg,#7c3aed,#6d28d9)',
            border:'none', borderRadius:'10px', color:'#fff',
            fontFamily:'Syne,sans-serif', fontWeight:'700', fontSize:'14px',
            cursor:'pointer',
            boxShadow:'0 4px 16px rgba(124,58,237,0.38)',
          }}>View History</button>
        </div>
      </div>
    </div>
  );
}

/* ─── TakeQuiz ───────────────────────────────────────────────── */
export default function TakeQuiz() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [quiz,       setQuiz]       = useState(null);
  const [answers,    setAnswers]    = useState({});
  const [result,     setResult]     = useState(null);
  const [timeLeft,   setTimeLeft]   = useState(null);
  const [currentQ,   setCurrentQ]   = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get(`/participant/quizzes/${id}`)
      .then(r => { setQuiz(r.data); setTimeLeft(r.data.timeLimitInMinutes * 60); })
      .catch(console.error);
  }, [id]);

  const handleSubmit = useCallback(async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    const formatted = Object.keys(answers).map(qId => ({
      questionId: parseInt(qId),
      selectedOptionId: answers[qId],
    }));
    try {
      const r = await api.post(`/participant/quizzes/${id}/submit`, { answers: formatted });
      setResult(r.data);
    } catch { alert('Error submitting quiz. Please try again.'); }
    finally  { setSubmitting(false); }
  }, [answers, id]);

  useEffect(() => {
    if (timeLeft === null || result !== null) return;
    if (timeLeft <= 0) { clearInterval(timerRef.current); handleSubmit(); return; }
    timerRef.current = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft, result, handleSubmit]);

  const fmt = (s) => {
    const m = Math.floor(s/60).toString().padStart(2,'0');
    const sec = (s%60).toString().padStart(2,'0');
    return `${m}:${sec}`;
  };

  if (!quiz)   return <Loader text="Loading quiz…" />;
  if (result)  return <ResultScreen result={result} quizTitle={quiz.title} navigate={navigate} />;

  const totalQ   = quiz.questions?.length || 0;
  const answered = Object.keys(answers).length;
  const urgent   = timeLeft !== null && timeLeft < 60;
  const q        = quiz.questions[currentQ];

  return (
    <div style={{ maxWidth:'720px', margin:'0 auto', padding:'2rem 1.5rem' }}>

      {/* Top bar */}
      <div style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        marginBottom:'1.25rem',
      }}>
        <div>
          <h1 style={{
            fontFamily:'Syne,sans-serif', fontWeight:'800',
            fontSize:'20px', color:'#e2e8f0', marginBottom:'3px',
          }}>{quiz.title}</h1>
          <p style={{ color:'#475569', fontSize:'13px' }}>
            Question {currentQ+1} of {totalQ} · {answered} answered
          </p>
        </div>

        {/* Timer */}
        <div style={{
          background: urgent ? 'rgba(239,68,68,0.13)' : 'rgba(17,17,24,0.9)',
          border:`1px solid ${urgent ? 'rgba(239,68,68,0.5)' : 'rgba(124,58,237,0.32)'}`,
          borderRadius:'12px', padding:'9px 18px',
          display:'flex', alignItems:'center', gap:'8px',
          boxShadow: urgent ? '0 0 18px rgba(239,68,68,0.18)' : 'none',
          transition:'all 0.3s',
        }}>
          <span style={{ fontSize:'14px' }}>⏱</span>
          <span style={{
            fontFamily:'Syne,sans-serif', fontWeight:'700',
            fontSize:'18px', letterSpacing:'1.5px',
            color: urgent ? '#f87171' : '#a78bfa',
            ...(urgent ? { animation:'pulse 1s ease-in-out infinite' } : {}),
          }}>
            {timeLeft !== null ? fmt(timeLeft) : '--:--'}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height:'4px', background:'rgba(255,255,255,0.06)',
        borderRadius:'2px', marginBottom:'1.5rem', overflow:'hidden',
      }}>
        <div style={{
          height:'100%',
          width:`${((currentQ+1)/totalQ)*100}%`,
          background:'linear-gradient(90deg,#7c3aed,#a78bfa)',
          transition:'width 0.3s ease', borderRadius:'2px',
        }}/>
      </div>

      {/* Question card */}
      <div style={{
        background:'rgba(17,17,24,0.92)',
        border:'1px solid rgba(124,58,237,0.22)',
        borderRadius:'16px', padding:'2rem', marginBottom:'1rem',
        animation:'fadeIn 0.3s ease both',
      }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'14px', marginBottom:'1.5rem' }}>
          <span style={{
            fontFamily:'Syne,sans-serif', fontWeight:'800', fontSize:'12px',
            color:'#a78bfa', background:'rgba(124,58,237,0.15)',
            border:'1px solid rgba(124,58,237,0.32)',
            borderRadius:'8px', padding:'4px 10px',
            flexShrink:0, marginTop:'2px',
          }}>Q{currentQ+1}</span>
          <p style={{
            fontFamily:'Syne,sans-serif', fontWeight:'600',
            fontSize:'17px', color:'#e2e8f0', lineHeight:'1.5',
          }}>{q.text}</p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {q.options.map(opt => {
            const selected = answers[q.id] === opt.id;
            return (
              <button key={opt.id}
                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                style={{
                  padding:'13px 16px',
                  background: selected ? 'rgba(124,58,237,0.2)' : 'rgba(10,10,15,0.72)',
                  border:`1px solid ${selected ? 'rgba(124,58,237,0.7)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius:'10px',
                  color: selected ? '#a78bfa' : '#94a3b8',
                  fontSize:'14px', cursor:'pointer',
                  textAlign:'left', display:'flex', alignItems:'center', gap:'12px',
                  transition:'all 0.18s', fontFamily:'inherit',
                  boxShadow: selected ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!selected) {
                    e.currentTarget.style.borderColor = 'rgba(124,58,237,0.38)';
                    e.currentTarget.style.background  = 'rgba(124,58,237,0.07)';
                  }
                }}
                onMouseLeave={e => {
                  if (!selected) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.background  = 'rgba(10,10,15,0.72)';
                  }
                }}
              >
                {/* Custom radio */}
                <span style={{
                  width:'20px', height:'20px', borderRadius:'50%', flexShrink:0,
                  border:`2px solid ${selected ? '#7c3aed' : 'rgba(255,255,255,0.16)'}`,
                  background: selected ? '#7c3aed' : 'transparent',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.18s',
                }}>
                  {selected && <span style={{ width:'7px', height:'7px', background:'#fff', borderRadius:'50%' }}/>}
                </span>
                <span style={{ fontWeight: selected ? '500' : '400' }}>{opt.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation row */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'1rem' }}>
        <button
          onClick={() => setCurrentQ(q => Math.max(0, q-1))}
          disabled={currentQ===0}
          style={{
            flex:1, padding:'12px',
            background:'rgba(17,17,24,0.9)',
            border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:'10px',
            color: currentQ===0 ? '#1e293b' : '#64748b',
            fontFamily:'inherit', fontSize:'14px', fontWeight:'500',
            cursor: currentQ===0 ? 'not-allowed' : 'pointer',
            transition:'all 0.2s',
          }}
        >← Previous</button>

        {currentQ < totalQ-1 ? (
          <button
            onClick={() => setCurrentQ(q => Math.min(totalQ-1, q+1))}
            style={{
              flex:1, padding:'12px',
              background:'rgba(124,58,237,0.15)',
              border:'1px solid rgba(124,58,237,0.42)',
              borderRadius:'10px', color:'#a78bfa',
              fontFamily:'Syne,sans-serif', fontSize:'14px', fontWeight:'700',
              cursor:'pointer', transition:'all 0.2s',
            }}
          >Next →</button>
        ) : (
          <button
            onClick={handleSubmit} disabled={submitting}
            style={{
              flex:2, padding:'12px',
              background: submitting ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg,#16a34a,#15803d)',
              border:'none', borderRadius:'10px', color:'#fff',
              fontFamily:'Syne,sans-serif', fontSize:'15px', fontWeight:'700',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: submitting ? 'none' : '0 4px 16px rgba(22,163,74,0.38)',
              transition:'all 0.2s',
            }}
          >{submitting ? 'Submitting…' : '✓ Submit Quiz'}</button>
        )}
      </div>

      {/* Question dots navigator */}
      <div style={{
        display:'flex', gap:'6px', flexWrap:'wrap',
        justifyContent:'center', marginTop:'0.5rem',
      }}>
        {quiz.questions.map((q2, i) => {
          const isCurrent  = i === currentQ;
          const isAnswered = !!answers[q2.id];
          return (
            <button key={q2.id} onClick={() => setCurrentQ(i)} style={{
              width:'30px', height:'30px', borderRadius:'8px',
              border:`1px solid ${isCurrent ? 'rgba(124,58,237,0.7)' : isAnswered ? 'rgba(34,197,94,0.42)' : 'rgba(255,255,255,0.08)'}`,
              background: isCurrent ? 'rgba(124,58,237,0.22)' : isAnswered ? 'rgba(34,197,94,0.12)' : 'rgba(10,10,15,0.65)',
              color: isCurrent ? '#a78bfa' : isAnswered ? '#4ade80' : '#334155',
              fontSize:'11px', fontWeight:'700',
              cursor:'pointer', transition:'all 0.15s',
            }}>{i+1}</button>
          );
        })}
      </div>
    </div>
  );
}
