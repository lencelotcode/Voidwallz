import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAsyncResource } from '../src/shared/state/createAsyncResource';
import { createStore } from '../src/shared/state/createStore';
import {
  readStoredJson,
  readStoredString,
  writeStoredString,
} from '../src/shared/storage/browserStorage';
import { apiRequest } from '../src/shared/services/apiClient';
import { AppError } from '../src/shared/errors/AppError';
import {
  mapWallpaper,
  isStorageImage,
} from '../src/features/wallpapers/services/wallpaperRepository';
import { isPack } from '../src/features/packs/services/packRepository';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

test('all subscribers observe one stable state snapshot and can unsubscribe', () => {
  const store = createStore({ count: 0 });
  const first = store.getSnapshot();
  let notifications = 0;
  const unsubscribe = store.subscribe(() => notifications++);
  store.set(first);
  assert.equal(notifications, 0);
  store.set((previous) => ({ count: previous.count + 1 }));
  assert.equal(store.getSnapshot().count, 1);
  assert.equal(notifications, 1);
  unsubscribe();
  store.set({ count: 2 });
  assert.equal(notifications, 1);
});

test('catalogue consumers share one request instead of independent caches', async () => {
  let calls = 0;
  const request = deferred<string[]>();
  const resource = createAsyncResource(
    async () => {
      calls++;
      return request.promise;
    },
    { initialData: [], errorMessage: 'Unavailable' },
  );
  const a = resource.load();
  const b = resource.load();
  assert.equal(a, b);
  await Promise.resolve();
  assert.equal(calls, 1);
  request.resolve(['same-data']);
  await Promise.all([a, b]);
  assert.equal(resource.getSnapshot().status, 'success');
  await resource.load();
  assert.equal(calls, 1);
});

test('failures settle every subscriber and a retry clears the error', async () => {
  let fails = true;
  const resource = createAsyncResource(
    async () => {
      if (fails) throw new Error('private upstream body');
      return ['restored'];
    },
    { initialData: [], fallback: () => ['featured'], errorMessage: 'Collection unavailable' },
  );
  await resource.load();
  assert.deepEqual(resource.getSnapshot(), {
    data: ['featured'],
    status: 'error',
    error: 'Collection unavailable',
  });
  fails = false;
  await resource.reload();
  assert.deepEqual(resource.getSnapshot(), { data: ['restored'], status: 'success', error: null });
});

test('a stale request cannot overwrite a newer retry or its metadata', async () => {
  const first = deferred<{ id: string; title: string }[]>();
  const second = deferred<{ id: string; title: string }[]>();
  let calls = 0;
  const resource = createAsyncResource(() => (++calls === 1 ? first.promise : second.promise), {
    initialData: [],
    errorMessage: 'Unavailable',
  });
  const older = resource.load();
  await Promise.resolve();
  const newer = resource.reload();
  await Promise.resolve();
  second.resolve([{ id: 'same', title: 'Updated title' }]);
  await newer;
  first.resolve([{ id: 'same', title: 'Old title' }]);
  await older;
  assert.equal(resource.getSnapshot().data[0].title, 'Updated title');
});

test('blocked storage and invalid cached JSON degrade safely', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  try {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        get localStorage() {
          throw new Error('Storage blocked');
        },
      },
    });
    assert.equal(readStoredString('key', 'fallback'), 'fallback');
    assert.equal(writeStoredString('key', 'value'), false);
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { localStorage: { getItem: () => '{bad-json' } },
    });
    assert.deepEqual(
      readStoredJson('key', [] as string[], (value): value is string[] => Array.isArray(value)),
      [],
    );
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { localStorage: { getItem: () => '{"not":"an array"}' } },
    });
    assert.deepEqual(
      readStoredJson('key', [] as string[], (value): value is string[] => Array.isArray(value)),
      [],
    );
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});

