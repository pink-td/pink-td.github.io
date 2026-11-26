import React, {useEffect, useState} from 'react'
import {createRoot} from 'react-dom/client'
import Markdown from 'react-markdown'
import './style.css'

const path = location.pathname
const write = path === '/write'
const detail = /^\/posts\/(\d+)$/.exec(path)
const date = value => new Intl.DateTimeFormat('zh-CN', {dateStyle: 'long', timeZone: 'Asia/Shanghai'}).format(new Date(value))

async function api(url, options) {
  const response = await fetch('/api' + url, options)
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(typeof data.detail === 'string' ? data.detail : response.status === 422 ? '请检查文章字段。' : '请求失败，请稍后重试。')
  }
  return response.json()
}

function Meta({post}) {
  return <p className="meta"><span>{post.category}</span><time dateTime={post.published_at}>{date(post.published_at)}</time></p>
}

function Reader() {
  const [posts, setPosts] = useState([])
  const [post, setPost] = useState(null)
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [more, setMore] = useState(false)

  async function load(offset = 0) {
    setLoading(true)
    setError('')
    try {
      if (detail) setPost(await api('/posts/' + detail[1]))
      else {
        const page = await api('/posts?offset=' + offset)
        setPosts(previous => offset ? [...previous, ...page] : page)
        setMore(page.length === 20)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  if (detail) return <main className="reading">
    <a className="back" href="/">返回首页</a>
    {loading && <p role="status">正在加载文章…</p>}
    {error && <p role="alert">{error} <button onClick={() => load()}>重试</button></p>}
    {post && <article><Meta post={post}/><h1>{post.title}</h1><p className="lede">{post.summary}</p><div className="prose"><Markdown skipHtml>{post.body}</Markdown></div></article>}
  </main>

  const featured = posts[0]
  const categories = [...new Set(posts.map(item => item.category))]
  const visible = posts.filter(item => !filter || item.category === filter)
  return <main className="home">
    <section className="intro"><p className="eyebrow">DAILY ME / 个人博客</p><h1>给日常，留点白<span>。</span></h1><p className="lede">关于设计、技术和日常生活的随笔。</p></section>
    {featured && <a className="feature" href={'/posts/' + featured.id}>
      <div className="feature-copy"><p className="eyebrow">最新文章</p><h2>{featured.title}</h2><p>{featured.summary}</p><Meta post={featured}/></div>
      <div className="art" aria-hidden="true"><div className="ring"/><div className="orb"/></div>
    </a>}
    <section className="journal" id="articles">
      <div className="section-head"><h2>文章</h2><div className="filters" aria-label="筛选文章">
        {['', ...categories].map(category => <button key={category} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category || '全部'}</button>)}
      </div></div>
      {visible.map(item => <a className="row" key={item.id} href={'/posts/' + item.id}><div><h3>{item.title}</h3><p>{item.summary}</p></div><Meta post={item}/></a>)}
      {loading && <p role="status">正在加载文章…</p>}
      {error && <p role="alert">{error} <button onClick={() => load(posts.length)}>重试</button></p>}
      {!loading && !error && !visible.length && <p>这里还没有文章。</p>}
      {more && !error && <button className="more" disabled={loading} onClick={() => load(posts.length)}>加载更多</button>}
    </section>
  </main>
}

function Editor() {
  const [body, setBody] = useState('')
  const [preview, setPreview] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')

  async function importFile(event) {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    setError('')
    try {
      if (file.size > 400000) throw new Error('文件过大。')
      const content = new TextDecoder('utf-8', {fatal: true}).decode(await file.arrayBuffer())
      if (!content.trim() || Array.from(content).length > 100000) throw new Error('正文须为 1–100,000 个字符。')
      setBody(content)
      setFileName(file.name)
      setPreview(false)
    } catch (err) {
      setError(err instanceof TypeError ? '请选择 UTF-8 编码的文件。' : err.message)
    }
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    const {token, ...draft} = Object.fromEntries(new FormData(event.currentTarget))
    setBusy(true)
    try {
      const post = await api('/posts', {method: 'POST', headers: {'Content-Type':'application/json', Authorization:'Bearer ' + token.trim()}, body:JSON.stringify(draft)})
      location.assign('/posts/' + post.id)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return <main className="reading editor"><p className="eyebrow">DAILY ME / 写作</p><h1>发布文章</h1>
    <form onSubmit={submit}><fieldset disabled={busy}>
      <label>标题<input name="title" required maxLength={100}/></label>
      <label>分类<input name="category" required maxLength={24} placeholder="例如：设计"/></label>
      <label>摘要<textarea name="summary" required maxLength={240} rows={2}/></label>
      <div className="editor-tools"><label className="file">导入 Markdown<input type="file" accept=".md,.markdown,.txt" onChange={importFile}/></label><button type="button" aria-pressed={preview} onClick={() => setPreview(!preview)}>{preview ? '继续编辑' : '预览正文'}</button></div>
      {fileName && <p role="status">已导入 {fileName}</p>}
      {preview ? <><input type="hidden" name="body" value={body}/><div className="prose preview"><Markdown skipHtml>{body || '正文为空。'}</Markdown></div></> : <label>Markdown 正文<textarea name="body" required maxLength={100000} rows={12} value={body} onChange={event => setBody(event.target.value)}/></label>}
      <label>发布密钥<input name="token" type="password" required autoComplete="off"/></label>
      <button className="primary" disabled={busy || !body.trim()}>{busy ? '发布中…' : '发布文章'}</button>
    </fieldset>{error && <p className="error" role="alert">{error}</p>}</form>
  </main>
}

function App() {
  return <><header className="top"><nav className="glass" aria-label="主导航"><a className="brand" href="/"><i/>留白<span>DAILY ME</span></a><div><a href="/#articles">文章</a><a className="write" aria-current={write ? 'page' : undefined} href="/write">写文章</a></div></nav></header>{write ? <Editor/> : <Reader/>}<footer>留白 <span>·</span> Daily Me</footer></>
}

createRoot(document.getElementById('root')).render(<App/>)

