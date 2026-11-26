import React, {useState} from 'react'
import {createRoot} from 'react-dom/client'
import Markdown from 'react-markdown'
import './style.css'

const posts = Object.values(import.meta.glob('./posts/*.json', {eager: true, import: 'default'}))
  .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at)
    || String(b.id).localeCompare(String(a.id), 'en', {numeric: true}))
const postId = new URLSearchParams(location.search).get('post')
const categories = [...new Set(posts.map(post => post.category))]
const formatDate = new Intl.DateTimeFormat('zh-CN', {dateStyle: 'long', timeZone: 'Asia/Shanghai'})

function Meta({post}) {
  return <p className="meta"><span>{post.category}</span><time dateTime={post.published_at}>{formatDate.format(new Date(post.published_at))}</time></p>
}

function Archive() {
  const [filter, setFilter] = useState('')
  const visible = filter ? posts.filter(post => post.category === filter) : posts
  return <main>
    <section id="articles">
      <div className="section-head">
        {categories.length > 0 && <div className="filters" aria-label="按分类筛选">
          {['', ...categories].map(category => <button key={category} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category || '全部'}</button>)}
        </div>}
      </div>
      {visible.map(post => <article className="row" key={post.id}>
        <Meta post={post}/>
        <h3><a href={'?post=' + encodeURIComponent(post.id)}>{post.title}</a></h3>
        <p className="summary">{post.summary}</p>
      </article>)}
      {!visible.length && <p className="summary">这里还没有文章。</p>}
    </section>
  </main>
}

function Article({post}) {
  return <main className="reading">
    <a className="back" href="/#articles">← 返回文章归档</a>
    {post ? <article><Meta post={post}/><h1>{post.title}</h1><p className="lede">{post.summary}</p>
      <div className="prose"><Markdown skipHtml>{post.body}</Markdown></div>
    </article> : <h1>文章不存在</h1>}
  </main>
}

const selected = posts.find(post => String(post.id) === postId)
if (selected) document.title = selected.title + ' · daily me'

createRoot(document.getElementById('root')).render(<>
  <header className="top"><nav aria-label="主导航">
    <a className="brand" href="/">daily me</a>
  </nav></header>
  {postId !== null ? <Article post={selected}/> : <Archive/>}
</>)
