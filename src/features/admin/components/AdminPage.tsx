import {
  PACK_CATEGORIES,
  MAX_PACK_BYTES,
  MAX_PACK_FILES,
  IMAGE_MIME_TYPES,
} from '../../../shared/contracts/uploads';
import { checkAdminSession, signIn, adminMutation } from '../services/adminService';
import { AppError, errorMessage, isAbortError } from '../../../shared/errors/AppError';
import { removeStoredValue } from '../../../shared/storage/browserStorage';
import { packsStore } from '../../packs/state/packsStore';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Lock, LogOut, UploadCloud } from 'lucide-react';

const CATEGORIES = PACK_CATEGORIES;
export default function AdminPage() {
  const [csrf, setCsrf] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [device, setDevice] = useState('desktop');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // The previous client-side flag has no authorization meaning.
    removeStoredValue('void_admin_authenticated', 'session');
    const controller = new AbortController();
    checkAdminSession(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setCsrf(data.csrf);
      })
      .catch((error) => {
        if (
          !controller.signal.aborted &&
          !isAbortError(error) &&
          !(error instanceof AppError && error.status === 401)
        )
          setMessage(errorMessage(error, 'Could not check studio access. Please try again.'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setChecking(false);
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);
  async function request(action: 'logout' | 'publish', body: BodyInit) {
    if (!csrf) throw new AppError('Sign in to the publishing studio.', 'authentication', 401);
    try {
      return await adminMutation(action, body, csrf);
    } catch (error) {
      if (error instanceof AppError && error.status === 401) setCsrf(null);
      throw error;
    }
  }
  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const data = await signIn(password);
      setCsrf(data.csrf);
    } catch (error) {
      setMessage(errorMessage(error, 'Sign-in failed.'));
    } finally {
      setPassword('');
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      await request('logout', '{}');
      setCsrf(null);
      setFiles([]);
      setMessage('');
    } catch {
      setMessage('Could not end the session. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  function selectFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []) as File[];
    if (
      !selected.length ||
      selected.length > MAX_PACK_FILES ||
      selected.some((file) => !(IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) ||
      selected.reduce((sum, file) => sum + file.size, 0) > MAX_PACK_BYTES
    ) {
      setMessage(
        'Choose up to five PNG, JPEG or WebP images, with a combined size of 3 MB or less.',
      );
      event.target.value = '';
      setFiles([]);
      return;
    }
    setMessage('');
    setFiles(selected);
  }
  async function publish(event: React.FormEvent) {
    event.preventDefault();
    if (!files.length || busy) return;
    setBusy(true);
    setMessage('');
    const body = new FormData();
    for (const [key, value] of Object.entries({ title, tagline, category, device }))
      body.append(key, value);
    files.forEach((file) => body.append('images', file));
    try {
      await request('publish', body);
      void packsStore.reload();
      setMessage('Your pack has been published.');
      setTitle('');
      setTagline('');
      setFiles([]);
      if (input.current) input.current.value = '';
    } catch (error) {
      setMessage(errorMessage(error, 'Publishing failed.'));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="vw-page page-shell vw-admin">
      <header className="vw-page-heading">
        <h1>{csrf ? 'Publish a pack.' : 'Studio access.'}</h1>
        <p>
          {csrf
            ? 'Add your artwork and publish a collection.'
            : 'Sign in to manage the Voidwallz collection.'}
        </p>
      </header>
      <a className="text-link" href="/packs">
        <ArrowLeft size={16} /> Back to packs
      </a>
      {checking ? (
        <p role="status">Checking studio access…</p>
      ) : !csrf ? (
        <form onSubmit={login} className="vw-form" style={{ maxWidth: 440, marginTop: 32 }}>
          <div className="vw-field">
            <label htmlFor="studio-password">Studio password</label>
            <input
              id="studio-password"
              type="password"
              autoComplete="current-password"
              minLength={16}
              maxLength={256}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <button type="submit" disabled={busy} className="btn btn--primary vw-button">
            <Lock size={18} />
            {busy ? 'Signing in…' : 'Open publishing studio'}
          </button>
        </form>
      ) : (
        <div style={{ maxWidth: 760, marginTop: 32 }}>
          <button type="button" className="text-link" onClick={logout} disabled={busy}>
            <LogOut size={16} /> End studio session
          </button>
          <form onSubmit={publish} className="vw-form" style={{ marginTop: 24 }}>
            <div className="vw-field">
              <label htmlFor="pack-title">Pack title</label>
              <input
                id="pack-title"
                required
                minLength={3}
                maxLength={100}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="vw-field">
              <label htmlFor="pack-description">Short description</label>
              <input
                id="pack-description"
                maxLength={240}
                value={tagline}
                onChange={(event) => setTagline(event.target.value)}
              />
            </div>
            <div className="vw-field-row">
              <div className="vw-field">
                <label htmlFor="pack-device">Screen</label>
                <select
                  id="pack-device"
                  value={device}
                  onChange={(event) => setDevice(event.target.value)}
                >
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Phone</option>
                </select>
              </div>
              <div className="vw-field">
                <label htmlFor="pack-category">Category</label>
                <select
                  id="pack-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {CATEGORIES.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="vw-field">
              <label htmlFor="pack-files">Wallpapers</label>
              <input
                id="pack-files"
                ref={input}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={selectFiles}
                required
              />
              <p className="vw-form-note">Up to five images. Maximum combined size: 3 MB.</p>
            </div>
            {previews.length > 0 && (
              <div className="vw-pack-thumbs">
                {previews.map((src, index) => (
                  <img
                    key={src}
                    src={src}
                    alt={`Selected artwork ${index + 1}`}
                    style={{ width: 96, height: 96, objectFit: 'contain' }}
                  />
                ))}
              </div>
            )}
            <button
              type="submit"
              disabled={busy || !files.length}
              className="btn btn--primary vw-button"
            >
              <UploadCloud size={18} />
              {busy ? 'Publishing…' : 'Publish pack'}
            </button>
          </form>
        </div>
      )}
      {message && (
        <p role="status" className="vw-form-note" style={{ marginTop: 24 }}>
          {message}
        </p>
      )}
    </section>
  );
}
