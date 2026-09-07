import test from 'node:test'
import assert from 'node:assert/strict'
import { splitMath, renderMath } from '../src/mathText.js'

test('legacy powers keep prose intact', () => {
  const parts = splitMath('Hitung 2x^2 + (x+1)^3 dan 10^-2.')
  assert.equal(parts.filter(p => p.math).length, 3)
  assert.equal(parts.map(p => p.source).join(''), 'Hitung 2x^2 + (x+1)^3 dan 10^-2.')
  assert.equal(parts.find(p => p.math).math, '2x^{2}')
})
test('fractions roots and display delimiters', () => {
  const parts = splitMath(String.raw`Nilai $\frac{1}{2}$ dan \(\sqrt{x}\), lalu $$x^2=4$$`)
  const formulas = parts.filter(p => p.math)
  assert.equal(formulas.length, 3)
  assert.equal(formulas[2].display, true)
  for (const part of formulas) assert.match(renderMath(part.math, part.display), /katex/)
})
test('invalid formulas fall back; unsafe commands do not create links', () => {
  assert.equal(renderMath(String.raw`\frac{`), null)
  assert.doesNotMatch(renderMath(String.raw`\href{javascript:alert(1)}{x}`) ?? '', /href="javascript:/)
  assert.equal(splitMath('<img src=x onerror=alert(1)>')[0].math, undefined)
  assert.equal(splitMath('Tanggal 12/03/2026')[0].math, undefined)
})
