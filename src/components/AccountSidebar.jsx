import { 
  X, 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Bell, 
  CreditCard,
  Building,
  ChevronDown,
  Moon,
  Sun,
  Activity,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function AccountSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()

  if (!user) return null

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-navy-950/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel - Now on the LEFT */}
      <div 
        className={`
          fixed top-0 left-0 h-full w-full sm:w-[380px] z-[70] 
          bg-gray-900 border-r border-brand-500/30 shadow-[20px_0_50px_rgba(0,0,0,0.8)]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          
          {/* 1. Header with Close Button */}
          <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gray-900">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-400" />
              SecAudit Account
            </h2>
            <button 
              onClick={onClose}
              className="p-2 text-surface-400 hover:text-white hover:bg-surface-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Organization Switcher */}
          <div className="p-5 border-b border-gray-800 bg-gray-900">
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded bg-brand-500/10 text-brand-400">
                  <Building className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-white leading-tight">Acme Corporation</div>
                  <div className="text-xs text-surface-400">Enterprise Plan</div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-surface-500" />
            </button>
          </div>

          {/* 3. User Info Profile Area */}
          <div className="p-5 border-b border-gray-800 bg-gray-900">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-accent-400 shadow-lg shadow-brand-500/20">
                  <span className="text-base font-bold text-white">{user.avatar}</span>
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-navy-900 rounded-full"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white leading-tight">{user.name}</h3>
                <p className="text-xs text-surface-400 mb-1.5">{user.email}</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  <Shield className="w-3 h-3" />
                  {user.role}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-900">
            {/* 3.5 Extended User Info */}
            <div className="p-5 border-b border-gray-800 bg-gray-800/50">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-400">Member Since</span>
                  <span className="text-white font-medium">Oct 2023</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-400">Connected Accounts</span>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-surface-800 text-xs text-white border border-surface-700">GitHub</span>
                    <span className="px-1.5 py-0.5 rounded bg-surface-800 text-xs text-white border border-surface-700">Google</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-surface-400">Active Session</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-xs">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Mac OS • Chrome
                  </span>
                </div>
              </div>
            </div>
            {/* 4. Quota & Usage */}
            <div className="p-5 border-b border-gray-800 bg-gray-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Monthly Scans</span>
                <span className="text-xs font-bold text-white">45 / 100</span>
              </div>
              <div className="h-2 w-full bg-surface-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-500 to-accent-400 w-[45%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
              </div>
              <p className="text-xs text-surface-500 mt-2">Resets in 14 days</p>
            </div>

            {/* 5. Navigation Options */}
            <div className="p-3">
              <nav className="space-y-0.5">
                {[
                  { name: 'Profile Settings', icon: User },
                  { name: 'Billing & Subscriptions', icon: CreditCard },
                  { name: 'Notifications', icon: Bell, badge: '3' },
                  { name: 'Security Preferences', icon: Shield },
                  { name: 'API Keys & Tokens', icon: Settings },
                ].map((item) => (
                  <a
                    key={item.name}
                    href="#"
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-surface-300 hover:text-white hover:bg-surface-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-surface-400 group-hover:text-brand-400 transition-colors" />
                      {item.name}
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}
              </nav>
            </div>

            {/* 6. Recent Activity */}
            <div className="p-5 border-t border-gray-800">
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /></div>
                  <div>
                    <div className="text-sm font-medium text-white leading-tight">Scan completed</div>
                    <div className="text-xs text-surface-400">frontend-core-app • 2 hrs ago</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5"><Shield className="w-4 h-4 text-brand-400" /></div>
                  <div>
                    <div className="text-sm font-medium text-white leading-tight">Policy updated</div>
                    <div className="text-xs text-surface-400">Enforced strict secrets scanning</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="flex-shrink-0 p-2.5 rounded-lg border border-gray-700 hover:bg-gray-800 text-surface-400 hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                logout()
                onClose()
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
