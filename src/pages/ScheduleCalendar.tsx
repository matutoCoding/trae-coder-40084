import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  startOfWeek,
  addWeeks,
  subWeeks,
  format,
  addDays,
  isSameDay,
  parseISO,
} from "date-fns"
import { zhCN } from "date-fns/locale"
import { useTheaterStore } from "@/store/theaterStore"

const DAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"]

const typeBadgeStyle: Record<string, string> = {
  "排练": "bg-blue-500/30 text-blue-300",
  "演出": "bg-theater-gold/30 text-theater-gold",
  "装台": "bg-orange-500/30 text-orange-300",
  "拆台": "bg-red-500/30 text-red-300",
}

export default function ScheduleCalendar() {
  const navigate = useNavigate()
  const stages = useTheaterStore((s) => s.stages)
  const troupes = useTheaterStore((s) => s.troupes)
  const occupancies = useTheaterStore((s) => s.occupancies)

  const [currentWeekStart, setCurrentWeekStart] = useState(
    () => startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [selectedStageId, setSelectedStageId] = useState<string>("all")

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart]
  )

  const filteredOccupancies = useMemo(() => {
    let occs = occupancies
    if (selectedStageId !== "all") {
      occs = occs.filter((o) => o.stageId === selectedStageId)
    }
    return occs.filter((o) =>
      weekDays.some((d) => isSameDay(d, parseISO(o.date)))
    )
  }, [occupancies, selectedStageId, weekDays])

  const getTroupeColor = (troupeId: string) =>
    troupes.find((t) => t.id === troupeId)?.color ?? "#888"

  const getTroupeName = (troupeId: string) =>
    troupes.find((t) => t.id === troupeId)?.name ?? "未知剧团"

  const occupanciesForDay = (date: Date) =>
    filteredOccupancies.filter((o) => isSameDay(date, parseISO(o.date)))

  const weekLabel = `${format(currentWeekStart, "M月d日", { locale: zhCN })} — ${format(addDays(currentWeekStart, 6), "M月d日", { locale: zhCN })}`

  return (
    <div className="page-container">
      <h1 className="text-2xl font-display font-bold text-theater-cream mb-4">
        排期日历
      </h1>

      <select
        className="select-field mb-4 text-sm"
        value={selectedStageId}
        onChange={(e) => setSelectedStageId(e.target.value)}
      >
        <option value="all">全部舞台</option>
        {stages.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
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

      <div className="overflow-x-auto -mx-4 px-4 pb-2">
        <div className="flex gap-1.5" style={{ minWidth: 700 }}>
          {weekDays.map((day, i) => {
            const dayOccs = occupanciesForDay(day)
            const isToday = isSameDay(day, new Date())
            return (
              <div key={i} className="flex-1 min-w-[96px]">
                <div
                  className={`text-center mb-2 pb-1.5 ${
                    isToday
                      ? "text-theater-gold"
                      : "text-white/50"
                  }`}
                >
                  <div className="text-xs">周{DAY_LABELS[i]}</div>
                  <div className={`text-sm font-semibold ${isToday ? "bg-theater-gold text-theater-navy-dark rounded-full w-7 h-7 flex items-center justify-center mx-auto" : ""}`}>
                    {format(day, "d")}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {dayOccs.map((occ) => (
                    <button
                      key={occ.id}
                      className="w-full text-left rounded-lg p-2 transition-transform active:scale-95"
                      style={{
                        backgroundColor: `${getTroupeColor(occ.troupeId)}22`,
                        borderLeft: `3px solid ${getTroupeColor(occ.troupeId)}`,
                      }}
                      onClick={() => navigate(`/schedule/occupancy/${occ.id}`)}
                    >
                      <div className="text-xs font-medium text-theater-cream truncate">
                        {getTroupeName(occ.troupeId)}
                      </div>
                      <div className="text-[10px] text-white/50 mt-0.5">
                        {occ.startTime}–{occ.endTime}
                      </div>
                      <span className={`badge text-[10px] mt-1 ${typeBadgeStyle[occ.type]}`}>
                        {occ.type}
                      </span>
                    </button>
                  ))}
                  {dayOccs.length === 0 && (
                    <div className="text-center text-white/20 text-[10px] py-4">
                      无排期
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
