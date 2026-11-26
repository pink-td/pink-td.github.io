import React from 'react'
import {createRoot} from 'react-dom/client'
import Markdown from 'react-markdown'
import article from './posts/llama-cpp-vllm-deployment-blog.md?raw'
import './style.css'

const [titleLine, ...lines] = article.replace(/^\uFEFF/, '').split(/\r?\n/)
const title = titleLine.replace(/^# /, '')
const body = lines.join('\n')
const headings = lines.filter(line => line.startsWith('## ')).map(line => line.slice(3))
const sectionId = index => 'section-' + (index + 1)

const components = {
  h2: ({children}) => <h2 id={sectionId(headings.indexOf(children))}>{children}</h2>,
}

function App() {
  return <>
    <header className="header" id="top">
      <a className="brand" href="./">留白 <span>Daily Me</span></a>
      <a href="#article">文章</a>
    </header>
    <main id="article">
      <div className="intro">
        <p className="category">技术笔记</p>
        <h1>{title}</h1>
      </div>
      <div className="layout">
        <aside>
          <nav aria-label="文章目录">
            <p>目录</p>
            <ol>{headings.map((heading, index) => <li key={heading}><a href={'#' + sectionId(index)}>{heading}</a></li>)}</ol>
          </nav>
        </aside>
        <article className="prose" aria-label={title}>
          <Markdown components={components} skipHtml>{body}</Markdown>
        </article>
      </div>
    </main>
    <footer><span>留白 · Daily Me</span><a href="#top">回到顶部</a></footer>
  </>
}

createRoot(document.getElementById('root')).render(<App/>)
