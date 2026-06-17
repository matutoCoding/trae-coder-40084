import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Calendar, AlertTriangle, CheckCircle, Sparkles } from "lucide-react"
import { useTheaterStore } from "@/store/theaterStore"
import type { Occupancy } from "@/types"
import { format, addDays, startOfWeek } from "date-fns"

export default function BatchPreview() {
  const navigate = useNavigate()
  const { periodicRules, troupes, stages, generateFromRule, batchAddOccupancies, occupancies } = useTheaterStore()
  const [weeks, setWeeks] = useState<4 | 8 | 12>(4)
  const [success, setSuccess] = useState(false)

  const enabledRules = periodicRules.filter((r) => r.enabled)

  const getTroupeName = (id: string) => troupes.find((t) => t.id === id)?.name ?? "未知"
  const getStageName = (id: string) => stages.find((s) => s.id === id)?.name ?? "未知"

  const previewItems = useMemo(() => {
    const all: Occupancy[] = []
    for (const rule of enabledRules) {
      const generated = generateFromRule(rule.id, weeks)
      all.push(...generated)
    }
    all.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    return all
  }, [enabledRules, weeks, generateFromRule])

  const conflicts = useMemo(() => {
    const set = new Set<string>()
    const existing = [...occupancies, ...previewItems]
    for (let i = 0; i < existing.length; i++) {
      for (let j = i + 1; j < existing.length; j++) {
        const a = existing[i], b = existing[j]
        if (a.stageId === b.stageId && a.date === b.date && a.id !== b.id) {
          if (a.startTime < b.endTime && b.startTime < a.endTime) {
            set.add(a.id)
            set.add(b.id)
          }
        }
      }
    }
    return set
  }, [previewItems, occupancies])

  const groupedByWeek = useMemo(() => {
    const map = new Map<string, Occupancy[]>()
    for (const item of previewItems) {
      const d = new Date(item.date)
      const weekStart = format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd")
      if (!map.has(weekStart)) map.set(weekStart, [])
      map.get(weekStart)!.push(item)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [previewItems])

  const conflictCount = previewItems.filter((item) => conflicts.has(item.id)).length

  const handleConfirm = () => {
    batchAddOccupancies(previewItems)
    setSuccess(true)
    setTimeout(() => navigate(-1), 1500)
  }

  if (success) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-screen">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <CheckCircle size={64} className="text-theater-gold mx-auto mb-4" />
          <p className="text-theater-cream text-lg font-semibold">成功生成 {previewItems.length} 条占用</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1 className="section-title mb-4">批量预览</h1>

      <div className="card mb-4">
        <div className="text-sm text-white/60 mb-2">已启用规则</div>
        {enabledRules.length === 0 ? (
          <p className="text-white/30 text-sm">暂无已启用规则</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {enabledRules.map((r) => (
              <span key={r.id} className="badge bg-theater-gold/20 text-theater-gold">{r.name}</span>
            ))}
          </div>
        )}
      </div>

      <div className="card mb-4">
        <label className="text-sm text-white/60 mb-2 block">生成周数</label>
        <div className="grid grid-cols-3 gap-2">
          {[4, 8, 12].map((w) => (
            <button
              key={w}
              onClick={() => setWeeks(w as 4 | 8 | 12)}
              className={`py-2 rounded-xl text-sm transition-colors ${weeks === w ? "bg-theater-gold text-theater-navy-dark font-semibold" : "bg-theater-navy-dark/60 text-white/60 border border-white/10"}`}
            >
              {w} 周
            </button>
          ))}
        </div>
      </div>

      {conflictCount > 0 && (
        <div className="card border-theater-red/40 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-theater-red-light shrink-0" />
          <span className="text-theater-red-light text-sm">检测到 {conflictCount} 条时间冲突</span>
        </div>
      )}

      <div className="space-y-4 mb-24">
        {groupedByWeek.map(([weekStart, items]) => (
          <div key={weekStart}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-theater-gold" />
              <span className="text-theater-gold text-sm font-semibold">
                {weekStart} ~ {format(addDays(new Date(weekStart), 6), "MM-dd")}
              </span>
              <span className="badge bg-white/10 text-white/40">{items.length}</span>
            </div>
            <div className="space-y-1">
              {items.map((item, i) => {
                const isConflict = conflicts.has(item.id)
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`card py-2 px-3 flex items-center justify-between ${isConflict ? "!border-theater-red/40" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${isConflict ? "text-theater-red-light" : "text-theater-cream"}`}>
                        {item.date} · {getStageName(item.stageId)}
                      </div>
                      <div className="text-xs text-white/40">
                        {getTroupeName(item.troupeId)} · {item.startTime}-{item.endTime} · {item.type}
                      </div>
                    </div>
                    {isConflict && <AlertTriangle size={14} className="text-theater-red-light shrink-0" />}
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}

        {previewItems.length === 0 && (
          <div className="text-center py-12 text-white/30 text-sm">无可预览的占用记录</div>
        )}
      </div>

      {previewItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-theater-navy-dark/90 backdrop-blur-sm border-t border-white/5">
          <button className="btn-gold w-full flex items-center justify-center gap-2" onClick={handleConfirm}>
            <Sparkles size={18} /> 确认生成 {previewItems.length} 条占用
          </button>
        </div>
      )}
    </div>
  )
}