test('API transport preserves required headers and reports HTTP/network/malformed response failures', async (context) => {
  const fetch = context.mock.method(globalThis, 'fetch', async (_url, init) => {
    assert.equal(init.credentials, 'same-origin');
    assert.equal(init.headers['X-Voidwallz-Request'], '1');
    return Response.json({ success: true });
  });
  await apiRequest('/api/report', { method: 'POST', body: new FormData() });
  fetch.mock.mockImplementation(async () => Response.json({ error: 'Try later' }, { status: 429 }));
  await assert.rejects(
    apiRequest('/api/report'),
    (error) => error instanceof AppError && error.status === 429 && error.message === 'Try later',
  );
  fetch.mock.mockImplementation(async () => new Response('<html>not JSON</html>'));
  await assert.rejects(
    apiRequest('/api/report'),
    (error) => error instanceof AppError && error.code === 'response',
  );
  fetch.mock.mockImplementation(async () => {
    throw new Error('private network address');
  });
  await assert.rejects(
    apiRequest('/api/report'),
    (error) =>
      error instanceof AppError && error.code === 'network' && !error.message.includes('private'),
  );
  await assert.rejects(apiRequest('https://example.com/api/admin'), AppError);
});

test('wallpaper mapping preserves titles, IDs, zero-byte filtering and actual file formats', () => {
  const item = mapWallpaper(
    { name: ' Mirror Hall.webp', metadata: { size: 12 } },
    'desktop',
    'https://cdn/preview',
    'https://cdn/original',
  );
  assert.equal(item.title, ' Mirror Hall');
  assert.equal(item.id, 'desktop- Mirror Hall');
  assert.equal(item.format, 'WEBP');
  assert.equal(item.originalUrl, 'https://cdn/original');
  assert.equal(isStorageImage({ name: 'bad.svg', metadata: { size: 12 } }), false);
  assert.equal(isStorageImage({ name: 'empty.png', metadata: { size: 0 } }), false);
  assert.equal(isPack({ id: 'bad', title: 'Bad', device: 'mobile', items: [{}] }), false);
});

const root = fileURLToPath(new URL('../', import.meta.url));
async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? sourceFiles(resolve(directory, entry.name))
          : /\.[cm]?[jt]sx?$/.test(entry.name)
            ? [resolve(directory, entry.name)]
            : [],
      ),
    )
  ).flat();
}
async function resolves(path: string) {
  for (const candidate of [
    path,
    `${path}.ts`,
    `${path}.tsx`,
    `${path}.js`,
    resolve(path, 'index.ts'),
  ]) {
    try {
      if ((await stat(candidate)).isFile()) return true;
    } catch {
      /* Try next supported module extension. */
    }
  }
  return false;
}
test('source imports resolve after moves and browser modules never depend on private server code', async () => {
  const files = (
    await Promise.all(
      ['src', 'server', 'api', 'config', 'scripts'].map((folder) =>
        sourceFiles(resolve(root, folder)),
      ),
    )
  ).flat();
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(/(?:from\s*|import\s*\(|import\s*)["'](\.[^"']+)["']/g)) {
      const target = resolve(dirname(file), match[1]);
      // The isolated build fixture embeds an absolute virtual file path in a test string.
      assert.ok(await resolves(target), `Broken import ${match[1]} in ${file.replace(root, '')}`);
      if (file.startsWith(resolve(root, 'src') + '/'))
        assert.equal(
          target.startsWith(resolve(root, 'server') + '/') ||
            target.startsWith(resolve(root, 'api') + '/'),
          false,
          'Server modules cannot enter browser dependency graphs',
        );
      if (file.startsWith(resolve(root, 'src/shared') + '/'))
        assert.equal(
          target.startsWith(resolve(root, 'src/features') + '/') ||
            target.startsWith(resolve(root, 'src/app') + '/'),
          false,
          'Shared primitives must not depend on application features',
        );
    }
    if (file.includes('/features/') && file.includes('/components/')) {
      assert.equal(
        /\bfetch\s*\(/.test(source),
        false,
        `API calls belong in services: ${file.replace(root, '')}`,
      );
      assert.equal(
        /\b(?:localStorage|sessionStorage)\./.test(source),
        false,
        `Persistence belongs in stores: ${file.replace(root, '')}`,
      );
    }
  }
});
