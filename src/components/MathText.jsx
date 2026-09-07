import { useMemo } from 'react'
import 'katex/dist/katex.min.css'
import { renderMath, splitMath } from '../mathText'

export default function MathText({ children, className = '' }) {
  const parts = useMemo(() => splitMath(children).map(part => ({ ...part, html: part.math ? renderMath(part.math, part.display) : null })), [children])
  return <span className={`math-text whitespace-pre-wrap ${className}`}>
    {parts.map((part, index) => part.html
      ? <span key={index} className={part.display ? 'math-block' : 'math-inline'} dangerouslySetInnerHTML={{ __html: part.html }} />
      : <span key={index}>{part.source}</span>)}
  </span>
}
