import React from 'react';
import axios from 'axios';
import { trackEvent } from '../../lib/analytics';
import Toast from '../ui/Toast';

const services = [
  'Home Automation',
  'Gate Automation',
  'CCTV + Security',
  'Curtain Automation',
  'Smart Locks',
  'Home Theatre',
];

type LeadForm = {
  name: string;
  phone: string;
  city: string;
  service: string;
  message: string;
  website: string;
};

const initialForm: LeadForm = {
  name: '',
  phone: '',
  city: '',
  service: services[0],
  message: '',
  website: '',
};

export default function ConversionFunnels() {
  const [form, setForm] = React.useState<LeadForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [statusType, setStatusType] = React.useState<'idle' | 'error' | 'success'>('idle');
  const [leadId, setLeadId] = React.useState('');
  const [formStartedAt, setFormStartedAt] = React.useState<number>(() => Date.now());
  const [toastState, setToastState] = React.useState<{ open: boolean; type: 'success' | 'error' | 'info'; title: string; message: string }>({
    open: false,
    type: 'info',
    title: '',
    message: '',
  });

  const MIN_FILL_TIME_MS = 2500;

  const resetFormFlow = () => {
    setForm(initialForm);
    setStatus('');
    setStatusType('idle');
    setLeadId('');
    setFormStartedAt(Date.now());
  };

  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setToastState({ open: true, type, title, message });
  };

  const handleChange = (field: keyof LeadForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('');
    setStatusType('idle');

    if (form.website.trim()) {
      setStatus('Invalid submission detected.');
      setStatusType('error');
      setIsSubmitting(false);
      trackEvent('lead_submit_blocked', { reason: 'honeypot', source: 'conversion_form' });
      showToast('error', 'Blocked submission', 'Please retry using valid details.');
      return;
    }

    if (Date.now() - formStartedAt < MIN_FILL_TIME_MS) {
      setStatus('Please review your details and submit again.');
      setStatusType('error');
      setIsSubmitting(false);
      trackEvent('lead_submit_blocked', { reason: 'too_fast', source: 'conversion_form' });
      showToast('error', 'Too fast', 'Please review your details and submit again.');
      return;
    }

    try {
      const response = await axios.post('/api/leads', {
        ...form,
        source: 'conversion_form',
      });
      const createdLeadId = response.data?.id ? String(response.data.id) : '';
      setLeadId(createdLeadId);
      setStatus('Consultation request submitted successfully.');
      setStatusType('success');
      trackEvent('lead_submit_success', {
        source: 'conversion_form',
        service: form.service,
        city: form.city,
      });
      showToast('success', 'Request submitted', 'Our consultant will contact you shortly.');
      setForm(initialForm);
      setFormStartedAt(Date.now());
    } catch (error) {
      setStatus('Submission failed. Please retry in a few seconds or use WhatsApp support.');
      setStatusType('error');
      trackEvent('lead_submit_failed', {
        source: 'conversion_form',
        service: form.service,
      });
      showToast('error', 'Submission failed', 'Please retry or use WhatsApp backup support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsappFlow = (intent: 'demo' | 'visit') => {
    const text = intent === 'demo'
      ? 'Hello Elyra Zen, I want to book a free smart-home demo.'
      : 'Hello Elyra Zen, I want to schedule a free site visit.';
    window.open(`https://wa.me/917092564791?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="contact" className="rounded-[34px] border border-gray-200 bg-white p-6 sm:p-8 mt-10 shadow-sm">
      <Toast
        open={toastState.open}
        type={toastState.type}
        title={toastState.title}
        message={toastState.message}
        onClose={() => setToastState((prev) => ({ ...prev, open: false }))}
      />
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] gold-text mb-2">Conversion Funnels</p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">Book demo, schedule site visit, or request a callback</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-2xl border gold-border bg-[#faf8ef] p-5">
          <h3 className="text-base font-bold text-black">Consultation Actions</h3>
          <p className="mt-2 text-sm text-gray-600">Use form-led booking first. Keep WhatsApp as backup support.</p>
          <div className="mt-5 flex flex-col gap-3">
            <button
              onClick={() => openWhatsappFlow('demo')}
              className="rounded-xl gold-bg border gold-border px-4 py-3 text-sm font-bold text-black hover:brightness-95 transition-colors"
            >
              WhatsApp: Book Free Demo
            </button>
            <button
              onClick={() => openWhatsappFlow('visit')}
              className="rounded-xl border gold-border bg-transparent px-4 py-3 text-sm font-bold text-black hover:bg-gray-100 transition-colors"
            >
              WhatsApp: Schedule Site Visit
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-base font-bold text-black">Lead Form</h3>
          <p className="mt-2 text-sm text-gray-600">Primary launch flow: submit details and our consultant will call you back.</p>

          {statusType === 'success' ? (
            <div className="mt-5 rounded-2xl border gold-border bg-[#faf8ef] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] gold-text">Request Received</p>
              <h4 className="mt-2 text-lg font-bold text-black">Thank you. Your consultation is confirmed.</h4>
              <p className="mt-2 text-sm text-gray-700">
                Our specialist will contact you soon to validate requirements and share the next action plan.
              </p>

              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-700 space-y-1">
                <p><span className="font-semibold text-black">Lead ID:</span> {leadId || 'Generated'}</p>
                <p><span className="font-semibold text-black">Step 1:</span> Requirement validation call</p>
                <p><span className="font-semibold text-black">Step 2:</span> Site visit / virtual walkthrough</p>
                <p><span className="font-semibold text-black">Step 3:</span> Proposal and timeline confirmation</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={resetFormFlow}
                  className="rounded-full border border-gray-300 px-5 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-100"
                >
                  Submit Another Request
                </button>
                <button
                  onClick={() => openWhatsappFlow('demo')}
                  className="rounded-full gold-bg border gold-border px-5 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-95"
                >
                  Optional: WhatsApp Follow-up
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              maxLength={80}
              required
              placeholder="Full Name"
              className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:border-black"
            />
            <input
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              maxLength={20}
              required
              placeholder="Phone Number"
              className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:border-black"
            />
            <input
              value={form.city}
              onChange={(e) => handleChange('city', e.target.value)}
              maxLength={80}
              required
              placeholder="City"
              className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:border-black"
            />
            <select
              value={form.service}
              onChange={(e) => handleChange('service', e.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-black focus:outline-none focus:border-black"
            >
              {services.map((service) => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
            <textarea
              value={form.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Project details (optional)"
              maxLength={500}
              rows={4}
              className="sm:col-span-2 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-gray-500 focus:outline-none focus:border-black"
            />

            <input
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className="hidden"
              aria-hidden="true"
              name="website"
            />

            <div className="sm:col-span-2 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-400">By submitting, you agree to be contacted for project consultation.</p>
              <div className="flex items-center gap-2">
                {statusType === 'error' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      const formElement = (e.currentTarget.closest('form') as HTMLFormElement | null);
                      if (formElement) {
                        formElement.requestSubmit();
                      }
                    }}
                    className="rounded-full border border-gray-300 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-black hover:bg-gray-100"
                  >
                    Retry
                  </button>
                )}
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="rounded-full gold-bg border gold-border px-5 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-95 disabled:opacity-70 transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Request Callback'}
                </button>
              </div>
            </div>

            {status && (
              <div className={`sm:col-span-2 text-xs font-semibold ${statusType === 'error' ? 'text-red-600' : 'text-black'}`}>{status}</div>
            )}
          </form>
          )}
        </div>
      </div>
    </section>
  );
}
