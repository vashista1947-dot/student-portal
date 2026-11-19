import { useEffect, useRef, useState } from 'react';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import './OpportunityChat.css';

export default function OpportunityChat({ event, onClose }) {
  const path = '/events/' + event._id + '/chat';
  const [turns, setTurns] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [reload, setReload] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const end = useRef(null);
  const busy = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    let timer;
    async function refresh() {
      try {
        const { data } = await api.get(path, { signal: controller.signal });
        if (controller.signal.aborted) return;
        const now = Date.now();
        setTurns(data.map(turn => turn.status === 'pending' && now - Date.parse(turn.updatedAt) >= 90000
          ? { ...turn, status: 'failed' } : turn));
        setError('');
        setLoaded(true);
        if (data.some(t => t.status === 'pending' && Date.now() - Date.parse(t.updatedAt) < 90000)) {
          timer = setTimeout(refresh, 3500);
        }
      } catch {
        if (!controller.signal.aborted) setError('Could not load the conversation.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    refresh();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [path, reload]);

  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [turns]);

  async function send(turn) {
    if (busy.current) return;
    busy.current = true;
    setError('');
    setSending(true);
    setDraft('');
    const pending = { ...turn, status: 'pending', updatedAt: new Date().toISOString() };
    function replace(value) {
      setTurns(previous => previous.some(t => t.requestId === turn.requestId)
        ? previous.map(t => t.requestId === turn.requestId ? value : t) : [...previous, value]);
    }
    replace(pending);
    try {
      const { data } = await api.post(path, { requestId: turn.requestId, question: turn.question });
      replace(data);
    } catch (err) {
      replace({ ...pending, status: 'failed' });
      setError(err.response?.data?.message || 'Connection interrupted. Retry this question.');
    } finally {
      busy.current = false;
      setSending(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={event.company?.name + ' · ' + event.jobRole}>
      <div className="opportunity-chat">
        <div className="chat-history" role="log" aria-label="Conversation" aria-live="polite">
          {loading && <p>Loading conversation…</p>}
          {loaded && !turns.length && <p>Ask about preparation, past questions, or campus visits for this role.</p>}
          {turns.map(turn => (
            <article key={turn.requestId}>
              <p className="chat-question">{turn.question}</p>
              {turn.status === 'complete' ? <>
                <p className="chat-answer">{turn.answer}</p>
                <small>Role context · {turn.reference}</small>
                {!!turn.sources?.length && <ul aria-label="Research sources">{turn.sources.map((source, i) => (
                  <li key={i}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>
                ))}</ul>}
                {turn.searchSuggestions && <iframe title="Related Google searches" sandbox="allow-popups allow-popups-to-escape-sandbox"
                  style={{ width: '100%', border: 0, height: 86 }} srcDoc={turn.searchSuggestions} />}
              </> : turn.status === 'failed'
                ? <button className="btn btn-secondary btn-sm" disabled={sending} onClick={() => send(turn)}>Retry question</button>
                : <small>Preparing your answer…</small>}
            </article>
          ))}
          <div ref={end} />
        </div>
        {error && <p role="alert">{error}</p>}
        {!loaded && !loading && <button className="btn btn-secondary" onClick={() => setReload(n => n + 1)}>Reload history</button>}
        <form onSubmit={e => {
          e.preventDefault();
          if (draft.trim()) send({ question: draft.trim(), requestId: crypto.randomUUID() });
        }}>
          <label htmlFor="opportunity-question">Your question</label>
          <textarea id="opportunity-question" className="form-textarea" value={draft}
            maxLength={3000} rows={2} onChange={e => setDraft(e.target.value)} />
          <button className="btn btn-primary" disabled={!loaded || sending || !draft.trim()}>Send question</button>
        </form>
      </div>
    </Modal>
  );
}
