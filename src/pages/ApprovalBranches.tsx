import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTheaterStore } from "@/store/theaterStore"
import type { ApprovalRole } from "@/types"
import { GitMerge, Plus, Trash2, User, ArrowDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const roles: ApprovalRole[] = ["剧场主管", "艺术总监", "总经理", "技术主管"]

export default function ApprovalBranches() {
  const navigate = useNavigate()
  const { approvalBranches, addApprovalBranch, deleteApprovalBranch } = useTheaterStore()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [formNodes, setFormNodes] = useState<{ role: ApprovalRole }[]>([{ role: "剧场主管" }])

  const addNode = () => setFormNodes([...formNodes, { role: "剧场主管" }])

  const removeNode = (idx: number) => setFormNodes(formNodes.filter((_, i) => i !== idx))

  const updateNode = (idx: number, role: ApprovalRole) =>
    setFormNodes(formNodes.map((n, i) => (i === idx ? { role } : n)))

  const submit = () => {
    if (!name) return
    const branchId = `branch-${Date.now()}`
    addApprovalBranch({
      id: branchId,
      name,
      nodes: formNodes.map((n, i) => ({
        id: `node-${Date.now()}-${i}`,
        role: n.role,
        order: i + 1,
        branchId,
      })),
    })
    setShowForm(false)
    setName("")
    setFormNodes([{ role: "剧场主管" }])
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <h1 className="section-title flex items-center gap-2">
          <GitMerge className="w-5 h-5 text-theater-gold" />
          审批分支
        </h1>
        <button className="btn-gold flex items-center gap-1 text-sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> 新建分支
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="card-gold mb-4 overflow-hidden"
          >
            <div className="space-y-3">
              <input className="input-field" placeholder="分支名称" value={name} onChange={(e) => setName(e.target.value)} />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-theater-cream/60">审批节点</span>
                  <button className="text-theater-gold text-xs flex items-center gap-1" onClick={addNode}>
                    <Plus className="w-3 h-3" /> 添加节点
                  </button>
                </div>
                <div className="space-y-0">
                  {formNodes.map((n, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-theater-gold/20 border-2 border-theater-gold flex items-center justify-center shrink-0">
                          <span className="text-[10px] text-theater-gold font-bold">{i + 1}</span>
                        </div>
                        {i < formNodes.length - 1 && <div className="w-0.5 h-6 bg-theater-gold/40" />}
                      </div>
                      <div className="flex-1 flex items-center gap-2 mb-2">
                        <select className="select-field text-sm flex-1" value={n.role} onChange={(e) => updateNode(i, e.target.value as ApprovalRole)}>
                          {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button onClick={() => removeNode(i)}><Trash2 className="w-4 h-4 text-theater-red/70" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button className="btn-outline text-sm" onClick={() => setShowForm(false)}>取消</button>
                <button className="btn-gold text-sm" onClick={submit}>确认创建</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {approvalBranches.map((branch) => {
          const sortedNodes = [...branch.nodes].sort((a, b) => a.order - b.order)
          return (
            <motion.div key={branch.id} layout className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-theater-cream flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-theater-gold" />
                  {branch.name}
                </h3>
                <button onClick={() => deleteApprovalBranch(branch.id)}>
                  <Trash2 className="w-4 h-4 text-white/20 hover:text-theater-red transition-colors" />
                </button>
              </div>

              <div className="space-y-0">
                {sortedNodes.map((node, i) => (
                  <div key={node.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-theater-gold/20 border-2 border-theater-gold flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-theater-gold font-bold">{node.order}</span>
                      </div>
                      {i < sortedNodes.length - 1 && (
                        <motion.div
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          className="w-0.5 h-8 bg-theater-gold/40 origin-top"
                        />
                      )}
                    </div>
                    <div className="flex-1 border-l-2 border-theater-gold pl-3 py-2 rounded-r-lg bg-theater-navy-dark/40 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-theater-gold" />
                        <span className="text-sm font-medium text-theater-cream">{node.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-1 text-xs text-white/30">
                <ArrowDown className="w-3 h-3" />
                <span>共 {sortedNodes.length} 级审批</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
