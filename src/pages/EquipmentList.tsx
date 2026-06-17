import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Zap, Volume2, Search, Users, MapPin } from "lucide-react"
import { useTheaterStore } from "@/store/theaterStore"
import type { EquipmentItem, EquipmentCategory } from "@/types"

interface EquipmentWithStage extends EquipmentItem {
  stageName: string
}

export default function EquipmentList() {
  const navigate = useNavigate()
  const stages = useTheaterStore(s => s.stages)
  const [category, setCategory] = useState<"all" | EquipmentCategory>("all")
  const [keyword, setKeyword] = useState("")

  const allEquipment: EquipmentWithStage[] = useMemo(() => {
    const list: EquipmentWithStage[] = []
    for (const stage of stages) {
      for (const eq of stage.lightingEquipment) list.push({ ...eq, stageName: stage.name })
      for (const eq of stage.soundEquipment) list.push({ ...eq, stageName: stage.name })
    }
    return list
  }, [stages])

  const filtered = useMemo(() => {
    let list = allEquipment
    if (category !== "all") list = list.filter(e => e.category === category)
    if (keyword.trim()) {
      const k = keyword.trim().toLowerCase()
      list = list.filter(e =>
        e.name.toLowerCase().includes(k) ||
        e.spec.toLowerCase().includes(k) ||
        e.stageName.toLowerCase().includes(k)
      )
    }
    return list.sort((a, b) => a.stageName.localeCompare(b.stageName) || a.name.localeCompare(b.name))
  }, [allEquipment, category, keyword])

  const totalQty = filtered.reduce((s, e) => s + e.quantity, 0)

  return (
    <div className="page-container">
      <h1 className="text-2xl font-display font-bold text-theater-cream mb-4">
        设备清单
      </h1>

      <div className="card mb-4 !p-3">
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            className="input-field !pl-9 text-sm"
            placeholder="搜索设备名称、规格或舞台..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["all", "灯光", "音响"] as const).map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 ${
                category === c
                  ? "bg-theater-gold text-theater-navy-dark font-semibold"
                  : "bg-theater-navy-dark/60 text-white/50 border border-white/5"
              }`}
            >
              {c === "all" ? <Users size={11} /> : c === "灯光" ? <Zap size={11} /> : <Volume2 size={11} />}
              {c === "all" ? "全部" : c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs text-white/40">共 {filtered.length} 种设备，合计 {totalQty} 台</span>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center text-white/30 py-12 text-sm">无匹配设备</div>
        )}
        {filtered.map((eq, i) => (
          <motion.button
            key={eq.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            onClick={() => navigate(`/stages/${eq.stageId}`)}
            className={`w-full text-left card !p-3 !border-l-4 ${
              eq.category === "灯光" ? "border-l-yellow-400" : "border-l-blue-400"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {eq.category === "灯光"
                    ? <Zap size={12} className="text-yellow-400/70" />
                    : <Volume2 size={12} className="text-blue-400/70" />
                  }
                  <span className="text-theater-cream font-medium text-sm">{eq.name}</span>
                  <span className={`badge text-[10px] ${
                    eq.category === "灯光" ? "bg-yellow-500/20 text-yellow-300" : "bg-blue-500/20 text-blue-300"
                  }`}>
                    {eq.category}
                  </span>
                </div>
                {eq.spec && <div className="text-xs text-white/40 mt-1">{eq.spec}</div>}
                <div className="text-xs text-white/40 mt-1 flex items-center gap-1">
                  <MapPin size={10} />{eq.stageName}
                </div>
              </div>
              <div className={`font-bold text-base ${eq.category === "灯光" ? "text-yellow-300" : "text-blue-300"}`}>
                ×{eq.quantity}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
