import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { useTheaterStore } from "@/store/theaterStore"
import type { OccupancyType } from "@/types"

const DAY_OPTIONS = [
  { value: 1, label: "周一" }, { value: 2, label: "周二" }, { value: 3, label: "周三" },
  { value: 4, label: "周四" }, { value: 5, label: "周五" }, { value: 6, label: "周六" },
  { value: 0, label: "周日" },
]

const TYPE_OPTIONS: OccupancyType[] = ["排练", "演出", "装台", "拆台"]

export default function NewPeriodicRule() {
  const navigate = useNavigate()
  const { troupes, stages, addPeriodicRule } = useTheaterStore()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    troupeId: "", stageId: "", dayOfWeek: 1, startTime: "09:00", endTime: "12:00",
    occupancyType: "排练" as OccupancyType, effectiveFrom: "", effectiveTo: "", name: "",
  })

  const update = <K extends keyof typeof form>(key: K, val: typeof form[K]) =>
    setForm((p) => ({ ...p, [key]: val }))

  const canNext = () => {
    if (step === 0) return !!form.troupeId && !!form.stageId
    if (step === 1) return form.startTime < form.endTime
    return !!form.name && !!form.effectiveFrom && !!form.effectiveTo
  }

  const handleCreate = () => {
    addPeriodicRule({
      id: Date.now().toString(),
      name: form.name,
      troupeId: form.troupeId,
      stageId: form.stageId,
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime,
      endTime: form.endTime,
      effectiveFrom: form.effectiveFrom,
      effectiveTo: form.effectiveTo,
      enabled: true,
      occupancyType: form.occupancyType,
    })
    navigate(-1)
  }

  return (
    <div className="page-container">
      <h1 className="section-title mb-4">新建周期规则</h1>

      <div className="flex items-center justify-center gap-2 mb-6">
        {[0, 1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full transition-colors ${s <= step ? "bg-theater-gold" : "bg-white/20"}`} />
            {s < 2 && <div className={`w-8 h-0.5 ${s < step ? "bg-theater-gold" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>

      <motion.div key={step} initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
        {step === 0 && (
          <div className="card space-y-4">
            <h2 className="text-theater-gold font-semibold">选择剧团和舞台</h2>
            <div>
              <label className="text-sm text-white/60 mb-1 block">剧团</label>
              <select className="select-field" value={form.troupeId} onChange={(e) => update("troupeId", e.target.value)}>
                <option value="">请选择剧团</option>
                {troupes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">舞台</label>
              <select className="select-field" value={form.stageId} onChange={(e) => update("stageId", e.target.value)}>
                <option value="">请选择舞台</option>
                {stages.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="card space-y-4">
            <h2 className="text-theater-gold font-semibold">时段设置</h2>
            <div>
              <label className="text-sm text-white/60 mb-1 block">星期</label>
              <div className="grid grid-cols-4 gap-2">
                {DAY_OPTIONS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => update("dayOfWeek", d.value)}
                    className={`py-2 rounded-xl text-sm transition-colors ${form.dayOfWeek === d.value ? "bg-theater-gold text-theater-navy-dark font-semibold" : "bg-theater-navy-dark/60 text-white/60 border border-white/10"}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-white/60 mb-1 block">开始时间</label>
                <input type="time" className="input-field" value={form.startTime} onChange={(e) => update("startTime", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">结束时间</label>
                <input type="time" className="input-field" value={form.endTime} onChange={(e) => update("endTime", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">占用类型</label>
              <div className="grid grid-cols-4 gap-2">
                {TYPE_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => update("occupancyType", t)}
                    className={`py-2 rounded-xl text-sm transition-colors ${form.occupancyType === t ? "bg-theater-gold text-theater-navy-dark font-semibold" : "bg-theater-navy-dark/60 text-white/60 border border-white/10"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card space-y-4">
            <h2 className="text-theater-gold font-semibold">生效期设置</h2>
            <div>
              <label className="text-sm text-white/60 mb-1 block">规则名称</label>
              <input className="input-field" placeholder="例：周一排练" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-white/60 mb-1 block">开始日期</label>
                <input type="date" className="input-field" value={form.effectiveFrom} onChange={(e) => update("effectiveFrom", e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">结束日期</label>
                <input type="date" className="input-field" value={form.effectiveTo} onChange={(e) => update("effectiveTo", e.target.value)} />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <div className="flex justify-between mt-6">
        {step > 0 ? (
          <button className="btn-outline flex items-center gap-1" onClick={() => setStep(step - 1)}>
            <ChevronLeft size={16} /> 上一步
          </button>
        ) : <div />}

        {step < 2 ? (
          <button className="btn-gold flex items-center gap-1" disabled={!canNext()} onClick={() => setStep(step + 1)}>
            下一步 <ChevronRight size={16} />
          </button>
        ) : (
          <button className="btn-gold flex items-center gap-1" disabled={!canNext()} onClick={handleCreate}>
            <Check size={16} /> 确认创建
          </button>
        )}
      </div>
    </div>
  )
}
