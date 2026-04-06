import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

/* ─── Constants ──────────────────────────────────────────────── */
const VIOLET   = '#7c3aed';
const VIOLET_G = 'linear-gradient(135deg,#7c3aed,#6d28d9)';
const AMBER_G  = 'linear-gradient(135deg,#b45309,#92400e)';

const newQuestion = () => ({
  _id: `q_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  text: '',
  options: [
    { text:'', isCorrect:true  },
    { text:'', isCorrect:false },
    { text:'', isCorrect:false },
    { text:'', isCorrect:false },
  ],
});

/* ─── Label ──────────────────────────────────────────────────── */
const Lbl = ({ children }) => (
  <label style={{
    display:'block', fontSize:'11px', fontWeight:'600',
    color:'#475569', marginBottom:'6px',
    letterSpacing:'0.6px', textTransform:'uppercase',
  }}>{children}</label>
);

/* ─── Focused input / textarea ───────────────────────────────── */
function FInput({ label, type='text', value, onChange, placeholder, required, accentColor, rows }) {
  const [f, setF] = useState(false);
  const ac     = accentColor || 'rgba(124,58,237,0.7)';
  const acDim  = accentColor ? ac.replace('0.7','0.22') : 'rgba(255,255,255,0.08)';
  const acGlow = ac.replace('0.7','0.10');
  const base = {
    width:'100%', padding:'11px 14px',
    background:'rgba(10,10,15,0.82)',
    border: f ? `1px solid ${ac}` : `1px solid ${acDim}`,
    borderRadius:'10px', color:'#e2e8f0',
    fontSize:'14px', outline:'none',
    transition:'border 0.18s,box-shadow 0.18s',
    boxShadow: f ? `0 0 0 3px ${acGlow}` : 'none',
    fontFamily:'inherit', resize:'none',
  };
  return (
    <div>
      {label && <Lbl>{label}</Lbl>}
      {rows
        ? <textarea value={value} onChange={onChange} placeholder={placeholder}
            required={required} rows={rows}
            onFocus={()=>setF(true)} onBlur={()=>setF(false)}
            style={{ ...base, lineHeight:'1.6' }} />
        : <input type={type} value={value} onChange={onChange} placeholder={placeholder}
            required={required}
            onFocus={()=>setF(true)} onBlur={()=>setF(false)}
            style={base} />
      }
    </div>
  );
}

/* ─── Toast ──────────────────────────────────────────────────── */
function Toast({ msg, type }) {
  const ok = type !== 'error';
  return (
    <div style={{
      position:'fixed', top:'80px', right:'1.5rem', zIndex:300,
      background: ok ? 'rgba(34,197,94,0.13)' : 'rgba(239,68,68,0.13)',
      border:`1px solid ${ok ? 'rgba(34,197,94,0.38)' : 'rgba(239,68,68,0.38)'}`,
      color: ok ? '#4ade80' : '#f87171',
      borderRadius:'12px', padding:'12px 20px',
      fontSize:'14px', fontWeight:'500',
      backdropFilter:'blur(12px)',
      boxShadow:'0 4px 28px rgba(0,0,0,0.45)',
      animation:'slideIn 0.25s ease both',
      display:'flex', alignItems:'center', gap:'8px',
    }}>
      <span style={{ fontSize:'16px' }}>{ok ? '✓' : '⚠'}</span> {msg}
    </div>
  );
}

/* ─── Option row ─────────────────────────────────────────────── */
function OptionRow({ opt, oi, total, onTextChange, onSetCorrect, onRemove }) {
  const [f, setF] = useState(false);
  const correct = opt.isCorrect;
  const letter  = String.fromCharCode(65 + oi);

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:'8px',
      padding:'8px 10px',
      background: correct ? 'rgba(34,197,94,0.06)' : 'rgba(10,10,15,0.55)',
      border:`1px solid ${
        f       ? (correct ? 'rgba(34,197,94,0.55)'  : 'rgba(124,58,237,0.5)')
        : correct ? 'rgba(34,197,94,0.25)'  : 'rgba(255,255,255,0.07)'}`,
      borderRadius:'9px', transition:'all 0.18s',
    }}>

      {/* Correct radio */}
      <button type="button" onClick={onSetCorrect} title="Mark as correct answer"
        style={{
          width:'20px', height:'20px', flexShrink:0, borderRadius:'50%',
          border:`2px solid ${correct ? '#22c55e' : 'rgba(255,255,255,0.18)'}`,
          background: correct ? '#22c55e' : 'transparent',
          cursor:'pointer', transition:'all 0.18s',
          display:'flex', alignItems:'center', justifyContent:'center', padding:0,
        }}>
        {correct && <span style={{ width:'7px',height:'7px',background:'#fff',borderRadius:'50%',display:'block' }}/>}
      </button>

      {/* Letter label */}
      <span style={{
        fontSize:'10px', fontWeight:'800',
        color: correct ? '#4ade80' : '#334155',
        minWidth:'14px', fontFamily:'Syne,sans-serif',
        transition:'color 0.18s',
      }}>{letter}</span>

      {/* Text input */}
      <input
        type="text"
        value={opt.text}
        onChange={e => onTextChange(e.target.value)}
        placeholder={correct ? 'Correct answer…' : `Option ${letter}…`}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{
          flex:1, padding:'5px 8px',
          background:'transparent',
          border:'none', outline:'none',
          color: correct ? '#d1fae5' : '#94a3b8',
          fontSize:'13px', fontFamily:'inherit',
        }}
      />

      {/* Remove option */}
      {total > 2 && (
        <RemoveX onClick={onRemove} />
      )}
    </div>
  );
}

/* ─── Small remove × ─────────────────────────────────────────── */
function RemoveX({ onClick }) {
  const [h, setH] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        width:'20px', height:'20px', flexShrink:0, padding:0,
        background: h ? 'rgba(239,68,68,0.12)' : 'transparent',
        border:'none',
        color: h ? '#f87171' : '#334155',
        cursor:'pointer', fontSize:'14px', fontWeight:'400',
        display:'flex', alignItems:'center', justifyContent:'center',
        borderRadius:'4px', transition:'all 0.15s',
      }}>×</button>
  );
}

/* ─── Mini icon button ───────────────────────────────────────── */
function MiniBtn({ onClick, disabled, children, title, danger }) {
  const [h, setH] = useState(false);
  return (
    <button type="button" onClick={disabled ? undefined : onClick} title={title}
      onMouseEnter={()=>!disabled && setH(true)}
      onMouseLeave={()=>setH(false)}
      style={{
        width:'24px', height:'24px', borderRadius:'6px', padding:0,
        background: h ? (danger ? 'rgba(239,68,68,0.15)' : 'rgba(124,58,237,0.15)') : 'transparent',
        border:`1px solid ${h ? (danger ? 'rgba(239,68,68,0.4)' : 'rgba(124,58,237,0.35)') : 'transparent'}`,
        color: disabled ? '#1e293b' : h ? (danger ? '#f87171' : '#a78bfa') : '#334155',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize:'12px', fontWeight:'700',
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'all 0.15s',
      }}>
      {children}
    </button>
  );
}

/* ─── Question Card ──────────────────────────────────────────── */
function QuestionCard({ q, index, total, onChange, onRemove, onMoveUp, onMoveDown, isNew }) {
  const [collapsed, setCollapsed] = useState(false);
  const divRef = useRef(null);

  useEffect(() => {
    if (isNew && divRef.current) {
      divRef.current.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }
  }, [isNew]);

  const setOptionText = (oi, val) => {
    const opts = q.options.map((o,i) => i===oi ? { ...o, text:val } : o);
    onChange({ ...q, options:opts });
  };

  const setCorrect = (oi) => {
    const opts = q.options.map((o,i) => ({ ...o, isCorrect:i===oi }));
    onChange({ ...q, options:opts });
  };

  const addOption = () => {
    if (q.options.length >= 6) return;
    onChange({ ...q, options:[...q.options, { text:'', isCorrect:false }] });
  };

  const removeOption = (oi) => {
    if (q.options.length <= 2) return;
    let opts = q.options.filter((_,i) => i!==oi);
    if (!opts.some(o=>o.isCorrect)) opts[0] = { ...opts[0], isCorrect:true };
    onChange({ ...q, options:opts });
  };

  const filled     = q.options.filter(o=>o.text.trim()).length;
  const hasCorrect = q.options.some(o=>o.isCorrect && o.text.trim());
  const isComplete = q.text.trim() && hasCorrect && filled >= 2;

  return (
    <div ref={divRef} style={{
      background:'rgba(10,10,15,0.62)',
      border:`1px solid ${isComplete ? 'rgba(34,197,94,0.2)' : 'rgba(124,58,237,0.18)'}`,
      borderRadius:'14px', overflow:'hidden',
      transition:'border-color 0.3s',
      animation: isNew ? 'qSlideIn 0.38s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
    }}>

      {/* ── Header bar ── */}
      <div
        onClick={() => setCollapsed(c=>!c)}
        style={{
          display:'flex', alignItems:'center', gap:'10px',
          padding:'11px 14px',
          background: isComplete ? 'rgba(34,197,94,0.06)' : 'rgba(124,58,237,0.07)',
          borderBottom: collapsed ? 'none' : `1px solid ${isComplete ? 'rgba(34,197,94,0.12)' : 'rgba(124,58,237,0.12)'}`,
          cursor:'pointer', userSelect:'none',
          transition:'background 0.3s',
        }}
      >
        {/* Status badge */}
        <span style={{
          minWidth:'28px', height:'28px',
          background: isComplete ? 'rgba(34,197,94,0.18)' : 'rgba(124,58,237,0.18)',
          border:`1px solid ${isComplete ? 'rgba(34,197,94,0.4)' : 'rgba(124,58,237,0.4)'}`,
          color: isComplete ? '#4ade80' : '#a78bfa',
          fontSize:'11px', fontWeight:'800',
          borderRadius:'7px', fontFamily:'Syne,sans-serif',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all 0.3s',
        }}>
          {isComplete ? '✓' : `Q${index+1}`}
        </span>

        {/* Preview text */}
        <span style={{
          flex:1, fontSize:'13px',
          color: q.text.trim() ? '#c4c9d4' : '#334155',
          overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis',
        }}>
          {q.text.trim() || `Question ${index+1} — click to expand`}
        </span>

        {/* Controls (stop propagation so clicks don't collapse) */}
        <div style={{ display:'flex', alignItems:'center', gap:'4px', flexShrink:0 }}
          onClick={e=>e.stopPropagation()}>
          <MiniBtn onClick={onMoveUp}   disabled={index===0}       title="Move up">↑</MiniBtn>
          <MiniBtn onClick={onMoveDown} disabled={index===total-1} title="Move down">↓</MiniBtn>
          {total > 1 && <MiniBtn onClick={onRemove} title="Remove question" danger>✕</MiniBtn>}
        </div>

        {/* Chevron */}
        <span style={{
          fontSize:'11px', color:'#334155',
          transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          transition:'transform 0.22s', display:'inline-block',
          pointerEvents:'none',
        }}>▼</span>
      </div>

      {/* ── Body ── */}
      {!collapsed && (
        <div style={{ padding:'1.1rem 1.1rem 1.3rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>

          {/* Question text */}
          <FInput
            value={q.text}
            onChange={e => onChange({ ...q, text:e.target.value })}
            placeholder={`Enter question ${index+1}…`}
            required
          />

          {/* Options section */}
          <div>
            <div style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              marginBottom:'8px',
            }}>
              <span style={{
                fontSize:'10px', fontWeight:'700', color:'#334155',
                letterSpacing:'0.7px', textTransform:'uppercase',
              }}>Answer Options</span>

              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontSize:'11px', color:'#334155' }}>
                  {filled}/{q.options.length} filled
                </span>
                {q.options.length < 6 && (
                  <button type="button" onClick={addOption}
                    style={{
                      background:'transparent',
                      border:'1px solid rgba(124,58,237,0.3)',
                      color:'#a78bfa', fontSize:'10px', fontWeight:'700',
                      padding:'2px 9px', borderRadius:'6px',
                      cursor:'pointer', fontFamily:'inherit',
                      transition:'all 0.15s',
                    }}
                    onMouseEnter={e=>{e.target.style.background='rgba(124,58,237,0.14)';e.target.style.borderColor='rgba(124,58,237,0.55)';}}
                    onMouseLeave={e=>{e.target.style.background='transparent';e.target.style.borderColor='rgba(124,58,237,0.3)';}}
                  >+ option</button>
                )}
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {q.options.map((opt, oi) => (
                <OptionRow
                  key={oi}
                  opt={opt} oi={oi} total={q.options.length}
                  onTextChange={val => setOptionText(oi, val)}
                  onSetCorrect={() => setCorrect(oi)}
                  onRemove={() => removeOption(oi)}
                />
              ))}
            </div>
          </div>

          {/* Hint if no correct answer marked */}
          {!hasCorrect && (
            <div style={{
              fontSize:'11px', color:'#f59e0b',
              display:'flex', alignItems:'center', gap:'5px',
              background:'rgba(245,158,11,0.07)',
              border:'1px solid rgba(245,158,11,0.2)',
              borderRadius:'7px', padding:'6px 10px',
            }}>
              ⚠ Click the circle next to an option to mark it as correct
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Add Question Button ────────────────────────────────────── */
function AddQuestionBtn({ onClick, count }) {
  const [h, setH] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        width:'100%', padding:'14px',
        background: h ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.04)',
        border:`1.5px dashed ${h ? 'rgba(124,58,237,0.65)' : 'rgba(124,58,237,0.25)'}`,
        borderRadius:'12px',
        color: h ? '#a78bfa' : '#475569',
        cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
        transition:'all 0.2s',
        fontFamily:'Syne,sans-serif', fontWeight:'700', fontSize:'13px',
        letterSpacing:'0.3px',
      }}>
      <span style={{
        width:'24px', height:'24px',
        background: h ? 'rgba(124,58,237,0.28)' : 'rgba(124,58,237,0.14)',
        border:'1px solid rgba(124,58,237,0.38)',
        borderRadius:'7px',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'16px', lineHeight:1, fontWeight:'400',
        transition:'transform 0.22s',
        transform: h ? 'rotate(90deg) scale(1.1)' : 'rotate(0)',
      }}>+</span>
      Add Question
      <span style={{
        color:'#334155', fontWeight:'400',
        fontFamily:'DM Sans,sans-serif', fontSize:'12px',
      }}>({count} so far)</span>
    </button>
  );
}

/* ─── Admin Dashboard (main) ─────────────────────────────────── */
export default function AdminDashboard() {
  const [quizzes,     setQuizzes]     = useState([]);
  const [editingId,   setEditingId]   = useState(null);
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit,   setTimeLimit]   = useState(15);
  const [questions,   setQuestions]   = useState([newQuestion()]);
  const [newQId,      setNewQId]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [toast,       setToast]       = useState(null);

  useEffect(() => { fetchQuizzes(); }, []);

  const showToast = (msg, type='success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchQuizzes = async () => {
    try { const r = await api.get('/admin/quizzes'); setQuizzes(r.data); }
    catch { showToast('Failed to load quizzes','error'); }
  };

  /* Questions CRUD */
  const addQuestion = () => {
    const q = newQuestion();
    setQuestions(prev => [...prev, q]);
    setNewQId(q._id);
    setTimeout(() => setNewQId(null), 700);
  };

  const updateQuestion = (_id, updated) =>
    setQuestions(prev => prev.map(q => q._id===_id ? { ...updated, _id } : q));

  const removeQuestion = (_id) =>
    setQuestions(prev => prev.filter(q => q._id!==_id));

  const moveQuestion = (i, dir) => {
    const arr = [...questions];
    const j = i + dir;
    if (j<0 || j>=arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setQuestions(arr);
  };

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let i=0; i<questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        showToast(`Question ${i+1} needs a question text.`,'error'); return;
      }
      const correct = q.options.find(o=>o.isCorrect);
      if (!correct?.text.trim()) {
        showToast(`Question ${i+1}: mark a correct answer.`,'error'); return;
      }
      if (q.options.filter(o=>o.text.trim()).length < 2) {
        showToast(`Question ${i+1}: fill in at least 2 options.`,'error'); return;
      }
    }

    setLoading(true);
    const payload = {
      title, description,
      timeLimitInMinutes: Number(timeLimit),
      questions: questions.map(q => ({
        text: q.text,
        options: q.options.filter(o=>o.text.trim()),
      })),
    };
    try {
      if (editingId) {
        await api.put(`/admin/quizzes/${editingId}`, payload);
        showToast('Quiz updated!');
      } else {
        await api.post('/admin/quizzes', payload);
        showToast(`Quiz created — ${questions.length} question${questions.length!==1?'s':''}!`);
      }
      resetForm(); fetchQuizzes();
    } catch { showToast(editingId ? 'Update failed' : 'Create failed','error'); }
    finally  { setLoading(false); }
  };

  /* Edit */
  const handleEdit = (quiz) => {
    setEditingId(quiz.id);
    setTitle(quiz.title);
    setDescription(quiz.description || '');
    setTimeLimit(quiz.timeLimitInMinutes);
    setQuestions(
      quiz.questions?.length
        ? quiz.questions.map(q => ({
            _id: `q_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            text: q.text,
            options: q.options?.length
              ? q.options.map(o=>({ text:o.text, isCorrect:o.isCorrect }))
              : [
                  {text:'',isCorrect:true },
                  {text:'',isCorrect:false},
                  {text:'',isCorrect:false},
                  {text:'',isCorrect:false},
                ],
          }))
        : [newQuestion()]
    );
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz permanently?')) return;
    try {
      await api.delete(`/admin/quizzes/${id}`);
      if (editingId===id) resetForm();
      fetchQuizzes(); showToast('Quiz deleted.');
    } catch { showToast('Delete failed','error'); }
  };

  const resetForm = () => {
    setEditingId(null); setTitle(''); setDescription('');
    setTimeLimit(15); setQuestions([newQuestion()]);
  };

  const editing      = !!editingId;
  const qFilled      = questions.filter(q=>q.text.trim()).length;
  const allComplete  = qFilled === questions.length && questions.length > 0;

  return (
    <div style={{ maxWidth:'900px', margin:'0 auto', padding:'2rem 1.5rem' }}>
      <style>{`
        @keyframes qSlideIn {
          0%   { opacity:0; transform:translateY(18px) scale(0.97); }
          100% { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes slideIn {
          from { opacity:0; transform:translateX(20px); }
          to   { opacity:1; transform:none; }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:none; }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        input::placeholder, textarea::placeholder { color:#334155; }
      `}</style>

      {toast && <Toast {...toast} />}

      {/* Page header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' }}>
        <div>
          <h1 style={{
            fontFamily:'Syne,sans-serif', fontWeight:'800',
            fontSize:'28px', color:'#e2e8f0',
            letterSpacing:'-0.5px', marginBottom:'4px',
          }}>{editing ? 'Edit Quiz' : 'Admin Dashboard'}</h1>
          <p style={{ color:'#475569', fontSize:'14px' }}>
            {editing
              ? `Editing: "${title}"`
              : `${quizzes.length} quiz${quizzes.length!==1?'zes':''} managed`}
          </p>
        </div>
        {editing && (
          <button onClick={resetForm} style={{
            background:'transparent',
            border:'1px solid rgba(255,255,255,0.1)',
            color:'#64748b', padding:'7px 16px',
            borderRadius:'8px', cursor:'pointer',
            fontSize:'13px', fontFamily:'inherit', transition:'all 0.2s',
          }}>✕ Cancel</button>
        )}
      </div>

      {/* ── Form card ── */}
      <div style={{
        background:'rgba(17,17,24,0.92)',
        border:`1px solid ${editing ? 'rgba(245,158,11,0.28)' : 'rgba(124,58,237,0.22)'}`,
        borderRadius:'16px', padding:'2rem',
        marginBottom:'1.5rem',
      }}>

        {/* Card header */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'1.75rem' }}>
          <span style={{
            width:'8px', height:'8px', borderRadius:'50%',
            background: editing ? '#f59e0b' : VIOLET,
            boxShadow:`0 0 10px ${editing ? '#f59e0b' : VIOLET}`,
            display:'inline-block',
          }}/>
          <h2 style={{
            fontFamily:'Syne,sans-serif', fontWeight:'700',
            fontSize:'17px', color:'#e2e8f0', flex:1,
          }}>{editing ? 'Update Quiz Details' : 'Create New Quiz'}</h2>

          {/* Live question count badge */}
          <span style={{
            fontSize:'11px', fontWeight:'700',
            color: allComplete ? '#4ade80' : '#a78bfa',
            background: allComplete ? 'rgba(34,197,94,0.12)' : 'rgba(124,58,237,0.12)',
            border:`1px solid ${allComplete ? 'rgba(34,197,94,0.3)' : 'rgba(124,58,237,0.3)'}`,
            padding:'3px 10px', borderRadius:'20px',
            transition:'all 0.35s',
          }}>
            {questions.length} question{questions.length!==1?'s':''}
            {allComplete && ' ✓'}
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

          {/* Title + time */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 130px', gap:'1rem' }}>
            <FInput label="Quiz Title" value={title} onChange={e=>setTitle(e.target.value)}
              placeholder="e.g. Advanced JavaScript Fundamentals" required />
            <FInput label="Time (mins)" type="number" value={timeLimit}
              onChange={e=>setTimeLimit(e.target.value)} placeholder="15" required />
          </div>

          <FInput label="Description" value={description}
            onChange={e=>setDescription(e.target.value)}
            placeholder="Brief description of this quiz…" rows={2} required />

          {/* Section divider */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'0.25rem 0' }}>
            <div style={{ flex:1, height:'1px', background:'rgba(124,58,237,0.14)' }}/>
            <span style={{
              fontSize:'10px', fontWeight:'700', color:'#334155',
              letterSpacing:'0.8px', textTransform:'uppercase',
            }}>Questions — {qFilled}/{questions.length} filled</span>
            <div style={{ flex:1, height:'1px', background:'rgba(124,58,237,0.14)' }}/>
          </div>

          {/* Questions */}
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {questions.map((q, index) => (
              <QuestionCard
                key={q._id}
                q={q} index={index} total={questions.length}
                isNew={q._id === newQId}
                onChange={updated => updateQuestion(q._id, updated)}
                onRemove={() => removeQuestion(q._id)}
                onMoveUp={() => moveQuestion(index, -1)}
                onMoveDown={() => moveQuestion(index, +1)}
              />
            ))}
          </div>

          {/* Add Question */}
          <AddQuestionBtn onClick={addQuestion} count={questions.length} />

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            marginTop:'0.25rem', padding:'14px',
            background: loading
              ? 'rgba(124,58,237,0.4)'
              : editing ? AMBER_G : VIOLET_G,
            border:'none', borderRadius:'12px', color:'#fff',
            fontFamily:'Syne,sans-serif', fontWeight:'700', fontSize:'15px',
            cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.22s',
            boxShadow: loading ? 'none'
              : editing ? '0 4px 22px rgba(180,83,9,0.42)'
              : '0 4px 22px rgba(124,58,237,0.45)',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'9px',
          }}>
            {loading ? (
              <>
                <span style={{
                  width:'14px', height:'14px',
                  border:'2px solid rgba(255,255,255,0.35)',
                  borderTopColor:'#fff', borderRadius:'50%',
                  animation:'spin 0.7s linear infinite',
                  display:'inline-block',
                }}/>
                Saving…
              </>
            ) : editing
              ? 'Update Quiz →'
              : `Create Quiz — ${questions.length} Question${questions.length!==1?'s':''} →`
            }
          </button>
        </form>
      </div>

      {/* ── Quiz list ── */}
      <div style={{
        background:'rgba(17,17,24,0.92)',
        border:'1px solid rgba(124,58,237,0.2)',
        borderRadius:'16px', padding:'2rem',
      }}>
        <h2 style={{
          fontFamily:'Syne,sans-serif', fontWeight:'700',
          fontSize:'17px', color:'#e2e8f0', marginBottom:'1.25rem',
        }}>All Quizzes</h2>

        {quizzes.length === 0 ? (
          <div style={{ textAlign:'center', padding:'3.5rem 1rem', color:'#334155', fontSize:'15px' }}>
            <div style={{ fontSize:'38px', marginBottom:'12px', opacity:0.35 }}>📋</div>
            No quizzes yet. Create your first one above.
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {quizzes.map(quiz => (
              <QuizRow key={quiz.id} quiz={quiz}
                onEdit={() => handleEdit(quiz)}
                onDelete={() => handleDelete(quiz.id)}
                isEditing={editingId===quiz.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Quiz list row ──────────────────────────────────────────── */
function QuizRow({ quiz, onEdit, onDelete, isEditing }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        background: isEditing ? 'rgba(245,158,11,0.05)' : 'rgba(10,10,15,0.55)',
        border:`1px solid ${isEditing ? 'rgba(245,158,11,0.32)' : h ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius:'12px', padding:'1.1rem 1.25rem',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        transition:'all 0.2s', animation:'fadeIn 0.3s ease both',
      }}
    >
      <div style={{ flex:1, minWidth:0 }}>
        <h3 style={{
          fontFamily:'Syne,sans-serif', fontWeight:'700',
          fontSize:'15px', color:'#e2e8f0', marginBottom:'4px',
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        }}>{quiz.title}</h3>
        <p style={{
          fontSize:'13px', color:'#475569', marginBottom:'8px',
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        }}>{quiz.description}</p>
        <div style={{ display:'flex', gap:'10px' }}>
          {[`⏱ ${quiz.timeLimitInMinutes} min`,`❓ ${quiz.questions?.length||0} questions`].map(t=>(
            <span key={t} style={{
              fontSize:'11px', color:'#64748b',
              background:'rgba(255,255,255,0.04)',
              border:'1px solid rgba(255,255,255,0.06)',
              borderRadius:'6px', padding:'2px 8px',
            }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', gap:'8px', marginLeft:'1rem', flexShrink:0 }}>
        <ActionBtn onClick={onEdit}   color="amber">Edit</ActionBtn>
        <ActionBtn onClick={onDelete} color="red">Delete</ActionBtn>
      </div>
    </div>
  );
}

/* ─── Action button ──────────────────────────────────────────── */
const COLORS = {
  amber:{ bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.32)', color:'#fbbf24' },
  red:  { bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.3)',   color:'#f87171' },
};

function ActionBtn({ onClick, color, children }) {
  const [h, setH] = useState(false);
  const c = COLORS[color];
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        background: h ? c.bg : 'transparent',
        border:`1px solid ${h ? c.border : 'rgba(255,255,255,0.08)'}`,
        color: h ? c.color : '#475569',
        padding:'6px 14px', borderRadius:'8px',
        cursor:'pointer', fontSize:'12px', fontWeight:'600',
        fontFamily:'inherit', transition:'all 0.2s',
      }}
    >{children}</button>
  );
}
