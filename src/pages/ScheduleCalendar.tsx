import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, X, CalendarDays, Users, MapPin, Clock, AlertTriangle, Zap } from "lucide-react"
import {
  startOfWeek,
  addWeeks,
  subWeeks,
  format,
  addDays,
  isSameDay,
  parseISO,
  isToday,
} from "date-fns"
import { zhCN } from "date-fns/locale"
import { useTheaterStore } from "@/store/theaterStore"
import type { Occupancy } from "@/types"

const DAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"]

const typeBadgeStyle: Record<string, string> = {
  "排练": "bg-blue-500/30 text-blue-300",
  "演出": "bg-theater-gold/30 text-theater-gold",
  "装台": "bg-orange-500/30 text-orange-300",
  "拆台": "bg-red-500/30 text-red-300",
}

const sourceLabel: Record<string, string> = {
  "periodic": "周期",
  "manual": "手动",
  "performance": "演出",
}

type ViewMode = "stage" | "troupe"

export default function ScheduleCalendar() {
  const navigate = useNavigate()
  const stages = useTheaterStore((s) => s.stages)
  const troupes = useTheaterStore((s) => s.troupes)
  const occupancies = useTheaterStore((s) => s.occupancies)

  const [currentWeekStart, setCurrentWeekStart] = useState(
    () => startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [viewMode, setViewMode] = useState<ViewMode>("stage")
  const [selectedStageId, setSelectedStageId] = useState<string>("all")
  const [selectedTroupeId, setSelectedTroupeId] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart]
  )

  const filteredOccupancies = useMemo(() => {
    let occs = occupancies.filter(o => !o.cancelled)
    if (viewMode === "stage" && selectedStageId !== "all") {
      occs = occs.filter((o) => o.stageId === selectedStageId)
    }
    if (viewMode === "troupe" && selectedTroupeId !== "all") {
      occs = occs.filter((o) => o.troupeId === selectedTroupeId)
    }
    return occs.filter((o) =>
      weekDays.some((d) => isSameDay(d, parseISO(o.date)))
    )
  }, [occupancies, viewMode, selectedStageId, selectedTroupeId, weekDays])

  const dayOccupancies = useMemo(() => {
    if (!selectedDate) return []
    return occupancies
      .filter(o => !o.cancelled)
      .filter(o => isSameDay(parseISO(o.date), selectedDate))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [occupancies, selectedDate])

  const getTroupeColor = (troupeId: string) =>
    troupes.find((t) => t.id === troupeId)?.color ?? "#888"

  const getTroupeName = (troupeId: string) =>
    troupes.find((t) => t.id === troupeId)?.name ?? "未知剧团"

  const getStageName = (stageId: string) =>
    stages.find((s) => s.id === stageId)?.name ?? "未知舞台"

  const occupanciesForDay = (date: Date) =>
    filteredOccupancies.filter((o) => isSameDay(date, parseISO(o.date)))

  const weekLabel = `${format(currentWeekStart, "M月d日", { locale: zhCN })} — ${format(addDays(currentWeekStart, 6), "M月d日", { locale: zhCN })}`

  const rowKeys = viewMode === "stage"
    ? stages.map(s => ({ key: s.id, name: s.name, color: "#D4A843" }))
    : troupes.map(t => ({ key: t.id, name: t.name, color: t.color }))

  const getOccDetail = (occ: Occupancy) => {
    const label = viewMode === "stage" ? getTroupeName(occ.troupeId) : getStageName(occ.stageId)
    return {
      label,
      color: getTroupeColor(occ.troupeId),
      time: `${occ.startTime}–${occ.endTime}`,
    }
  }

  return (
    <div className="page-container">
      <h1 className="text-2xl font-display font-bold text-theater-cream mb-4">
        排期日历
      </h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode("stage")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
            viewMode === "stage"
              ? "bg-theater-gold text-theater-navy-dark"
              : "bg-theater-navy-light/60 text-white/50 border border-white/5"
          }`}
        >
          <MapPin size={14} />
          按舞台
        </button>
        <button
          onClick={() => setViewMode("troupe")}
          className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
            viewMode === "troupe"
              ? "bg-theater-gold text-theater-navy-dark"
              : "bg-theater-navy-light/60 text-white/50 border border-white/5"
          }`}
        >
          <Users size={14} />
          按剧团
        </button>
      </div>

      <select
        className="select-field mb-4 text-sm"
        value={viewMode === "stage" ? selectedStageId : selectedTroupeId}
        onChange={(e) => viewMode === "stage"
          ? setSelectedStageId(e.target.value)
          : setSelectedTroupeId(e.target.value)
        }
      >
        <option value="all">全部{viewMode === "stage" ? "舞台" : "剧团"}</option>
        {viewMode === "stage"
          ? stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)
          : troupes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)
        }
      </select>

      <div className="flex items-center justify-between mb-4">
        <button
          className="p-2 rounded-lg bg-theater-navy-light/60 active:bg-theater-navy-light"
          onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
        >
          <ChevronLeft size={18} className="text-theater-gold/80" />
        </button>
        <span className="text-sm text-theater-cream/80 font-medium">
          {weekLabel}
        </span>
        <button
          className="p-2 rounded-lg bg-theater-navy-light/60 active:bg-theater-navy-light"
          onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
        >
          <ChevronRight size={18} className="text-theater-gold/80" />
        </button>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 pb-2 mb-4">
        <div style={{ minWidth: rowKeys.length > 4 ? Math.max(420, rowKeys.length * 110) : 420 }}>
          <div className="grid grid-cols-[72px_repeat(7,1fr)] gap-1">
            <div />
            {weekDays.map((day, i) => {
              const isT = isToday(day)
              return (
                <div key={i} className={`text-center py-1.5 ${isT ? "text-theater-gold" : "text-white/40"}`}>
                  <div className="text-[10px]">周{DAY_LABELS[i]}</div>
                  <div className={`text-sm font-semibold mt-0.5 ${isT ? "bg-theater-gold text-theater-navy-dark rounded-full w-7 h-7 flex items-center justify-center mx-auto" : ""}`}>
                    {format(day, "d")}
                  </div>
                </div>
              )
            })}
          </div>

          <AnimatePresence>
            {rowKeys.map(rk => (
              <motion.div
                key={rk.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-[72px_repeat(7,1fr)] gap-1 mt-1.5"
              >
                <div className="flex items-center text-xs text-white/60 pr-1 truncate">
                  <span className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0" style={{ backgroundColor: rk.color }} />
                  <span className="truncate">{rk.name}</span>
                </div>
                {weekDays.map((day, i) => {
                  const dayOccs = occupanciesForDay(day).filter(o =>
                    viewMode === "stage" ? o.stageId === rk.key : o.troupeId === rk.key
                  )
                  return (
                    <div
                      key={i}
                      className={`min-h-[60px] rounded-lg border p-1 space-y-1 cursor-pointer transition-colors ${
                        isToday(day)
                          ? "bg-theater-gold/5 border-theater-gold/20 hover:bg-theater-gold/10"
                          : "bg-white/2 border-white/5 hover:bg-white/5"
                      }`}
                      onClick={() => setSelectedDate(day)}
                    >
                      {dayOccs.slice(0, 2).map(occ => {
                        const d = getOccDetail(occ)
                        return (
                          <button
                            key={occ.id}
                            onClick={e => { e.stopPropagation(); navigate(`/schedule/occupancy/${occ.id}`) }}
                            className="w-full text-left text-[9px] p-1 rounded truncate"
                            style={{ backgroundColor: `${d.color}22`, borderLeft: `2px solid ${d.color}` }}
                          >
                            <span className="text-white/70">{d.time}</span>
                          </button>
                        )
                      })}
                      {dayOccs.length > 2 && (
                        <div className="text-[9px] text-white/30">+{dayOccs.length - 2}</div>
                      )}
                    </div>
                  )
                })}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="text-xs text-white/30 flex flex-wrap gap-3">
        <span className="flex items-center gap-1"><CalendarDays size={11} />点击日期查看完整清单</span>
        <span className="flex items-center gap-1"><Zap size={11} />点击占用块进详情</span>
      </div>

      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28 }}
              className="w-full bg-theater-navy-dark rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-display font-bold text-theater-cream">
                    {format(selectedDate, "yyyy年M月d日", { locale: zhCN })}
                  </h3>
                  <p className="text-xs text-white/40 mt-0.5">共 {dayOccupancies.length} 条占用</p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-1.5 rounded-full bg-white/5 text-white/50"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                {dayOccupancies.length === 0 && (
                  <div className="text-center text-white/30 py-10">当日无排期</div>
                )}
                {dayOccupancies.map(occ => {
                  const d = getOccDetail(occ)
                  return (
                    <motion.button
                      key={occ.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => navigate(`/schedule/occupancy/${occ.id}`)}
                      className="w-full text-left card-gold !p-3 flex items-center gap-3"
                      style={{ borderLeft: `3px solid ${d.color}` }}
                    >
                      <div className="w-16 shrink-0">
                        <div className="text-theater-gold text-sm font-semibold">{occ.startTime}</div>
                        <div className="text-white/30 text-xs">{occ.endTime}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-theater-cream text-sm font-medium truncate">
                          {viewMode === "stage" ? getTroupeName(occ.troupeId) : getStageName(occ.stageId)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`badge text-[10px] ${typeBadgeStyle[occ.type]}`}>{occ.type}</span>
                          <span className="badge bg-white/5 text-white/40 text-[10px]">{sourceLabel[occ.source]}</span>
                          {occ.isException && (
                            <span className="badge bg-amber-500/20 text-amber-400 text-[10px] flex items-center gap-0.5">
                              <AlertTriangle size={8} />已调整
                            </span>
                          )}
                          {viewMode === "troupe" && (
                            <span className="badge bg-white/5 text-white/40 text-[10px] flex items-center gap-0.5">
                              <MapPin size={8} />{getStageName(occ.stageId)}
                            </span>
                          )}
                          {viewMode === "stage" && (
                            <span className="badge bg-white/5 text-white/40 text-[10px] flex items-center gap-0.5">
                              <Users size={8} />{getTroupeName(occ.troupeId)}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20 shrink-0" />
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
