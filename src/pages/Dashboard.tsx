import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Plus, Calendar, Repeat, AlertCircle } from "lucide-react"
import { useTheaterStore } from "@/store/theaterStore"

export default function Dashboard() {
  const navigate = useNavigate()
  const { performances, stages, troupes, occupancies } = useTheaterStore()

  const today = format(new Date(), "yyyy-MM-dd")
  const todayDisplay = format(new Date(), "M月d日 EEEE", { locale: zhCN })
  const todayOccupancies = occupancies.filter(o => o.date === today)
  const pendingCount = performances.filter(p => p.status === "pending").length

  const getTroupeName = (id: string) => troupes.find(t => t.id === id)?.name ?? ""
  const getStageName = (id: string) => stages.find(s => s.id === id)?.name ?? ""

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })

  const stageUtilization = stages.map(stage => {
    const weekOccs = occupancies.filter(o => {
      if (o.stageId !== stage.id) return false
      const d = parseISO(o.date)
      return isWithinInterval(d, { start: weekStart, end: weekEnd })
    })
    const occupiedHours = weekOccs.reduce((sum, o) => {
      const [sh, sm] = o.startTime.split(":").map(Number)
      const [eh, em] = o.endTime.split(":").map(Number)
      return sum + (eh + em / 60) - (sh + sm / 60)
    }, 0)
    return { stage, percentage: Math.min(Math.round((occupiedHours / 84) * 100), 100) }
  })

  return (
    <div className="page-container relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 30% at 50% -5%, rgba(212,168,67,0.15) 0%, transparent 70%)",
          animation: "spotlightPulse 4s ease-in-out infinite alternate",
        }}
      />

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <h1
          className="font-display text-3xl text-theater-gold text-center mt-4 mb-1"
          style={{ textShadow: "0 0 20px rgba(212,168,67,0.3)" }}
        >
          星辉剧场
        </h1>
        <p className="text-center text-white/40 text-sm mb-8">{todayDisplay}</p>
      </motion.div>

      <div className="relative z-10 space-y-6">
        <section>
          <h2 className="section-title mb-3">今日排期</h2>
          {todayOccupancies.length > 0 ? (
            <div className="space-y-2">
              {todayOccupancies.map((occ, i) => (
                <motion.div
                  key={occ.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card-gold"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-theater-gold font-semibold text-sm">{occ.startTime} - {occ.endTime}</span>
                    <span className="badge bg-theater-gold/20 text-theater-gold">{occ.type}</span>
                  </div>
                  <p className="text-theater-cream text-sm mt-1">{getStageName(occ.stageId)} · {getTroupeName(occ.troupeId)}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card text-center text-white/30 py-6">今日无排期</div>
          )}
        </section>

        {pendingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate("/approval/my")}
            className="card border-amber-500/30 cursor-pointer active:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-amber-300 text-sm font-semibold">{pendingCount} 条待审批</p>
                <p className="text-white/40 text-xs">点击查看</p>
              </div>
            </div>
          </motion.div>
        )}

        <section>
          <h2 className="section-title mb-3">资源利用率</h2>
          <div className="space-y-3">
            {stageUtilization.map(({ stage, percentage }, i) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-theater-cream">{stage.name}</span>
                  <span className="text-theater-gold">{percentage}%</span>
                </div>
                <div className="h-2 bg-theater-navy-dark/60 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                    className={`h-full rounded-full ${
                      percentage > 80 ? "bg-theater-red" : percentage > 50 ? "bg-amber-500" : "bg-theater-gold"
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section-title mb-3">快捷操作</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Plus, label: "新建演出", path: "/performances/new" },
              { icon: Calendar, label: "排期日历", path: "/calendar" },
              { icon: Repeat, label: "周期规则", path: "/periodic-rules" },
            ].map(({ icon: Icon, label, path }, i) => (
              <motion.button
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                onClick={() => navigate(path)}
                className="card flex flex-col items-center gap-2 py-4 active:bg-white/5"
              >
                <Icon className="w-6 h-6 text-theater-gold" />
                <span className="text-xs text-theater-cream">{label}</span>
              </motion.button>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        @keyframes spotlightPulse {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
