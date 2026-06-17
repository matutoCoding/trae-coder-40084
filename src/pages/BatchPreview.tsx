import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar, AlertTriangle, CheckCircle, Sparkles, ChevronLeft, ChevronRight,
  CalendarDays, BarChart3, Zap, XCircle, Check, X, Clock, MapPin, Users, Filter,
} from "lucide-react"
import { useTheaterStore } from "@/store/theaterStore"
import type { Occupancy, OccupancyType } from "@/types"
import {
  format, addDays, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval,
  addMonths, subMonths, isSameDay, parseISO, isSameMonth,
} from "date-fns"
import { zhCN } from "date-fns/locale"

const WEEK_LABELS = ["日", "一", "二", "三", "四", "五", "六"]

type CellStatus = "new" | "existing" | "skipped" | "conflict" | "performance"

interface DayRecord {
  ruleId: string
  ruleName: string
  stageId: string
  troupeId: string
  startTime: string
  endTime: string
  type: OccupancyType
  status: CellStatus
  occupancyId?: string
}

export default function BatchPreview() {
  const navigate = useNavigate()
  const { periodicRules, troupes, stages, generateFromRule, batchAddOccupancies, occupancies } = useTheaterStore()
  const [weeks, setWeeks] = useState<4 | 8 | 12>(8)
  const [success, setSuccess] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "month">("month")
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()))
  const [onlySafe, setOnlySafe] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const enabledRules = periodicRules.filter((r) => r.enabled)

  const getTroupeName = (id: string) => troupes.find((t) => t.id === id)?.name ?? "未知"
  const getStageName = (id: string) => stages.find((s) => s.id === id)?.name ?? "未知"
  const getTroupeColor = (id: string) => troupes.find((t) => t.id === id)?.color ?? "#888"

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
    const existing = [...occupancies.filter(o => !o.cancelled), ...previewItems]
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

  const dayRecords = useMemo(() => {
    const map = new Map<string, DayRecord[]>()
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })

    for (const day of days) {
      const dateStr = format(day, "yyyy-MM-dd")
      const records: DayRecord[] = []

      for (const rule of enabledRules) {
        const targetDay = addDays(startOfWeek(day, { weekStartsOn: 0 }), rule.dayOfWeek)
        if (!isSameDay(targetDay, day)) continue

        const effectiveStart = parseISO(rule.effectiveFrom)
        const effectiveEnd = parseISO(rule.effectiveTo)
        if (day < effectiveStart || day > effectiveEnd) continue

        const existingExact = occupancies.find(
          o => o.periodicRuleId === rule.id && o.date === dateStr
        )
        const dayStageOccs = occupancies.filter(
          o => !o.cancelled && o.stageId === rule.stageId && o.date === dateStr
        )
        const hasConflict = dayStageOccs.some(o => o.startTime < rule.endTime && rule.startTime < o.endTime)
        const performanceOcc = dayStageOccs.find(o => o.source === "performance")

        if (existingExact && existingExact.isException) {
          records.push({
            ruleId: rule.id, ruleName: rule.name, stageId: rule.stageId, troupeId: rule.troupeId,
            startTime: rule.startTime, endTime: rule.endTime, type: rule.occupancyType,
            status: "skipped", occupancyId: existingExact.id,
          })
        } else if (existingExact && !existingExact.isException) {
          records.push({
            ruleId: rule.id, ruleName: rule.name, stageId: rule.stageId, troupeId: rule.troupeId,
            startTime: rule.startTime, endTime: rule.endTime, type: rule.occupancyType,
            status: "existing", occupancyId: existingExact.id,
          })
        } else if (performanceOcc) {
          records.push({
            ruleId: rule.id, ruleName: rule.name, stageId: rule.stageId, troupeId: rule.troupeId,
            startTime: rule.startTime, endTime: rule.endTime, type: rule.occupancyType,
            status: "performance",
          })
        } else if (hasConflict) {
          records.push({
            ruleId: rule.id, ruleName: rule.name, stageId: rule.stageId, troupeId: rule.troupeId,
            startTime: rule.startTime, endTime: rule.endTime, type: rule.occupancyType,
            status: "conflict",
          })
        } else {
          records.push({
            ruleId: rule.id, ruleName: rule.name, stageId: rule.stageId, troupeId: rule.troupeId,
            startTime: rule.startTime, endTime: rule.endTime, type: rule.occupancyType,
            status: "new",
          })
        }
      }
      map.set(dateStr, records)
    }
    return map
  }, [currentMonth, enabledRules, occupancies])

  const monthCells = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    const firstWeekPad = start.getDay()

    const padded = Array.from({ length: firstWeekPad }, (_, i) => ({
      date: addDays(start, -firstWeekPad + i),
      records: [] as DayRecord[],
    }))

    for (const day of days) {
      padded.push({
        date: day,
        records: dayRecords.get(format(day, "yyyy-MM-dd")) ?? [],
      })
    }

    while (padded.length % 7 !== 0) {
      padded.push({ date: addDays(padded[padded.length - 1].date, 1), records: [] })
    }
    return padded
  }, [currentMonth, dayRecords])

  const monthStats = useMemo(() => {
    const stats: Record<CellStatus, number> = { new: 0, existing: 0, skipped: 0, conflict: 0, performance: 0 }
    for (const [, records] of dayRecords) {
      for (const r of records) stats[r.status]++
    }
    return stats
  }, [dayRecords])

  const statusStyle: Record<CellStatus, { bg: string; dot: string; label: string; icon: any }> = {
    new: { bg: "bg-green-500/15 border-green-500/30", dot: "bg-green-400", label: "待生成", icon: Check },
    existing: { bg: "bg-blue-500/15 border-blue-500/30", dot: "bg-blue-400", label: "已存在", icon: Calendar },
    skipped: { bg: "bg-amber-500/15 border-amber-500/30", dot: "bg-amber-400", label: "已跳过", icon: XCircle },
    conflict: { bg: "bg-red-500/15 border-red-500/30", dot: "bg-red-400", label: "冲突", icon: AlertTriangle },
    performance: { bg: "bg-theater-gold/15 border-theater-gold/40", dot: "bg-theater-gold", label: "演出占用", icon: Sparkles },
  }

  const itemsToGenerate = onlySafe
    ? previewItems.filter(i => !conflicts.has(i.id))
    : previewItems

  const handleConfirm = () => {
    batchAddOccupancies(itemsToGenerate)
    setSuccess(true)
    setTimeout(() => navigate("/schedule"), 1500)
  }

  const selectedRecords = selectedDate ? (dayRecords.get(format(selectedDate, "yyyy-MM-dd")) ?? []) : []

  if (success) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-screen">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <CheckCircle size={64} className="text-theater-gold mx-auto mb-4" />
          <p className="text-theater-cream text-lg font-semibold">成功生成 {itemsToGenerate.length} 条占用</p>
          <p className="text-white/40 text-sm mt-2">即将跳转到排期日历...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1 className="section-title mb-4">批量预览</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode("month")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 ${
            viewMode === "month" ? "bg-theater-gold text-theater-navy-dark" : "bg-theater-navy-light/60 text-white/50 border border-white/5"
          }`}
        >
          <CalendarDays size={14} />月视图
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 ${
            viewMode === "list" ? "bg-theater-gold text-theater-navy-dark" : "bg-theater-navy-light/60 text-white/50 border border-white/5"
          }`}
        >
          <BarChart3 size={14} />列表
        </button>
      </div>

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

      {viewMode === "list" && (
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
      )}

      {viewMode === "month" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <button
              className="p-2 rounded-lg bg-theater-navy-light/60"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft size={18} className="text-theater-gold/80" />
            </button>
            <span className="text-theater-cream font-semibold">
              {format(currentMonth, "yyyy年M月", { locale: zhCN })}
            </span>
            <button
              className="p-2 rounded-lg bg-theater-navy-light/60"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight size={18} className="text-theater-gold/80" />
            </button>
          </div>

          <div className="card mb-4 !p-3">
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {(["new", "existing", "skipped", "conflict", "performance"] as CellStatus[]).map(s => {
                const st = statusStyle[s]
                const Icon = st.icon
                return (
                  <div key={s} className={`rounded-lg p-2 border ${st.bg}`}>
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Icon size={11} className={st.dot.replace("bg-", "text-")} />
                      <span className="text-[10px]">{st.label}</span>
                    </div>
                    <div className={`text-base font-bold ${st.dot.replace("bg-", "text-")}`}>
                      {monthStats[s]}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card mb-4 !p-2">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-white/40 mb-1">
              {WEEK_LABELS.map(w => <div key={w} className="py-0.5">{w}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthCells.map((cell, idx) => {
                const inMonth = isSameMonth(cell.date, currentMonth)
                const isT = isSameDay(cell.date, new Date())
                return (
                  <button
                    key={idx}
                    onClick={() => inMonth && cell.records.length > 0 && setSelectedDate(cell.date)}
                    className={`aspect-square rounded-lg border p-0.5 flex flex-col ${
                      !inMonth ? "opacity-15 pointer-events-none" : cell.records.length > 0 ? "cursor-pointer hover:border-theater-gold/40" : ""
                    } ${isT ? "border-theater-gold/60" : "border-white/5"} ${
                      cell.records.length > 0 ? "bg-white/3" : "bg-transparent"
                    }`}
                  >
                    <div className={`text-[9px] text-right pr-0.5 ${isT ? "text-theater-gold font-bold" : "text-white/40"}`}>
                      {format(cell.date, "d")}
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5 overflow-hidden px-0.5 pb-0.5">
                      {cell.records.slice(0, 3).map((r, si) => (
                        <div
                          key={si}
                          title={`${r.ruleName} ${r.startTime}-${r.endTime}`}
                          className={`h-1 rounded-full ${statusStyle[r.status].dot}`}
                        />
                      ))}
                      {cell.records.length > 3 && (
                        <div className="text-[8px] text-white/40 text-center leading-none">+{cell.records.length - 3}</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5 pt-2 border-t border-white/5 text-[10px]">
              {(["new", "existing", "skipped", "conflict", "performance"] as CellStatus[]).map(s => {
                const st = statusStyle[s]
                return (
                  <div key={s} className="flex items-center gap-1 text-white/40">
                    <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                    {st.label}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28 }}
              className="w-full bg-theater-navy-dark rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-display font-bold text-theater-cream">
                    {format(selectedDate, "yyyy年M月d日", { locale: zhCN })}
                  </h3>
                  <p className="text-xs text-white/40 mt-0.5">共 {selectedRecords.length} 条候选记录</p>
                </div>
                <button onClick={() => setSelectedDate(null)} className="p-1.5 rounded-full bg-white/5 text-white/50">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                {selectedRecords.length === 0 && <div className="text-center text-white/30 py-10">当天无候选记录</div>}
                {selectedRecords.map(rec => {
                  const st = statusStyle[rec.status]
                  const Icon = st.icon
                  return (
                    <motion.div
                      key={`${rec.ruleId}-${rec.status}`}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`card !p-3 !border-l-4 ${st.bg}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: getTroupeColor(rec.troupeId) }}
                          />
                          <span className="text-theater-cream text-sm font-medium truncate">{rec.ruleName}</span>
                        </div>
                        <span className={`badge text-[10px] flex items-center gap-0.5 ${st.bg} ${st.dot.replace("bg-", "text-")}`}>
                          <Icon size={8} />{st.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/50 flex-wrap">
                        <span className="flex items-center gap-1"><Clock size={10} className="text-theater-gold/60" />{rec.startTime}–{rec.endTime}</span>
                        <span className="flex items-center gap-1"><MapPin size={10} className="text-theater-gold/60" />{getStageName(rec.stageId)}</span>
                        <span className="flex items-center gap-1"><Users size={10} className="text-theater-gold/60" />{getTroupeName(rec.troupeId)}</span>
                        <span className="badge bg-white/5 text-white/40 text-[9px]">{rec.type}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {viewMode === "list" && monthStats.conflict > 0 && (
        <div className="card border-theater-red/40 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-theater-red-light shrink-0" />
          <span className="text-theater-red-light text-sm">检测到 {monthStats.conflict} 条时间冲突</span>
        </div>
      )}

      {viewMode === "list" && (
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
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
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
          {previewItems.length === 0 && <div className="text-center py-12 text-white/30 text-sm">无可预览的占用记录</div>}
        </div>
      )}

      {previewItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-theater-navy-dark/90 backdrop-blur-sm border-t border-white/5">
          <label className="flex items-center gap-2 mb-3 text-sm text-white/60">
            <input
              type="checkbox"
              checked={onlySafe}
              onChange={e => setOnlySafe(e.target.checked)}
              className="accent-theater-gold w-4 h-4"
            />
            <Filter size={14} />
            仅生成无冲突记录（{previewItems.filter(i => !conflicts.has(i.id)).length} / {previewItems.length}）
          </label>
          <button className="btn-gold w-full flex items-center justify-center gap-2" onClick={handleConfirm}>
            <Sparkles size={18} /> 确认生成 {itemsToGenerate.length} 条占用
          </button>
        </div>
      )}
    </div>
  )
}
