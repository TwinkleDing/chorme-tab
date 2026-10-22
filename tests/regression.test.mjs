import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer, transformWithEsbuild } from 'vite'
import { parse, compileScript } from '@vue/compiler-sfc'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { createRenderer, nextTick, markRaw } from 'vue'
import { createPinia } from 'pinia'

let server, useKlineData, StockPage, useStockStore
const storageWrites = []
const listeners = new Map()
const originalFetch = globalThis.fetch
const renderer = createRenderer({
  createComment: () => ({}), insert() {}, remove() {}, parentNode() {}, nextSibling() {},
})
const flush = async () => { await nextTick(); await new Promise(resolve => setImmediate(resolve)) }
const response = data => ({ ok: true, json: async () => ({ code: 0, data }) })
const row = ['2026-10-22', '10', '11', '12', '9', '100']

before(async () => {
  const storage = new Map()
  globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => { storageWrites.push(key); storage.set(key, value) } }
  globalThis.document = {
    hidden: false,
    addEventListener(type, fn) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(fn) },
    removeEventListener(type, fn) { listeners.get(type)?.delete(fn) },
  }
  server = await createServer({
    configFile: false,
    resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
    server: { middlewareMode: true }, appType: 'custom',
    // Exercise the actual setup logic without requiring a DOM or loading UI styles.
    plugins: [{ name: 'setup-test', async transform(source, id) {
      if (!id.endsWith('.vue')) return
      const { descriptor } = parse(source)
      const script = compileScript(descriptor, { id }).content
        .replace(/import (\w+) from ['"][^'"]+\.vue['"]/g, 'const $1 = {}')
      return transformWithEsbuild(script, id, { loader: 'ts' })
    } }],
  })
  ;({ useKlineData } = await server.ssrLoadModule('/src/composables/useKlineData.ts'))
  ;({ default: StockPage } = await server.ssrLoadModule('/src/views/stock/index.vue'))
  ;({ default: useStockStore } = await server.ssrLoadModule('/src/stores/stock.ts'))
})
after(async () => { globalThis.fetch = originalFetch; await server?.close() })

function mountStock() {
  const pinia = createPinia()
  globalThis.localStorage.setItem('stockCode', JSON.stringify({ value: 'sh515080' }))
  const app = renderer.createApp({ ...StockPage, render: () => null })
  app.use(pinia)
  const vm = app.mount({})
  return { app, state: vm.$.setupState, store: useStockStore(pinia) }
}

test('5-minute mode requests and parses 5-minute candles', async () => {
  let url
  globalThis.fetch = async input => {
    url = input
    return response({ sh515080: { m5: [['202610221000', '10', '11', '12', '9', '100']] } })
  }
  const { fetchKline } = useKlineData()
  const data = await fetchKline('sh515080', 'm5', 60)
  assert.match(url, /sh515080,m5,,,60/)
  assert.equal(data.length, 1)
  assert.equal(data[0].close, 11)
})

test('first visit loads the default stock candles', async () => {
  globalThis.fetch = async url => String(url).includes('qt.gtimg.cn')
    ? { ok: true, arrayBuffer: async () => new ArrayBuffer(0) }
    : response({ sh515080: { day: [row] } })
  const { app, store } = mountStock()
  try { await flush(); assert.equal(store.klineData[0]?.close, 11) }
  finally { app.unmount() }
})

test('late responses cannot replace the newly selected stock candles', async () => {
  const requests = []
  globalThis.fetch = url => {
    if (String(url).includes('qt.gtimg.cn')) return Promise.resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) })
    return new Promise(resolve => requests.push({ url: String(url), resolve }))
  }
  const { app, store } = mountStock()
  try {
    store.selectStock('sh600000'); await flush()
    store.selectStock('sz000001'); await flush()
    requests.find(r => r.url.includes('sz000001')).resolve(response({ sz000001: { day: [[...row.slice(0, 2), '22', ...row.slice(3)]] } }))
    await flush()
    requests.find(r => r.url.includes('sh600000')).resolve(response({ sh600000: { day: [row] } }))
    await flush()
    assert.equal(store.klineData[0]?.close, 22)
  } finally { app.unmount() }
})

test('changing the watchlist restarts polling with the remaining codes', async () => {
  const urls = []
  globalThis.fetch = async url => {
    urls.push(String(url))
    return String(url).includes('qt.gtimg.cn')
      ? { ok: true, arrayBuffer: async () => new ArrayBuffer(0) }
      : response({ sh515080: { day: [row] } })
  }
  const { app, store } = mountStock()
  try {
    await flush()
    store.addToWatchlist('sz000001'); await flush()
    store.removeFromWatchlist('sh515080'); await flush()
    assert.ok(urls.some(url => url.endsWith('q=sz000001')))
  } finally { app.unmount() }
})

async function mountSetup(path) {
  const { default: component } = await server.ssrLoadModule(path)
  const app = renderer.createApp({ ...component, render: () => null })
  app.use(createPinia())
  const vm = app.mount({})
  return { app, state: vm.$.setupState }
}

test('dragging persists coordinates once when the gesture ends', async () => {
  globalThis.fetch = async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(0) })
  const { app, state } = await mountSetup('/src/views/home/index.vue')
  const box = markRaw({ style: {}, parentElement: null, contains: target => target === box })
  state.box = box
  try {
    storageWrites.length = 0
    state.domMouseDown({ target: box, offsetX: 0, offsetY: 0 })
    for (let i = 1; i <= 10; i++) state.pageMove({ target: box, clientX: i, clientY: i })
    assert.equal(storageWrites.length, 0)
    state.domMouseUp({ target: box })
    assert.equal(globalThis.localStorage.getItem('searchX'), '{"value":"10px"}')
    assert.equal(storageWrites.length, 2)
  } finally { app.unmount() }
})

test('thumbnail picker removes its global listener on unmount', async () => {
  const before = listeners.get('click')?.size ?? 0
  const { app } = await mountSetup('/src/components/ImgList.vue')
  app.unmount()
  assert.equal(listeners.get('click')?.size ?? 0, before)
})

test('reader loads the packaged novel resource', async () => {
  const loadStory = url => readFileSync(new URL(`../public/${url.replace(/^\.\//, '')}`, import.meta.url), 'utf8')
  globalThis.fetch = async url => ({ ok: true, text: () => loadStory(String(url)) })
  const { app, state } = await mountSetup('/src/views/story/index.vue')
  try { await flush(); await flush(); assert.ok(state.lines.length > 10) }
  finally { app.unmount() }
})

test('restarting realtime polling does not wait for an obsolete request', async () => {
  const { useStockRealtime } = await server.ssrLoadModule('/src/composables/useStockRealtime.ts')
  const requests = []
  globalThis.fetch = (url, options) => new Promise(resolve => requests.push({ url, options, resolve }))
  const polling = useStockRealtime()
  try {
    polling.startPolling(['sh515080'])
    polling.startPolling(['sz000001'])
    assert.equal(requests.length, 2)
    assert.equal(requests[0].options.signal.aborted, true)
    polling.stopPolling()
    assert.equal(requests[1].options.signal.aborted, true)
  } finally { polling.stopPolling() }
})
