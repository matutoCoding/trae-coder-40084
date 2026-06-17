import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, XCircle, RotateCcw } from "lucide-react"
import { useTheaterStore } from "@/store/theaterStore"

export default function ExceptionAdjust() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { occupancies, stages, troupes, periodicRules, updateOccupancy, deleteOccupancy } = useTheaterStore()

  const occupancy = occupancies.find((o) => o.id === id)

  const [form, setForm] = useState({
    date: occupancy?.date ?? "",
    startTime: occupancy?.startTime ?? "",
    endTime: occupancy?.endTime ?? "",
    stageId: occupancy?.stageId ?? "",
  })

  if (!occupancy) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-screen">
        <p className="text-white/40">未找到该占用记录</p>
        <button className="btn-outline mt-4" onClick={() => navigate(-1)}>返回</button>
      </div>
    )
  }

  const troupe = troupes.find((t) => t.id === occupancy.troupeId)
  const stage = stages.find((s) => s.id === occupancy.stageId)
  const rule = periodicRules.find((r) => r.id === occupancy.periodicRuleId)

  const update = <K extends keyof typeof form>(key: K, val: typeof form[K]) =>
    setForm((p) => ({ ...p, [key]: val }))

  const handleCancel = () => {
    updateOccupancy(occupancy.id, { isException: true, cancelled: true })
    navigate(-1)
  }

  const handleSave = () => {
    updateOccupancy(occupancy.id, {
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      stageId: form.stageId,
      isException: true,
    })
    navigate(-1)
  }

  const handleReset = () => {
    updateOccupancy(occupancy.id, { isException: false, cancelled: false })
    navigate(-1)
  }

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="text-theater-gold">
          <ArrowLeft size={24} />
        </button>
        <h1 className="section-title">异常调整</h1>
        {occupancy.isException && <span className="badge bg-theater-red/20 text-theater-red-light">已标记异常</span>}
      </div>

      <div className="card-gold mb-4">
        <h2 className="text-theater-gold font-semibold mb-3 text-sm">原始占用信息</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/50">日期</span>
            <span className="text-theater-cream">{occupancy.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">时段</span>
            <span className="text-theater-cream">{occupancy.startTime} - {occupancy.endTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">舞台</span>
            <span className="text-theater-cream">{stage?.name ?? "未知"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">剧团</span>
            <span className="text-theater-cream">{troupe?.name ?? "未知"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">占用类型</span>
            <span className="text-theater-cream">{occupancy.type}</span>
          </div>
          {rule && (
            <div className="flex justify-between">
              <span className="text-white/50">来源规则</span>
              <span className="text-theater-cream">{rule.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-theater-gold font-semibold text-sm">调整信息</h2>
        <div>
          <label className="text-sm text-white/60 mb-1 block">新日期</label>
          <input type="date" className="input-field" value={form.date} onChange={(e) => update("date", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-white/60 mb-1 block">新开始时间</label>
            <input type="time" className="input-field" value={form.startTime} onChange={(e) => update("startTime", e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">新结束时间</label>
            <input type="time" className="input-field" value={form.endTime} onChange={(e) => update("endTime", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-sm text-white/60 mb-1 block">新舞台</label>
          <select className="select-field" value={form.stageId} onChange={(e) => update("stageId", e.target.value)}>
            <option value="">请选择舞台</option>
            {stages.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3 mt-6">
        <button className="btn-gold w-full flex items-center justify-center gap-2" onClick={handleSave}>
          <Save size={18} /> 保存调整
        </button>
        <button className="btn-danger w-full flex items-center justify-center gap-2" onClick={handleCancel}>
          <XCircle size={18} /> 标记取消
        </button>
        {occupancy.isException && (
          <button className="btn-outline w-full flex items-center justify-center gap-2" onClick={handleReset}>
            <RotateCcw size={18} /> 返回原样
          </button>
        )}
      </div>
    </div>
  )
}
