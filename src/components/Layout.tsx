import { NavLink, Outlet, useLocation } from "react-router-dom"
import { Home, Calendar, Repeat, GitBranch } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

const tabs = [
  { to: "/", label: "首页", icon: Home },
  { to: "/schedule", label: "舞台排期", icon: Calendar },
  { to: "/periodic", label: "周期生成", icon: Repeat },
  { to: "/approval/routes", label: "分支审批", icon: GitBranch },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-screen bg-theater-navy-dark font-body">
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-theater-navy-dark border-t border-theater-gold/10 pb-[env(safe-area-inset-bottom,8px)]">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 px-3 py-1 transition-colors duration-200 ${
                    isActive ? "text-theater-gold" : "text-white/40"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span className="text-[10px] leading-tight">{tab.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="tab-dot"
                        className="w-1 h-1 rounded-full bg-theater-gold mt-0.5"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
