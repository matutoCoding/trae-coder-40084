import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTheaterStore } from "@/store/theaterStore"
import type { RouteCondition, ConditionField, ConditionOperator } from "@/types"
import { GitBranch, Plus, Trash2, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const fieldLabels: Record<ConditionField, string> = {
  performanceType: "演出类型",
  scale: "规模",
  expectedAudience: "预期观众",
  seatRange: "座位范围",
}

const operatorLabels: Record<ConditionOperator, string> = {
  eq: "等于",
  neq: "不等于",
  gt: "大于",
  lt: "小于",
  in: "包含",
  between: "介于",
}

export default function ApprovalRoutes() {
  const navigate = useNavigate()
  const { approvalRoutes, approvalBranches, addApprovalRoute, deleteApprovalRoute } = useTheaterStore()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [priority, setPriority] = useState(1)
  const [branchId, setBranchId] = useState(approvalBranches[0]?.id || "")
  const [conditions, setConditions] = useState<RouteCondition[]>([])

  const sorted = [...approvalRoutes].sort((a, b) => a.priority - b.priority)

  const addCond = () =>
    setConditions([...conditions, { id: `rc-${Date.now()}`, field: "performanceType", operator: "eq", value: "" }])

  const removeCond = (id: string) => setConditions(conditions.filter((c) => c.id !== id))

  const updateCond = (id: string, data: Partial<RouteCondition>) =>
    setConditions(conditions.map((c) => (c.id === id ? { ...c, ...data } : c)))

  const submit = () => {
    if (!name || !branchId) return
    addApprovalRoute({ id: `route-${Date.now()}`, name, conditions, branchId, priority })
    setShowForm(false)
    setName("")
    setPriority(approvalRoutes.length + 1)
    setConditions([])
  }

  const getBranchName = (bid: string) => approvalBranches.find((b) => b.id === bid)?.name || "未知分支"

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <h1 className="section-title flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-theater-gold" />
          审批路由
        </h1>
        <button className="btn-gold flex items-center gap-1 text-sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> 新建路由
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
              <input className="input-field" placeholder="路由名称" value={name} onChange={(e) => setName(e.target.value)} />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-white/40 mb-1 block">优先级</label>
                  <input type="number" className="input-field" value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white/40 mb-1 block">关联分支</label>
                  <select className="select-field" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                    {approvalBranches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-theater-cream/60">条件</span>
                  <button className="text-theater-gold text-xs flex items-center gap-1" onClick={addCond}>
                    <Plus className="w-3 h-3" /> 添加条件
                  </button>
                </div>
                {conditions.map((c) => (
                  <div key={c.id} className="flex gap-2 mb-2 items-center">
                    <select className="select-field text-sm flex-1" value={c.field} onChange={(e) => updateCond(c.id, { field: e.target.value as ConditionField })}>
                      {Object.entries(fieldLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <select className="select-field text-sm flex-1" value={c.operator} onChange={(e) => updateCond(c.id, { operator: e.target.value as ConditionOperator })}>
                      {Object.entries(operatorLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <input className="input-field text-sm flex-1" placeholder="值" value={String(c.value)} onChange={(e) => updateCond(c.id, { value: e.target.value })} />
                    <button onClick={() => removeCond(c.id)}><Trash2 className="w-4 h-4 text-theater-red/70" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <button className="btn-outline text-sm" onClick={() => setShowForm(false)}>取消</button>
                <button className="btn-gold text-sm" onClick={submit}>确认创建</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {sorted.map((route) => (
          <motion.div key={route.id} layout className="card-gold">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="badge bg-theater-gold/20 text-theater-gold">#{route.priority}</span>
                <h3 className="font-semibold text-theater-cream">{route.name}</h3>
              </div>
              <button onClick={() => deleteApprovalRoute(route.id)}>
                <Trash2 className="w-4 h-4 text-white/20 hover:text-theater-red transition-colors" />
              </button>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="text-xs text-white/40 mb-1.5">匹配条件</div>
                {route.conditions.map((c) => (
                  <div key={c.id} className="text-sm text-theater-cream/80 mb-0.5 flex items-center gap-1">
                    <span className="text-theater-gold/70">•</span>
                    {fieldLabels[c.field]} <span className="text-white/30">{operatorLabels[c.operator]}</span> {String(c.value)}
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center justify-center pt-2">
                <ArrowRight className="w-5 h-5 text-theater-gold/60" />
              </div>

              <div>
                <div className="text-xs text-white/40 mb-1.5">审批分支</div>
                <span
                  className="badge bg-theater-navy-light text-theater-gold border border-theater-gold/30 cursor-pointer hover:bg-theater-gold/10 transition-colors"
                  onClick={() => navigate("/approval/branches")}
                >
                  {getBranchName(route.branchId)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
