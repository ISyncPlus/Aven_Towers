'use client';
import { useState } from 'react';
import { Icon } from './Icons';
import { lagosToday } from '@/lib/enquiries';
import type { Residence } from '@/lib/residences';
export default function VisitDialog({ dialogRef, selected }: { dialogRef: React.RefObject<HTMLDialogElement | null>; selected: Residence | null }) {
  const [reference, setReference] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const minimumDate = lagosToday();
  return <dialog ref={dialogRef} className="visit-dialog" aria-labelledby="visit-title" onCancel={event => { if (sending) event.preventDefault(); }} onClose={() => { if (reference) { setName(''); setEmail(''); setDate(''); } setReference(''); setError(''); }} onClick={event => { if (event.target === event.currentTarget && !sending) dialogRef.current?.close(); }}>
    <div className="visit-inner"><button className="dialog-close icon-button" aria-label="Close viewing form" disabled={sending} onClick={() => dialogRef.current?.close()}><Icon name="close"/></button>
      {reference ? <div className="confirmation"><div className="confirmation-mark"><Icon name="check" size={28}/></div><h2 id="visit-title">We look forward<br/>to welcoming you.</h2><p>Thank you, {name}. We’ve received your request to visit {selected ? `Residence ${selected.id}` : 'Aven'} on {new Intl.DateTimeFormat('en-NG', { dateStyle: 'long', timeZone: 'Africa/Lagos' }).format(new Date(date + 'T12:00:00Z'))}.</p><p>Our sales team will contact you at {email} to confirm your private viewing.</p><p className="enquiry-reference">Your reference: {reference}</p><button className="button" onClick={() => dialogRef.current?.close()}>Explore Aven <Icon name="arrow" size={18}/></button></div> : <><h2 id="visit-title">See yourself here.</h2><p>Request a private viewing of {selected ? `Residence ${selected.id}` : 'Aven Residences'} with our Lagos sales team.</p><form onSubmit={async event => {
        event.preventDefault();
        if (sending) return;
        if (!name.trim() || !email.trim() || !date || date < minimumDate) { setError('Please enter your name, email, and a viewing date from today onwards.'); return; }
        setError(''); setSending(true);
        try {
          const response = await fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, date, residence: selected?.id || null }) });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'We couldn’t receive your request. Please try again.');
          setReference(result.reference);
        } catch (error) { setError(error instanceof Error ? error.message : 'Please check your connection and try again.'); }
        finally { setSending(false); }
      }}>
        <label htmlFor="visit-name">Full name<input disabled={sending} id="visit-name" name="name" autoComplete="name" required maxLength={100} value={name} onChange={event => setName(event.target.value)}/></label>
        <label htmlFor="visit-email">Email address<input disabled={sending} id="visit-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)}/></label>
        <label htmlFor="visit-date">Preferred viewing date<input disabled={sending} id="visit-date" name="date" type="date" min={minimumDate} required value={date} onChange={event => setDate(event.target.value)}/></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button" type="submit" disabled={sending}>{sending ? 'Sending your request…' : 'Request a private viewing'}<span className="button-arrow"><Icon name="arrow" size={18}/></span></button>
        <p className="form-notice">Viewings are by appointment. We’ll contact you to confirm availability. Your details are used only to respond to your enquiry.</p>
      </form></>}
    </div>
  </dialog>;
}
