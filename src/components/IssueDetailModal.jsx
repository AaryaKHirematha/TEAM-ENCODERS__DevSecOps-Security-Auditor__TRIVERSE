import { X, Code, ShieldCheck } from 'lucide-react'
import SeverityBadge from './SeverityBadge'

export default function IssueDetailModal({ issue, onClose }) {
  if (!issue) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-navy-900 border border-surface-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-surface-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <SeverityBadge level={issue.severity} />
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">{issue.category}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{issue.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-surface-400 hover:text-white hover:bg-surface-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* File location */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-navy-950 border border-surface-800 text-sm">
            <Code className="w-4 h-4 text-surface-400" />
            <span className="text-surface-300 font-mono">
              {issue.file} <span className="text-surface-500">:{issue.line}</span>
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-surface-400 mb-2">Description</h3>
            <p className="text-surface-200 leading-relaxed text-sm">
              {issue.description}
            </p>
          </div>

          {/* Remediation */}
          <div>
            <h3 className="text-sm font-semibold text-surface-400 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Remediation
            </h3>
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-100 text-sm leading-relaxed">
              {issue.remediation}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-surface-800 bg-navy-950/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-surface-800 hover:bg-surface-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
