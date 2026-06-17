import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronLeft, Users, Zap, Volume2, ChevronDown, ChevronUp } from "lucide-react"
import { useTheaterStore } from "@/store/theaterStore"
import type { EquipmentItem, StageType } from "@/types"

const typeBadgeColor: Record<StageType, string> = {
  "大剧场": "bg-theater-gold/20 text-theater-gold",
  "小剧场": "bg-blue-500/20 text-blue-400",
  "实验剧场": "bg-purple-500/20 text-purple-400",
  "露天舞台": "bg-green-500/20 text-green-400",
}

function EquipmentSection({
  title,
  items,
  icon,
  defaultOpen = true,
}: {
  title: string
  items: EquipmentItem[]
  icon: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="mt-4">
      <button
        className="flex items-center justify-between w-full"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="section-title">{title}</span>
          <span className="badge bg-white/10 text-white/50">{items.length} 项</span>
        </div>
        {open ? (
          <ChevronUp size={18} className="text-white/40" />
        ) : (
          <ChevronDown size={18} className="text-white/40" />
        )}
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {items.map((eq) => (
            <div
              key={eq.id}
              className="card border-l-2 border-l-theater-gold/60 flex items-center justify-between"
            >
              <div>
                <div className="text-theater-cream font-medium text-sm">
                  {eq.name}
                </div>
                <div className="text-white/40 text-xs mt-0.5">{eq.spec}</div>
              </div>
              <div className="text-theater-gold font-semibold text-sm">
                ×{eq.quantity}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function StageDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const stages = useTheaterStore((s) => s.stages)
  const updateStage = useTheaterStore((s) => s.updateStage)
  const stage = stages.find((s) => s.id === id)

  const totalLighting = stage?.lightingEquipment.reduce((s, e) => s + e.quantity, 0) ?? 0
  const totalSound = stage?.soundEquipment.reduce((s, e) => s + e.quantity, 0) ?? 0

  if (!stage) {
    return (
      <div className="page-container flex items-center justify-center">
        <p className="text-white/50">未找到舞台信息</p>
      </div>
    )
  }

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
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-2xl font-display font-bold text-theater-cream">
            {stage.name}
          </h1>
          <span className={`badge ${typeBadgeColor[stage.type]}`}>
            {stage.type}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm mb-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-white/60">
            <Users size={14} className="text-theater-gold/70" />
            {stage.seatCount} 座
          </span>
          <span className="flex items-center gap-1.5 text-yellow-300/90">
            <Zap size={14} className="text-yellow-400/80" />
            灯光 {totalLighting} 台
          </span>
          <span className="flex items-center gap-1.5 text-blue-300/90">
            <Volume2 size={14} className="text-blue-400/80" />
            音响 {totalSound} 台
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-theater-navy-dark/50 rounded-xl p-2.5 text-center">
            <div className="text-xs text-white/40">座位数</div>
            <div className="text-lg font-bold text-theater-cream mt-0.5">{stage.seatCount}</div>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-2.5 text-center">
            <div className="text-xs text-yellow-300/60">灯光设备</div>
            <div className="text-lg font-bold text-yellow-300 mt-0.5">{totalLighting}</div>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-2.5 text-center">
            <div className="text-xs text-blue-300/60">音响设备</div>
            <div className="text-lg font-bold text-blue-300 mt-0.5">{totalSound}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-white/50">舞台状态</span>
          <button
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              stage.status === "active" ? "bg-theater-gold" : "bg-white/20"
            }`}
            onClick={() =>
              updateStage(stage.id, {
                status: stage.status === "active" ? "inactive" : "active",
              })
            }
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                stage.status === "active" ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      <EquipmentSection
        title="灯光设备"
        items={stage.lightingEquipment}
        icon={<Zap size={18} className="text-yellow-400/80" />}
      />
      <EquipmentSection
        title="音响设备"
        items={stage.soundEquipment}
        icon={<Volume2 size={18} className="text-blue-400/80" />}
      />
    </div>
  )
}
