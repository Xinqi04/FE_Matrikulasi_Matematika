import MathText from './MathText'

export default function MathPreview({ value }) {
  return <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
    <p className="mb-2 text-xs text-slate-500">{'Pratinjau rumus · x^2 untuk pangkat. Rumus lengkap: $\\frac{1}{2}$ atau $\\sqrt{x}$.'}</p>
    {value && <div className="text-sm leading-7 text-slate-800"><MathText>{value}</MathText></div>}
  </div>
}
