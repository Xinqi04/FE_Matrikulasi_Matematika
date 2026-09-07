import katex from 'katex'

// Explicit LaTeX delimiters first; legacy plain powers are recognized separately.
export function splitMath(text) {
  const parts = []
  const pattern = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|(?<![\\$])\$([^$\n]+?)\$/g
  let cursor = 0
  for (const match of String(text ?? '').matchAll(pattern)) {
    parts.push(...plainParts(String(text).slice(cursor, match.index)))
    parts.push({ source: match[0], math: match[1] ?? match[2] ?? match[3] ?? match[4], display: match[1] !== undefined || match[2] !== undefined })
    cursor = match.index + match[0].length
  }
  parts.push(...plainParts(String(text ?? '').slice(cursor)))
  return parts
}

function plainParts(text) {
  // No guessing fractions/dates or entire sentences. Parenthesized powers supported.
  const pattern = /(?<![\w\\])(?:\([^()\n]+\)|\d+(?:\.\d+)?[a-zA-Z]?|[a-zA-Z])\^(?:\{[^{}\n]+\}|\([^()\n]+\)|[+-]?\d+(?:\.\d+)?|[a-zA-Z])(?![\w^])/g
  const parts = []
  let cursor = 0
  for (const match of text.matchAll(pattern)) {
    parts.push({ source: text.slice(cursor, match.index) })
    const [base, exponent] = match[0].split('^')
    const value = exponent.startsWith('(') ? exponent.slice(1, -1) : exponent
    parts.push({ source: match[0], math: `${base}^{${value.replace(/^\{|\}$/g, '')}}`, display: false })
    cursor = match.index + match[0].length
  }
  parts.push({ source: text.slice(cursor) })
  return parts
}

export function renderMath(math, display = false) {
  if (math.length > 10000) return null
  try {
    return katex.renderToString(math, { displayMode: display, throwOnError: true, trust: false, strict: 'ignore', maxExpand: 200, maxSize: 10, output: 'htmlAndMathml' })
  } catch {
    return null
  }
}
