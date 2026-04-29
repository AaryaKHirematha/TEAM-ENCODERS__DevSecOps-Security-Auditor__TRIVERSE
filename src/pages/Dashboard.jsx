import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'
import SummaryCard from '../components/SummaryCard'
import VulnerabilityList from '../components/VulnerabilityList'
import IssueDetailModal from '../components/IssueDetailModal'
import { getDashboardStats } from '../services/api'
import { timeAgo } from '../utils/helpers'

export default function Dashboard() {
  const location = useLocation()
  const [data, setData] = useState(location.state?.scanResult || null)
  const [loading, setLoading] = useState(!data)
  const [selectedIssue, setSelectedIssue] = useState(null)

  useEffect(() => {
    // If no data was passed via navigation, fetch the default mock data
    if (!data) {
      const fetchData = async () => {
        const result = await getDashboardStats()
        setData(result)
        setLoading(false)
      }
      fetchData()
    }
  }, [data])

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-surface-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Scanner
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-brand-500/20 text-brand-400 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {data.repository}
              </h1>
              <p className="text-sm text-surface-400">
                Last scanned {timeAgo(data.timestamp)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <SummaryCard summary={data.summary} />

      {/* Vulnerabilities List */}
      <div className="mt-8">
        <VulnerabilityList 
          vulnerabilities={data.vulnerabilities} 
          onIssueClick={(issue) => setSelectedIssue(issue)}
        />
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <IssueDetailModal 
          issue={selectedIssue} 
          onClose={() => setSelectedIssue(null)} 
        />
      )}
    </div>
  )
}
