import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RepoInput from '../components/RepoInput'
import SecurityScore from '../components/SecurityScore'
import { scanRepository } from '../services/api'
import {
  Shield,
  Workflow,
  Search,
  ShieldCheck,
  Eye,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Workflow,
    title: 'Automated CI/CD',
    description: 'Seamlessly integrate security gates into your existing GitHub Actions or GitLab CI pipelines.',
  },
  {
    icon: Search,
    title: 'Secret Detection',
    description: 'Identify leaked API keys, passwords, and sensitive credentials before they reach production.',
  },
  {
    icon: ShieldCheck,
    title: 'Policy Enforcement',
    description: 'Define custom compliance rules to block merging of code that doesn\'t meet your standards.',
  },
]

const REPOS = [
  {
    name: 'frontend-core-app',
    branch: 'production/v2.1.3',
    icon: '🌐',
    lastScan: '12 mins ago',
    status: 'Passed',
    critical: 0,
    action: 'View Report',
  },
  {
    name: 'auth-microservice-node',
    branch: 'main',
    icon: '🔑',
    lastScan: '2 hours ago',
    status: 'Failed',
    critical: 3,
    action: 'Review Issues',
  },
]

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleScan = async (payload) => {
    setLoading(true)
    setError('')
    try {
      const data = await scanRepository(payload.payload, payload.type)
      navigate('/dashboard', { state: { scanResult: data } })
    } catch (err) {
      setError(err.message || 'An error occurred during scanning.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* ─── Hero Section ─── */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[85vh] flex items-center">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-accent-400/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto w-full z-10">
          <div className="max-w-3xl animate-fade-in-up">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Real-time Security Scan
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-white leading-[1.15] mb-6">
              Audit your infrastructure with{' '}
              <em className="gradient-text not-italic font-extrabold">
                surgical precision.
              </em>
            </h1>

            <p className="text-base sm:text-lg text-surface-400 leading-relaxed mb-10 max-w-xl">
              The DevSecOps powerhouse for automated repository scanning,
              vulnerability orchestration, and real-time compliance reporting.
            </p>

            {/* Repo Input takes the place of the old buttons */}
            <div className="mt-4 -ml-2 sm:ml-0">
              <RepoInput 
                onScan={handleScan}
                loading={loading}
                error={error}
              />
            </div>

          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-surface-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="glass-card p-6 animate-fade-in-up"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20">
                      <Icon className="w-5 h-5 text-brand-400" />
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-sm text-surface-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Monitored Repositories ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-navy-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1">
                Monitored Repositories
              </h2>
              <p className="text-sm text-surface-400">
                Real-time status of your connected codebases
              </p>
            </div>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-surface-700/50 text-sm text-surface-400 hover:text-white hover:border-surface-500/50 transition-all duration-200">
              <Eye className="w-4 h-4" />
              View All
            </button>
          </div>

          {/* Table */}
          <div className="glass-card overflow-hidden">
            {/* Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b border-brand-500/10 text-xs font-semibold text-surface-500 uppercase tracking-wider">
              <div className="col-span-4">Repository Name</div>
              <div className="col-span-2">Last Scan</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Critical</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {/* Rows */}
            {REPOS.map((repo, index) => (
              <div
                key={repo.name}
                className={`
                  repo-row grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 items-center
                  ${index < REPOS.length - 1 ? 'border-b border-brand-500/5' : ''}
                `}
              >
                <div className="sm:col-span-4 flex items-center gap-3">
                  <span className="text-lg">{repo.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{repo.name}</div>
                    <div className="text-xs text-surface-500">{repo.branch}</div>
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-center gap-1.5 text-sm text-surface-400">
                  <Clock className="w-3.5 h-3.5 sm:hidden" />
                  {repo.lastScan}
                </div>

                <div className="sm:col-span-2">
                  {repo.status === 'Passed' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Passed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                      <XCircle className="w-3 h-3" />
                      Failed
                    </span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <span className={`text-sm font-bold ${repo.critical > 0 ? 'text-red-400' : 'text-surface-500'}`}>
                    {repo.critical}
                  </span>
                </div>

                <div className="sm:col-span-2 sm:text-right">
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors duration-200"
                  >
                    {repo.action}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
