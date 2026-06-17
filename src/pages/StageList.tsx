import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Users, Zap, Volume2, X, ChevronDown } from "lucide-react"
import { useTheaterStore } from "@/store/theaterStore"
import type { StageType } from "@/types"

const typeBadgeColor: Record<StageType, string> = {
  "大剧场": "bg-theater-gold/20 text-theater-gold",
  "小剧场": "bg-blue-500/20 text-blue-400",
  "实验剧场": "bg-purple-500/20 text-purple-400",
  "露天舞台": "bg-green-500/20 text-green-400",
}

const stageTypes: StageType[] = ["大剧场", "小剧场", "实验剧场", "露天舞台"]

export default function StageList() {
  const navigate = useNavigate()
  const stages = useTheaterStore((s) => s.stages)
  const addStage = useTheaterStore((s) => s.addStage)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<StageType>("小剧场")
  const [seatCount, setSeatCount] = useState(200)
  const [lightingCount, setLightingCount] = useState(20)
  const [soundCount, setSoundCount] = useState(12)
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)

  const submit = () => {
    if (!name.trim()) return
    const now = Date.now()
    const stageId = `stage-${now}`
    const lightingEquipment = [{
      id: `el-new-${now}-0`, name: "灯光设备", category: "灯光" as const,
      spec: "基础配置", quantity: lightingCount, stageId,
    }]
    const soundEquipment = [{
      id: `es-new-${now}-0`, name: "音响设备", category: "音响" as const,
      spec: "基础配置", quantity: soundCount, stageId,
    }]
    addStage({
      id: `stage-${now}`,
      name,
      type,
      seatCount,
      status: "active",
      lightingEquipment,
      soundEquipment,
    })
    setShowForm(false)
    setName("")
    setSeatCount(200)
    setLightingCount(20)
    setSoundCount(12)
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-theater-cream">
          舞台管理
        </h1>
        <button
          className="btn-gold flex items-center gap-1.5 text-sm"
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} />
          新建舞台
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card-gold mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-theater-cream">新建舞台</h2>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/40 mb-1 block">舞台名称</label>
                <input
                  className="input-field"
                  placeholder="请输入舞台名称"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-white/40 mb-1 block">舞台类型</label>
                <div className="relative">
                  <button
                    onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                    className="select-field w-full text-left flex items-center justify-between"
                  >
                    {type}
                    <ChevronDown className="w-4 h-4 text-white/40" />
                  </button>
                  <AnimatePresence>
                    {typeDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute z-20 w-full mt-1 bg-theater-navy-dark border border-white/10 rounded-xl overflow-hidden"
                      >
                        {stageTypes.map((t) => (
                          <button
                            key={t}
                            onClick={() => { setType(t); setTypeDropdownOpen(false) }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-white/5 ${type === t ? "text-theater-gold" : "text-theater-cream"}`}
                          >
                            {t}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">座位数</label>
                  <input
                    type="number"
                    className="input-field"
                    value={seatCount}
                    onChange={(e) => setSeatCount(Math.max(1, Number(e.target.value)))}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">灯光设备数</label>
                  <input
                    type="number"
                    className="input-field"
                    value={lightingCount}
                    onChange={(e) => setLightingCount(Math.max(0, Number(e.target.value)))}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">音响设备数</label>
                  <input
                    type="number"
                    className="input-field"
                    value={soundCount}
                    onChange={(e) => setSoundCount(Math.max(0, Number(e.target.value)))}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button className="btn-outline text-sm" onClick={() => setShowForm(false)}>
                  取消
                </button>
                <button className="btn-gold text-sm" onClick={submit}>
                  确认创建
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
