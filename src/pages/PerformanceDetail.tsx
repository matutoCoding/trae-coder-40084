import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Check, X } from "lucide-react"
import { useTheaterStore } from "@/store/theaterStore"

const statusBadgeMap: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-300",
  pending: "bg-amber-500/20 text-amber-300",
  approved: "bg-green-500/20 text-green-300",
  rejected: "bg-red-500/20 text-red-300",
}

const statusLabelMap: Record<string, string> = {
  draft: "草稿",
  pending: "审批中",
  approved: "已通过",
  rejected: "已驳回",
}

export default function PerformanceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { performances, troupes, stages, approvalBranches, occupancies } = useTheaterStore()

  const perf = performances.find(p => p.id === id)
  if (!perf) return <div className="page-container text-center text-white/30 py-20">未找到演出</div>

  const troupe = troupes.find(t => t.id === perf.troupeId)
  const stage = stages.find(s => s.id === perf.stageId)
  const branch = approvalBranches.find(b => b.id === perf.approvalBranchId)
  const occupancy = occupancies.find(o => o.performanceId === perf.id)

  const getNodeStatus = (nodeIndex: number): "approved" | "current" | "pending" | "rejected" => {
    if (perf.status === "rejected") {
      const record = perf.approvalRecords.find(r => r.result === "rejected")
      if (record) {
        const rejectedIdx = branch?.nodes.findIndex(n => n.id === record.nodeId) ?? -1
        if (nodeIndex < rejectedIdx) return "approved"
        if (nodeIndex === rejectedIdx) return "rejected"
        return "pending"
      }
    }
    const record = perf.approvalRecords.find(r => branch?.nodes[nodeIndex]?.id === r.nodeId)
    if (record) return record.result
    if (nodeIndex === (perf.currentApprovalNode ?? -1)) return "current"
    return "pending"
  }

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-theater-gold" />
        </button>
        <h1 className="section-title flex-1 truncate">{perf.name}</h1>
        <span className={`badge ${statusBadgeMap[perf.status]}`}>{statusLabelMap[perf.status]}</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="card">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-white/40">剧团</span><p className="text-theater-cream">{troupe?.name ?? "-"}</p></div>
            <div><span className="text-white/40">类型</span><p className="text-theater-cream">{perf.type}</p></div>
            <div><span className="text-white/40">规模</span><p className="text-theater-cream">{perf.scale}</p></div>
            <div><span className="text-white/40">预计观众</span><p className="text-theater-cream">{perf.expectedAudience}</p></div>
            <div><span className="text-white/40">舞台</span><p className="text-theater-cream">{stage?.name ?? "-"}</p></div>
            <div><span className="text-white/40">日期</span><p className="text-theater-cream">{perf.date}</p></div>
            <div className="col-span-2"><span className="text-white/40">时间</span><p className="text-theater-cream">{perf.startTime} - {perf.endTime}</p></div>
          </div>
        </div>

        {branch && (
          <div className="card">
            <h3 className="text-theater-gold text-sm font-semibold mb-3">审批进度</h3>
            <div className="space-y-3">
              {branch.nodes.map((node, i) => {
                const status = getNodeStatus(i)
                return (
                  <div key={node.id} className="flex items-center gap-3">
                    {status === "approved" && (
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      </div>
                    )}
                    {status === "current" && (
                      <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-6 h-6 rounded-full bg-theater-gold/30 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-theater-gold" />
                      </motion.div>
                    )}
                    {status === "pending" && (
                      <div className="w-6 h-6 rounded-full bg-white/10" />
                    )}
                    {status === "rejected" && (
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <X className="w-3.5 h-3.5 text-red-400" />
                      </div>
                    )}
                    <span className={`text-sm ${
                      status === "current" ? "text-theater-gold" :
                      status === "approved" ? "text-green-300" :
                      status === "rejected" ? "text-red-300" : "text-white/40"
                    }`}>
                      {node.role}
                    </span>
                    {i < branch.nodes.length - 1 && (
                      <div className="w-px h-4 bg-white/10 ml-3 -mt-1" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {perf.status === "rejected" && perf.rejectReason && (
          <div className="card border-theater-red/30">
            <h3 className="text-theater-red text-sm font-semibold mb-1">驳回原因</h3>
            <p className="text-sm text-red-300/80">{perf.rejectReason}</p>
          </div>
        )}

        {(perf.lightingRequirements.length > 0 || perf.soundRequirements.length > 0) && (
          <div className="card">
            <h3 className="text-theater-gold text-sm font-semibold mb-3">设备需求</h3>
            {perf.lightingRequirements.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-white/40 mb-1">灯光</p>
                {perf.lightingRequirements.map(r => {
                  const eq = stage?.lightingEquipment.find(e => e.id === r.equipmentId)
                  return <p key={r.equipmentId} className="text-sm text-theater-cream">{eq?.name ?? r.equipmentId} ×{r.quantity}</p>
                })}
              </div>
            )}
            {perf.soundRequirements.length > 0 && (
              <div>
                <p className="text-xs text-white/40 mb-1">音响</p>
                {perf.soundRequirements.map(r => {
                  const eq = stage?.soundEquipment.find(e => e.id === r.equipmentId)
                  return <p key={r.equipmentId} className="text-sm text-theater-cream">{eq?.name ?? r.equipmentId} ×{r.quantity}</p>
                })}
              </div>
            )}
          </div>
        )}

        {perf.status === "approved" && occupancy && (
          <div className="card-gold">
            <h3 className="text-theater-gold text-sm font-semibold mb-2">占用信息</h3>
            <div className="text-sm text-theater-cream">
              <p>{stage?.name} · {occupancy.date}</p>
              <p>{occupancy.startTime} - {occupancy.endTime} · {occupancy.type}</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
