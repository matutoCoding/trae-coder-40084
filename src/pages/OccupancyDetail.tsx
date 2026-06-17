import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, Calendar, Clock, MapPin, Users, Tag, AlertTriangle, Link2 } from "lucide-react"
import { useTheaterStore } from "@/store/theaterStore"
import type { OccupancyType, OccupancySource } from "@/types"

const typeLabel: Record<OccupancyType, string> = {
  "排练": "排练",
  "演出": "演出",
  "装台": "装台",
  "拆台": "拆台",
}

const typeBadgeStyle: Record<OccupancyType, string> = {
  "排练": "bg-blue-500/20 text-blue-400",
  "演出": "bg-theater-gold/20 text-theater-gold",
  "装台": "bg-orange-500/20 text-orange-400",
  "拆台": "bg-red-500/20 text-red-400",
}

const sourceLabel: Record<OccupancySource, string> = {
  periodic: "周期规则",
  manual: "手动创建",
  performance: "演出关联",
}

export default function OccupancyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const occupancies = useTheaterStore((s) => s.occupancies)
  const stages = useTheaterStore((s) => s.stages)
  const troupes = useTheaterStore((s) => s.troupes)
  const periodicRules = useTheaterStore((s) => s.periodicRules)
  const performances = useTheaterStore((s) => s.performances)

  const occ = occupancies.find((o) => o.id === id)

  if (!occ) {
    return (
      <div className="page-container flex items-center justify-center">
        <p className="text-white/50">未找到排期信息</p>
      </div>
    )
  }

  const stage = stages.find((s) => s.id === occ.stageId)
  const troupe = troupes.find((t) => t.id === occ.troupeId)
  const rule = occ.periodicRuleId
    ? periodicRules.find((r) => r.id === occ.periodicRuleId)
    : null
  const performance = occ.performanceId
    ? performances.find((p) => p.id === occ.performanceId)
    : null

  return (
    <div className="page-container">
      <button
        className="flex items-center gap-1 text-theater-gold/80 mb-4 active:text-theater-gold transition-colors"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft size={20} />
        <span className="text-sm">返回</span>
      </button>

      <div className="card-gold mb-4">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-xl font-display font-bold text-theater-cream">
            排期详情
          </h1>
          <span className={`badge ${typeBadgeStyle[occ.type]}`}>
            {typeLabel[occ.type]}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-theater-gold/70 shrink-0" />
            <span className="text-white/50 text-sm w-12 shrink-0">舞台</span>
            <span className="text-theater-cream text-sm">
              {stage?.name ?? "未知"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Users size={16} className="text-theater-gold/70 shrink-0" />
            <span className="text-white/50 text-sm w-12 shrink-0">剧团</span>
            <span className="text-theater-cream text-sm flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: troupe?.color ?? "#888" }}
              />
              {troupe?.name ?? "未知"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-theater-gold/70 shrink-0" />
            <span className="text-white/50 text-sm w-12 shrink-0">日期</span>
            <span className="text-theater-cream text-sm">{occ.date}</span>
          </div>

          <div className="flex items-center gap-3">
            <Clock size={16} className="text-theater-gold/70 shrink-0" />
            <span className="text-white/50 text-sm w-12 shrink-0">时间</span>
            <span className="text-theater-cream text-sm">
              {occ.startTime} – {occ.endTime}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Tag size={16} className="text-theater-gold/70 shrink-0" />
            <span className="text-white/50 text-sm w-12 shrink-0">来源</span>
            <span className="text-theater-cream text-sm">
              {sourceLabel[occ.source]}
            </span>
          </div>
        </div>
      </div>

      {occ.source === "periodic" && rule && (
        <div className="card mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge bg-purple-500/20 text-purple-300">
              来自周期规则
            </span>
          </div>
          <p className="text-theater-cream text-sm mt-2">{rule.name}</p>
          <p className="text-white/40 text-xs mt-1">
            有效期 {rule.effectiveFrom} 至 {rule.effectiveTo}
          </p>
        </div>
      )}

      {occ.isException && (
        <div className="card border border-theater-red/30 mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-theater-red-light shrink-0" />
          <span className="badge bg-theater-red/20 text-theater-red-light">
            已例外调整
          </span>
        </div>
      )}

      {performance && (
        <div className="card mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Link2 size={14} className="text-theater-gold/70" />
            <span className="text-white/50 text-sm">关联演出</span>
          </div>
          <p className="text-theater-cream text-sm font-medium">
            {performance.name}
          </p>
          <p className="text-white/40 text-xs mt-1">
            {performance.date} {performance.startTime}–{performance.endTime}
          </p>
        </div>
      )}

      {occ.remark && (
        <div className="card mb-3">
          <span className="text-white/50 text-sm">备注</span>
          <p className="text-theater-cream/80 text-sm mt-1">{occ.remark}</p>
        </div>
      )}

      {occ.source === "periodic" && (
        <button
          className="btn-outline w-full mt-2 text-sm"
          onClick={() => navigate(`/periodic/exception/${occ.id}`)}
        >
          例外调整
        </button>
      )}
    </div>
  )
}
