import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Plus, Users, Zap, Volume2 } from "lucide-react"
import { useTheaterStore } from "@/store/theaterStore"
import type { StageType } from "@/types"

const typeBadgeColor: Record<StageType, string> = {
  "大剧场": "bg-theater-gold/20 text-theater-gold",
  "小剧场": "bg-blue-500/20 text-blue-400",
  "实验剧场": "bg-purple-500/20 text-purple-400",
  "露天舞台": "bg-green-500/20 text-green-400",
}

export default function StageList() {
  const navigate = useNavigate()
  const stages = useTheaterStore((s) => s.stages)

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-theater-cream">
          舞台管理
        </h1>
        <button
          className="btn-gold flex items-center gap-1.5 text-sm"
          onClick={() => alert("新建舞台功能即将上线")}
        >
          <Plus size={16} />
          新建舞台
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {stages.map((stage, i) => {
          const totalLighting = stage.lightingEquipment.reduce((s, e) => s + e.quantity, 0)
          const totalSound = stage.soundEquipment.reduce((s, e) => s + e.quantity, 0)
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="card-gold cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => navigate(`/stages/${stage.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-display font-bold text-theater-cream">
                  {stage.name}
                </h2>
                <span className={`badge ${typeBadgeColor[stage.type]}`}>
                  {stage.type}
                </span>
              </div>
              <div className="flex items-center gap-5 text-sm text-white/60">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-theater-gold/70" />
                  {stage.seatCount} 座
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap size={14} className="text-yellow-400/70" />
                  灯光 {totalLighting}
                </span>
                <span className="flex items-center gap-1.5">
                  <Volume2 size={14} className="text-blue-400/70" />
                  音响 {totalSound}
                </span>
              </div>
              {stage.status === "inactive" && (
                <div className="mt-2">
                  <span className="badge bg-theater-red/20 text-theater-red-light">
                    已停用
                  </span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
