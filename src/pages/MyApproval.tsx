import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTheaterStore } from "@/store/theaterStore"
import { Check, X, Clock, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const CURRENT_ROLE = "剧场主管"

export default function MyApproval() {
  const navigate = useNavigate()
  const { performances, approvalBranches, troupes, approvePerformanceNode, rejectPerformanceNode } = useTheaterStore()
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const getBranch = (id?: string) => approvalBranches.find((b) => b.id === id)
  const getTroupe = (id: string) => troupes.find((t) => t.id === id)?.name || "未知"

  const pendingItems = performances.filter((p) => {
    if (p.status !== "pending") return false
    const branch = getBranch(p.approvalBranchId)
    if (!branch) return false
    const currentNode = branch.nodes[p.currentApprovalNode ?? 0]
    return currentNode?.role === CURRENT_ROLE
  })

  const processedItems = performances.filter((p) =>
    p.approvalRecords.some((r) => r.approverRole === CURRENT_ROLE)
  )

  const handleApprove = (perfId: string, nodeIndex: number) => {
    approvePerformanceNode(perfId, nodeIndex, "审批通过")
  }

  const handleReject = (perfId: string, nodeIndex: number) => {
    if (!rejectReason.trim()) return
    rejectPerformanceNode(perfId, nodeIndex, rejectReason)
    setRejectingId(null)
    setRejectReason("")
  }

  const renderProgress = (perf: typeof performances[0]) => {
    const branch = getBranch(perf.approvalBranchId)
    if (!branch) return null
    const sortedNodes = [...branch.nodes].sort((a, b) => a.order - b.order)
    return (
      <div className="flex flex-wrap items-center gap-1 mt-2">
        {sortedNodes.map((node, i) => {
          const record = perf.approvalRecords.find((r) => r.nodeId === node.id)
          const isCurrent = i === (perf.currentApprovalNode ?? 0) && perf.status === "pending"
          return (
            <div key={node.id} className="flex items-center gap-1">
              {i > 0 && <div className="w-3 h-px bg-white/10" />}
              <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                record?.result === "approved" ? "bg-green-900/40 text-green-400" :
                record?.result === "rejected" ? "bg-theater-red/30 text-red-400" :
                isCurrent ? "bg-theater-gold/20 text-theater-gold" :
                "bg-white/5 text-white/30"
              }`}>
                {record?.result === "approved" ? <Check className="w-3 h-3" /> :
                 record?.result === "rejected" ? <X className="w-3 h-3" /> :
                 isCurrent ? <Clock className="w-3 h-3" /> :
                 <div className="w-3 h-3 rounded-full border border-current" />}
                <span>{node.role}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1 className="section-title mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-theater-gold" />
        我的审批
        <span className="badge bg-theater-gold/20 text-theater-gold ml-1">{CURRENT_ROLE}</span>
      </h1>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-theater-gold mb-3 flex items-center gap-1">
          <Clock className="w-4 h-4" /> 待审批
        </h2>
        {pendingItems.length === 0 && (
          <p className="text-white/30 text-sm text-center py-4">暂无待审批项目</p>
        )}
        <AnimatePresence>
          <div className="space-y-3">
            {pendingItems.map((p) => {
              const nodeIndex = p.currentApprovalNode ?? 0
              return (
                <motion.div key={p.id} layout className="card-gold">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-theater-cream">{p.name}</h3>
                    <span className="badge bg-theater-gold/30 text-theater-gold">{p.type}</span>
                  </div>
                  <div className="text-xs text-white/50 space-y-0.5 mb-2">
                    <div>{getTroupe(p.troupeId)} · {p.date}</div>
                    <div>{p.scale} · 预期观众 {p.expectedAudience}</div>
                  </div>
                  {renderProgress(p)}
                  {rejectingId === p.id ? (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 space-y-2">
                      <input className="input-field text-sm" placeholder="请输入驳回原因" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} autoFocus />
                      <div className="flex gap-2">
                        <button className="btn-outline text-xs flex-1" onClick={() => { setRejectingId(null); setRejectReason("") }}>取消</button>
                        <button className="btn-danger text-xs flex-1" onClick={() => handleReject(p.id, nodeIndex)}>确认驳回</button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex gap-2 mt-3">
                      <button className="btn-gold text-xs flex-1" onClick={() => handleApprove(p.id, nodeIndex)}>
                        <Check className="w-3.5 h-3.5 inline mr-1" />通过
                      </button>
                      <button className="btn-danger text-xs flex-1" onClick={() => setRejectingId(p.id)}>
                        <X className="w-3.5 h-3.5 inline mr-1" />驳回
                      </button>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-white/40 mb-3">已审批</h2>
        <div className="space-y-3">
          {processedItems.map((p) => {
            const myRecord = p.approvalRecords.find((r) => r.approverRole === CURRENT_ROLE)
            const isApproved = myRecord?.result === "approved"
            return (
              <motion.div key={p.id} layout className="card opacity-60">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-theater-cream/70 text-sm">{p.name}</h3>
                  <span className={`badge ${isApproved ? "bg-green-900/40 text-green-400" : "bg-theater-red/30 text-red-400"}`}>
                    {isApproved ? "已通过" : "已驳回"}
                  </span>
                </div>
                <div className="text-xs text-white/40">
                  {getTroupe(p.troupeId)} · {p.date} · {p.type}
                </div>
                {myRecord?.comment && (
                  <div className="text-xs text-white/30 mt-1.5 italic">"{myRecord.comment}"</div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
