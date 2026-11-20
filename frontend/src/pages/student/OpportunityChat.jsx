import { useEffect, useRef, useState } from 'react';
import { X, Sparkles, History, ArrowUp, RotateCcw } from 'lucide-react';
import MyChatHistory from './MyChatHistory';
import Markdown from 'react-markdown';
import api from '../../services/api';
import './OpportunityChat.css';

export default function OpportunityChat({ event, onClose, onSelect }) {
  const path = '/events/' + event._id + '/chat';
  const [turns, setTurns] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [reload, setReload] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const historyPane = useRef(null);
  const busy = useRef(false);
  const [showConversation, setShowConversation] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const composer = useRef(null);

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
        if (data.length) setShowConversation(true);
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

  useEffect(() => {
    if (showConversation && historyPane.current) historyPane.current.scrollTop = historyPane.current.scrollHeight;
  }, [turns, showConversation]);
  useEffect(() => { composer.current?.focus({ preventScroll: true }); }, []);

  async function send(turn) {
    if (busy.current) return;
    busy.current = true;
    setShowConversation(true);
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
    <aside className="nani-panel" aria-labelledby="nani-title"
      onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
      <header className="nani-header">
        <Sparkles size={18} aria-hidden="true" /><h2 id="nani-title">nani.ai</h2>
        <button type="button" aria-label="Close chat" title="Close chat" onClick={onClose}><X size={17} /></button>
      </header>
      <div className="nani-tools">
        <span>{[event.company?.name, event.jobRole].filter(Boolean).join(' · ')}</span>
        <button type="button" className="nani-history-toggle" aria-expanded={historyOpen}
          onClick={() => setHistoryOpen(value => !value)}><History size={16} /> My chats</button>
      </div>
      {historyOpen && <MyChatHistory onResume={next => {
        setHistoryOpen(false);
        setShowConversation(true);
        onSelect(next);
      }} />}
      <div className="opportunity-chat" hidden={historyOpen}>
        <div className="chat-history" ref={historyPane} role="log" aria-label="Conversation" aria-live="polite">
          {!showConversation && <div className="nani-welcome">
            <Sparkles size={36} strokeWidth={1.4} aria-hidden="true" />
            <p>I hope you are doing good.<br />How can I help you?</p>
          </div>}
          {loading && <small>Loading conversation…</small>}
          {showConversation && turns.map(turn => (
            <article key={turn.requestId}>
              <p className="chat-question">{turn.question}</p>
              {turn.status === 'complete' ? <>
                <div className="chat-answer"><Markdown skipHtml disallowedElements={['img']}>{turn.answer?.replace(/^Live web research is temporarily unavailable\. Historical claims could not be verified\.\s*/, '')}</Markdown></div>
                <small>Role context · {turn.reference}</small>
                {!!turn.sources?.length && <ul aria-label="Research sources">{turn.sources.map((source, i) => (
                  <li key={i}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>
                ))}</ul>}
                {turn.searchSuggestions && <iframe title="Related Google searches" sandbox="allow-popups allow-popups-to-escape-sandbox"
                  style={{ width: '100%', border: 0, height: 86 }} srcDoc={turn.searchSuggestions} />}
              </> : turn.status === 'failed'
                ? <button className="btn btn-secondary btn-sm" disabled={sending} onClick={() => send(turn)}><RotateCcw size={13} /> Retry question</button>
                : <small>Preparing your answer…</small>}
            </article>
          ))}

        </div>
        {error && <p role="alert">{error}</p>}
        {!loaded && !loading && <button className="btn btn-secondary" onClick={() => setReload(n => n + 1)}>Reload history</button>}
        <form onSubmit={e => {
          e.preventDefault();
          if (draft.trim()) send({ question: draft.trim(), requestId: crypto.randomUUID() });
        }}>
          <textarea id="opportunity-question" ref={composer} aria-label="Your question" placeholder="Ask about this role…"
            value={draft} maxLength={3000} rows={2} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                if (loaded && !sending && draft.trim()) e.currentTarget.form.requestSubmit();
              }
            }} />
          <div className="nani-compose-actions"><small>Shift + Enter for a new line</small>
            <button type="submit" aria-label="Send question" disabled={!loaded || sending || !draft.trim()}><ArrowUp size={17} /></button>
          </div>
        </form>
      </div>
    </aside>
  );
}
