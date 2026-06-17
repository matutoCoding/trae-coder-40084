import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Calendar, Clock, MapPin, Trash2, ToggleLeft, ToggleRight, ChevronDown, ChevronRight, Play } from "lucide-react"
import { useTheaterStore } from "@/store/theaterStore"

const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

export default function PeriodicRules() {
  const navigate = useNavigate()
  const { periodicRules, stages, troupes, updatePeriodicRule, deletePeriodicRule } = useTheaterStore()
  const [collapsedTroupe, setCollapsedTroupe] = useState<Set<string>>(new Set())

  const rulesByTroupe = troupes.map(troupe => ({
    troupe,
    rules: periodicRules.filter(r => r.troupeId === troupe.id)
  })).filter(g => g.rules.length > 0)

  const getStageName = (id: string) => stages.find(s => s.id === id)?.name ?? "未知舞台"

  const toggleRule = (id: string, enabled: boolean) => {
    updatePeriodicRule(id, { enabled: !enabled })
  }

  const toggleCollapse = (troupeId: string) => {
    setCollapsedTroupe(prev => {
      const next = new Set(prev)
      if (next.has(troupeId)) next.delete(troupeId)
      else next.add(troupeId)
      return next
    })
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-theater-cream">
          周期规则管理
        </h1>
        <div className="flex gap-2">
          <button
            className="btn-outline flex items-center gap-1.5 text-sm"
            onClick={() => navigate("/periodic/preview")}
          >
            <Play size={14} />
            批量预览
          </button>
          <button
            className="btn-gold flex items-center gap-1.5 text-sm"
            onClick={() => navigate("/periodic/new")}
          >
            <Plus size={16} />
            新建规则
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {rulesByTroupe.map(({ troupe, rules }, groupIndex) => {
          const isCollapsed = collapsedTroupe.has(troupe.id)
          return (
            <motion.div
              key={troupe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
            >
              <button
                onClick={() => toggleCollapse(troupe.id)}
                className="w-full flex items-center justify-between mb-2 px-1"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: troupe.color }}
                  />
                  <span className="font-semibold text-theater-cream">{troupe.name}</span>
                  <span className="badge bg-white/5 text-white/50">{rules.length} 条规则</span>
                </div>
                {isCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-white/40" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/40" />
                )}
              </button>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {rules.map((rule, i) => (
                      <motion.div
                        key={rule.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`card p-3 ${rule.enabled ? "border-theater-gold/10" : "border-white/5 opacity-60"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-semibold text-theater-cream text-sm truncate">{rule.name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => toggleRule(rule.id, rule.enabled)}>
                              {rule.enabled ? (
                                <ToggleRight className="w-6 h-6 text-theater-gold" />
                              ) : (
                                <ToggleLeft className="w-6 h-6 text-white/30" />
                              )}
                            </button>
                            <button
                              onClick={() => deletePeriodicRule(rule.id)}
                              className="text-white/20 hover:text-theater-red transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs flex-wrap">
                          <span className="flex items-center gap-1.5 text-theater-cream/70">
                            <Calendar className="w-3.5 h-3.5 text-theater-gold/60" />
                            {weekDays[rule.dayOfWeek]}
                          </span>
                          <span className="flex items-center gap-1.5 text-theater-cream/70">
                            <Clock className="w-3.5 h-3.5 text-theater-gold/60" />
                            {rule.startTime}-{rule.endTime}
                          </span>
                          <span className="flex items-center gap-1.5 text-theater-cream/70">
                            <MapPin className="w-3.5 h-3.5 text-theater-gold/60" />
                            {getStageName(rule.stageId)}
                          </span>
                          <span className={`badge text-[10px] ${rule.enabled ? "bg-theater-gold/20 text-theater-gold" : "bg-white/5 text-white/40"}`}>
                            {rule.enabled ? "启用" : "停用"}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}

        {periodicRules.length === 0 && (
          <div className="card text-center text-white/40 py-12">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-white/20" />
            <p>暂无周期规则</p>
            <button
              className="btn-gold mt-4 text-sm"
              onClick={() => navigate("/periodic/new")}
            >
              创建第一条规则
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
