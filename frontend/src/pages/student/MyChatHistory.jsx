import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import api from '../../services/api';

export default function MyChatHistory({ onResume }) {
  const [items, setItems] = useState([]);
  const [next, setNext] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api.get('/events/chat/history', { params: { before: cursor || undefined }, signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        setItems(previous => cursor ? [...previous, ...data.items] : data.items);
        setNext(data.next);
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [cursor, retry]);

  return <section className="nani-archive" aria-label="My chats">
    <h3>My chats</h3>
    {items.map(turn => <details key={turn._id}>
      <summary><small>{[turn.event?.company?.name, turn.event?.jobRole].filter(Boolean).join(' · ') || 'Archived opportunity'}</small>
        {turn.question}</summary>
      {turn.answer ? <div className="chat-answer"><Markdown skipHtml disallowedElements={['img']}>{turn.answer.replace(/^Live web research is temporarily unavailable\. Historical claims could not be verified\.\s*/, '')}</Markdown></div>
        : <p>{turn.status === 'pending' ? 'Answer pending.' : 'No saved reply.'}</p>}
      {turn.sources?.map((s,i) => <p key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></p>)}
      {turn.searchSuggestions && <iframe title="Related Google searches" sandbox="allow-popups allow-popups-to-escape-sandbox" srcDoc={turn.searchSuggestions} />}
      {turn.event && <button className="btn btn-secondary btn-sm" onClick={() => onResume(turn.event)}>Continue this chat</button>}
    </details>)}
    {loading && <p>Loading chats…</p>}
    {!loading && !error && !items.length && <p>Your questions across opportunities will appear here.</p>}
    {error && <p role="alert">Could not load history. <button onClick={() => { setLoading(true); setError(false); setRetry(n => n + 1); }}>Retry</button></p>}
    {!error && next && <button className="btn btn-secondary btn-sm" disabled={loading} onClick={() => { setLoading(true); setCursor(next); }}>Load older questions</button>}
  </section>;
}
