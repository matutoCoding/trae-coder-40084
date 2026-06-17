import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Plus, ChevronRight } from "lucide-react"
import { useTheaterStore } from "@/store/theaterStore"
import type { PerformanceStatus } from "@/types"

const statusTabs: { label: string; value: PerformanceStatus | "all" }[] = [
  { label: "全部", value: "all" },
  { label: "草稿", value: "draft" },
  { label: "审批中", value: "pending" },
  { label: "已通过", value: "approved" },
  { label: "已驳回", value: "rejected" },
]

const statusBadgeMap: Record<PerformanceStatus, string> = {
  draft: "bg-gray-500/20 text-gray-300",
  pending: "bg-amber-500/20 text-amber-300",
  approved: "bg-green-500/20 text-green-300",
  rejected: "bg-red-500/20 text-red-300",
}

const statusLabelMap: Record<PerformanceStatus, string> = {
  draft: "草稿",
  pending: "审批中",
  approved: "已通过",
  rejected: "已驳回",
}

const scaleBadgeMap: Record<string, string> = {
  "小型": "bg-blue-500/20 text-blue-300",
  "中型": "bg-purple-500/20 text-purple-300",
  "大型": "bg-orange-500/20 text-orange-300",
  "特大型": "bg-rose-500/20 text-rose-300",
}

export default function PerformanceList() {
  const navigate = useNavigate()
  const { performances, troupes } = useTheaterStore()
  const [activeTab, setActiveTab] = useState<PerformanceStatus | "all">("all")

  const filtered = activeTab === "all"
    ? performances
    : performances.filter(p => p.status === activeTab)

  const getTroupeName = (id: string) => troupes.find(t => t.id === id)?.name ?? ""

  return (
    <div className="page-container">
      <h1 className="section-title mb-4">演出管理</h1>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
        {statusTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`badge whitespace-nowrap transition-all ${
              activeTab === tab.value
                ? "bg-theater-gold/30 text-theater-gold border border-theater-gold/40"
                : "bg-white/5 text-white/50 border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((perf, i) => (
          <motion.div
            key={perf.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/performances/${perf.id}`)}
            className="card cursor-pointer active:bg-white/5 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-theater-cream">{perf.name}</h3>
              <ChevronRight className="w-4 h-4 text-white/30 mt-1 shrink-0" />
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="badge bg-theater-gold/20 text-theater-gold">{perf.type}</span>
              <span className={`badge ${scaleBadgeMap[perf.scale] ?? ""}`}>{perf.scale}</span>
              <span className={`badge ${statusBadgeMap[perf.status]}`}>{statusLabelMap[perf.status]}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/50">
              <span>{getTroupeName(perf.troupeId)}</span>
              <span>·</span>
              <span>{perf.date}</span>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-white/30 py-12">暂无演出记录</div>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => navigate("/performances/new")}
        className="fixed bottom-6 right-6 btn-gold rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-10"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  )
}
