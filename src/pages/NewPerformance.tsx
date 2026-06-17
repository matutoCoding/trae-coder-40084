import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import { useTheaterStore } from "@/store/theaterStore"
import type { PerformanceType, PerformanceScale, Performance, EquipmentRequirement } from "@/types"

const perfTypes: PerformanceType[] = ["话剧", "音乐剧", "舞蹈", "音乐会", "戏曲", "其他"]
const perfScales: PerformanceScale[] = ["小型", "中型", "大型", "特大型"]

export default function NewPerformance() {
  const navigate = useNavigate()
  const { stages, troupes, addPerformance, matchApprovalBranch, addOccupancy } = useTheaterStore()

  const [name, setName] = useState("")
  const [troupeId, setTroupeId] = useState("")
  const [type, setType] = useState<PerformanceType>("话剧")
  const [scale, setScale] = useState<PerformanceScale>("中型")
  const [expectedAudience, setExpectedAudience] = useState(100)
  const [stageId, setStageId] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("19:00")
  const [endTime, setEndTime] = useState("22:00")
  const [lightingReqs, setLightingReqs] = useState<EquipmentRequirement[]>([])
  const [soundReqs, setSoundReqs] = useState<EquipmentRequirement[]>([])
  const [expandLighting, setExpandLighting] = useState(false)
  const [expandSound, setExpandSound] = useState(false)

  const selectedStage = stages.find(s => s.id === stageId)

  const previewPerf: Performance = {
    id: "", name, troupeId, stageId, type, date, startTime, endTime,
    scale, expectedAudience, status: "pending",
    lightingRequirements: lightingReqs, soundRequirements: soundReqs,
    approvalRecords: [],
  }
  const matchedBranch = name && troupeId && stageId && date
    ? matchApprovalBranch(previewPerf)
    : undefined

  const toggleEquip = (
    list: EquipmentRequirement[], setList: (v: EquipmentRequirement[]) => void,
    eqId: string, checked: boolean
  ) => {
    if (checked) {
      setList([...list, { equipmentId: eqId, quantity: 1 }])
    } else {
      setList(list.filter(r => r.equipmentId !== eqId))
    }
  }

  const updateQty = (
    list: EquipmentRequirement[], setList: (v: EquipmentRequirement[]) => void,
    eqId: string, qty: number
  ) => {
    setList(list.map(r => r.equipmentId === eqId ? { ...r, quantity: qty } : r))
  }

  const handleSubmit = (status: "draft" | "pending") => {
    const id = `perf-${Date.now()}`
    addPerformance({
      ...previewPerf, id, status,
      approvalBranchId: status === "pending" ? matchedBranch?.id : undefined,
      currentApprovalNode: status === "pending" ? 0 : undefined,
    })
    if (status === "pending") {
      addOccupancy({
        id: `occ-${Date.now()}`, stageId, troupeId, date, startTime, endTime,
        type: "演出", source: "performance", isException: false, performanceId: id,
      })
    }
    navigate(`/performances/${id}`)
  }

  const isValid = !!(name && troupeId && stageId && date && startTime && endTime)

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-theater-gold" />
        </button>
        <h1 className="section-title">新建演出</h1>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-theater-gold text-sm font-semibold mb-3">基本信息</h2>
          <div className="space-y-3">
            <input className="input-field" placeholder="演出名称" value={name} onChange={e => setName(e.target.value)} />
            <select className="select-field" value={troupeId} onChange={e => setTroupeId(e.target.value)}>
              <option value="">选择剧团</option>
              {troupes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select className="select-field" value={type} onChange={e => setType(e.target.value as PerformanceType)}>
              {perfTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="select-field" value={scale} onChange={e => setScale(e.target.value as PerformanceScale)}>
              {perfScales.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="number" className="input-field" placeholder="预计观众" value={expectedAudience} onChange={e => setExpectedAudience(Number(e.target.value))} />
          </div>
        </section>

        <section>
          <h2 className="text-theater-gold text-sm font-semibold mb-3">演出安排</h2>
          <div className="space-y-3">
            <select className="select-field" value={stageId} onChange={e => { setStageId(e.target.value); setLightingReqs([]); setSoundReqs([]) }}>
              <option value="">选择舞台</option>
              {stages.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
            </select>
            <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} />
            <div className="flex gap-3">
              <input type="time" className="input-field" value={startTime} onChange={e => setStartTime(e.target.value)} />
              <input type="time" className="input-field" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
        </section>

        {selectedStage && (
          <section>
            <h2 className="text-theater-gold text-sm font-semibold mb-3">灯光音响需求</h2>
            {([
              { label: "灯光设备", items: selectedStage.lightingEquipment, reqs: lightingReqs, setReqs: setLightingReqs, expanded: expandLighting, toggle: () => setExpandLighting(!expandLighting) },
              { label: "音响设备", items: selectedStage.soundEquipment, reqs: soundReqs, setReqs: setSoundReqs, expanded: expandSound, toggle: () => setExpandSound(!expandSound) },
            ] as const).map(({ label, items, reqs, setReqs, expanded, toggle }) => (
              <div key={label} className="mb-3">
                <button onClick={toggle} className="flex items-center gap-2 text-theater-cream text-sm mb-2">
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {label}
                </button>
                {expanded && (
                  <div className="space-y-2">
                    {items.map(eq => {
                      const req = reqs.find(r => r.equipmentId === eq.id)
                      return (
                        <div key={eq.id} className="flex items-center gap-2 card !py-2">
                          <input type="checkbox" checked={!!req} onChange={e => toggleEquip(reqs, setReqs, eq.id, e.target.checked)} className="accent-theater-gold" />
                          <span className="text-sm text-theater-cream flex-1">{eq.name} <span className="text-white/40">{eq.spec}</span></span>
                          {req && (
                            <input type="number" min={1} max={eq.quantity} value={req.quantity}
                              onChange={e => updateQty(reqs, setReqs, eq.id, Number(e.target.value))}
                              className="w-14 bg-theater-navy-dark/60 border border-white/10 rounded-lg px-2 py-1 text-sm text-theater-cream text-center" />
                          )}
                          <span className="text-xs text-white/30">/{eq.quantity}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {matchedBranch && (
          <section>
            <h2 className="text-theater-gold text-sm font-semibold mb-3">审批预览</h2>
            <div className="card-gold">
              <p className="text-theater-cream text-sm mb-2">{matchedBranch.name}</p>
              <div className="flex items-center gap-1 flex-wrap">
                {matchedBranch.nodes.map((node, i) => (
                  <span key={node.id} className="text-xs text-white/50">
                    {i > 0 && <span className="mr-1">→</span>}
                    {node.role}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="flex gap-3 pt-4">
          <button onClick={() => handleSubmit("draft")} className="btn-outline flex-1" disabled={!name}>保存草稿</button>
          <button onClick={() => handleSubmit("pending")} className="btn-gold flex-1" disabled={!isValid}>提交审批</button>
        </div>
      </div>
    </div>
  )
}
