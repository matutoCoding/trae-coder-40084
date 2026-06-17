import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft, Users, Zap, Volume2, ChevronDown, ChevronUp,
  Plus, Pencil, Trash2, X, Check,
} from "lucide-react"
import { useTheaterStore } from "@/store/theaterStore"
import type { EquipmentItem, StageType, EquipmentCategory } from "@/types"

const typeBadgeColor: Record<StageType, string> = {
  "大剧场": "bg-theater-gold/20 text-theater-gold",
  "小剧场": "bg-blue-500/20 text-blue-400",
  "实验剧场": "bg-purple-500/20 text-purple-400",
  "露天舞台": "bg-green-500/20 text-green-400",
}

interface EquipmentFormState {
  id?: string
  name: string
  spec: string
  quantity: number
}

function EquipmentSection({
  title,
  category,
  items,
  icon,
  stageId,
  accentClass,
  defaultOpen = true,
}: {
  title: string
  category: EquipmentCategory
  items: EquipmentItem[]
  icon: React.ReactNode
  stageId: string
  accentClass: string
  defaultOpen?: boolean
}) {
  const { addEquipment, updateEquipment, deleteEquipment } = useTheaterStore()
  const [open, setOpen] = useState(defaultOpen)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EquipmentFormState>({ name: "", spec: "", quantity: 1 })

  const openNew = () => {
    setEditingId(null)
    setForm({ name: "", spec: "", quantity: 1 })
    setShowForm(true)
  }

  const openEdit = (eq: EquipmentItem) => {
    setEditingId(eq.id)
    setForm({ id: eq.id, name: eq.name, spec: eq.spec, quantity: eq.quantity })
    setShowForm(true)
  }

  const handleSubmit = () => {
    if (!form.name.trim() || form.quantity < 1) return
    if (editingId) {
      updateEquipment(stageId, editingId, { name: form.name, spec: form.spec, quantity: form.quantity })
    } else {
      addEquipment(stageId, category, { name: form.name, spec: form.spec || "基础配置", quantity: form.quantity })
    }
    setShowForm(false)
    setEditingId(null)
    setForm({ name: "", spec: "", quantity: 1 })
  }

  const handleDelete = (id: string) => {
    if (confirm("确定要删除此设备吗？")) deleteEquipment(stageId, id)
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2"
          onClick={() => setOpen(!open)}
        >
          {icon}
          <span className="section-title">{title}</span>
          <span className="badge bg-white/10 text-white/50">{items.length} 项</span>
          {open ? (
            <ChevronUp size={18} className="text-white/40" />
          ) : (
            <ChevronDown size={18} className="text-white/40" />
          )}
        </button>
        <button
          onClick={openNew}
          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${accentClass}`}
        >
          <Plus size={13} />新增
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="card !border-l-4 !p-3"
                    style={{ borderLeftColor: category === "灯光" ? "#fbbf24" : "#60a5fa" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-theater-cream">
                        {editingId ? "编辑设备" : "新增设备"}
                      </span>
                      <button onClick={() => { setShowForm(false); setEditingId(null) }} className="text-white/40 hover:text-white">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <input
                        className="input-field text-sm"
                        placeholder="设备名称（如聚光灯、主扩音箱）"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                      />
                      <input
                        className="input-field text-sm"
                        placeholder="规格型号（可选）"
                        value={form.spec}
                        onChange={e => setForm({ ...form, spec: e.target.value })}
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-white/40">数量</label>
                        <input
                          type="number" min={1}
                          className="input-field text-sm !w-24"
                          value={form.quantity}
                          onChange={e => setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })}
                        />
                        <button onClick={handleSubmit} className="btn-gold !py-2 !px-4 text-sm flex items-center gap-1 ml-auto">
                          <Check size={13} />{editingId ? "保存" : "添加"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {items.length === 0 && !showForm && (
                <div className="text-center text-white/30 py-6 text-sm">暂无{title}，点击右上方"新增"添加</div>
              )}

              {items.map((eq) => (
                <motion.div
                  key={eq.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card border-l-2 flex items-center justify-between !p-3"
                  style={{ borderLeftColor: category === "灯光" ? "#fbbf24" : "#60a5fa" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-theater-cream font-medium text-sm">{eq.name}</div>
                    {eq.spec && <div className="text-white/40 text-xs mt-0.5">{eq.spec}</div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`font-semibold text-sm ${category === "灯光" ? "text-yellow-300" : "text-blue-300"}`}>
                      ×{eq.quantity}
                    </div>
                    <button onClick={() => openEdit(eq)} className="text-white/30 hover:text-theater-gold">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(eq.id)} className="text-white/30 hover:text-theater-red-light">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
        category="灯光"
        items={stage.lightingEquipment}
        icon={<Zap size={18} className="text-yellow-400/80" />}
        stageId={stage.id}
        accentClass="bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/25"
      />
      <EquipmentSection
        title="音响设备"
        category="音响"
        items={stage.soundEquipment}
        icon={<Volume2 size={18} className="text-blue-400/80" />}
        stageId={stage.id}
        accentClass="bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25"
      />
    </div>
  )
}
