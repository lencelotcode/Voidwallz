import { MAX_REPORT_BYTES, IMAGE_MIME_TYPES } from '../../../shared/contracts/uploads';
import { submitReport } from '../services/reportService';
import { errorMessage as getErrorMessage } from '../../../shared/errors/AppError';
import MotionGraphic from '../../../shared/motion/MotionGraphic';
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

export default function ReportPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Auto-collected data
  const [systemInfo, setSystemInfo] = useState({
    userAgent: '',
    viewport: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    setSystemInfo({
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (
        file.size > MAX_REPORT_BYTES ||
        !(IMAGE_MIME_TYPES as readonly string[]).includes(file.type)
      ) {
        setErrorMessage('Choose a PNG, JPEG or WebP screenshot up to 2 MB.');
        setStatus('error');
        e.target.value = '';
        setSelectedFile(null);
        return;
      }
      setErrorMessage('');
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    formData.append('userAgent', systemInfo.userAgent);
    formData.append('viewport', systemInfo.viewport);
    formData.append('currentRoute', window.location.href);

    try {
      await submitReport(formData);

      setStatus('success');
    } catch (error: unknown) {
      setStatus('error');
      setErrorMessage(getErrorMessage(error, 'Report could not be sent. Please try again.'));
    }
  };

  return (
    <section className="vw-page vw-support page-shell">
      <header className="vw-page-heading">
        <MotionGraphic variant="report" className="vw-heading-graphic" />
        <h1>
          LET’S FIX
          <br />
          THAT<span className="vw-period">.</span>
        </h1>
        <p>
          Something not working? Tell us what happened and what you expected. A screenshot helps us
          find the issue.
        </p>
      </header>
      <div className="vw-support-layout">
        <aside>
          <h2>Help us see it.</h2>
          <p>Include the page you were on and the steps that led to the problem.</p>
          <p className="micro-label">Prefer email?</p>
          <a className="text-link" href="mailto:voidwallzbusiness@gmail.com">
            voidwallzbusiness@gmail.com
          </a>
        </aside>
        {status === 'success' ? (
          <div className="vw-form-success" role="status">
            <CheckCircle2 size={44} strokeWidth={1.5} />
            <h2>Report received.</h2>
            <p>Thanks for helping improve Voidwallz.</p>
            <button className="outline-button" type="button" onClick={() => setStatus('idle')}>
              Send another report
            </button>
          </div>
        ) : (
          <form className="vw-form" onSubmit={handleSubmit}>
            <div className="vw-field-row">
              <div className="vw-field">
                <label htmlFor="report-title">Issue title</label>
                <input
                  type="text"
                  id="report-title"
                  name="title"
                  minLength={3}
                  maxLength={160}
                  placeholder="e.g. Image doesn't load on my phone"
                  required
                />
              </div>
              <div className="vw-field">
                <label htmlFor="report-email">
                  Email <span>(optional)</span>
                </label>
                <input
                  type="email"
                  id="report-email"
                  name="email"
                  maxLength={254}
                  placeholder="For a follow-up"
                />
              </div>
            </div>
            <div className="vw-field-row">
              <div className="vw-field">
                <label htmlFor="report-device">Device</label>
                <select name="device" id="report-device">
                  <option value="desktop">Desktop / laptop</option>
                  <option value="mobile">Mobile / tablet</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="vw-field">
                <label htmlFor="report-browser">Browser</label>
                <select id="report-browser" name="browser">
                  <option value="chrome">Chrome / Chromium</option>
                  <option value="safari">Safari</option>
                  <option value="firefox">Firefox</option>
                  <option value="edge">Edge</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="vw-field">
              <label htmlFor="report-description">What happened?</label>
              <textarea
                id="report-description"
                name="description"
                minLength={10}
                maxLength={3500}
                rows={6}
                required
                placeholder="What did you do, and what went wrong?"
              />
            </div>
            <div className="vw-field">
              <label htmlFor="report-screenshot">
                Screenshot <span>(optional)</span>
              </label>
              <div className="vw-file-field">
                <UploadCloud size={24} />
                <input
                  id="report-screenshot"
                  type="file"
                  name="screenshot"
                  accept="image/png,image/jpeg,image/webp"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <span className="micro-label">
                  {selectedFile?.name || 'PNG, JPEG or WebP · up to 2 MB'}
                </span>
              </div>
            </div>
            <div className="vw-consent">
              <input type="checkbox" id="form-consent" name="consent" required />
              <label htmlFor="form-consent">
                I consent to the use of this report, attached screenshot, and browser/device
                information for resolving the issue, as described in the{' '}
                <a href="/privacy">Privacy Policy</a>.
              </label>
            </div>
            {status === 'error' && (
              <p className="vw-form-error" role="alert">
                {errorMessage}
              </p>
            )}
            <button
              type="submit"
              className="btn btn--primary vw-button"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Sending report…' : 'Send report'}
              <span aria-hidden="true">↗</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
