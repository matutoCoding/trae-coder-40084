import { create } from "zustand"
import type { Stage, Troupe, Occupancy, PeriodicRule, ApprovalBranch, ApprovalRoute, Performance, EquipmentItem, EquipmentCategory } from "@/types"
import { stages as mockStages, troupes as mockTroupes } from "@/data/stages"
import { initialOccupancies, periodicRules as mockRules } from "@/data/occupancies"
import { approvalBranches as mockBranches, approvalRoutes as mockRoutes } from "@/data/approvals"
import { performances as mockPerformances } from "@/data/performances"
import { addDays, format, getDay } from "date-fns"

interface TheaterStore {
  stages: Stage[]
  troupes: Troupe[]
  occupancies: Occupancy[]
  periodicRules: PeriodicRule[]
  approvalBranches: ApprovalBranch[]
  approvalRoutes: ApprovalRoute[]
  performances: Performance[]

  addStage: (stage: Stage) => void
  updateStage: (id: string, data: Partial<Stage>) => void
  addEquipment: (stageId: string, category: EquipmentCategory, item: Omit<EquipmentItem, "id" | "stageId" | "category">) => void
  updateEquipment: (stageId: string, equipmentId: string, data: Partial<EquipmentItem>) => void
  deleteEquipment: (stageId: string, equipmentId: string) => void

  addOccupancy: (occ: Occupancy) => void
  updateOccupancy: (id: string, data: Partial<Occupancy>) => void
  deleteOccupancy: (id: string) => void
  batchAddOccupancies: (occs: Occupancy[]) => void

  addPeriodicRule: (rule: PeriodicRule) => void
  updatePeriodicRule: (id: string, data: Partial<PeriodicRule>) => void
  deletePeriodicRule: (id: string) => void
  generateFromRule: (ruleId: string, weeksAhead: number) => Occupancy[]

  addApprovalBranch: (branch: ApprovalBranch) => void
  updateApprovalBranch: (id: string, data: Partial<ApprovalBranch>) => void
  deleteApprovalBranch: (id: string) => void

  addApprovalRoute: (route: ApprovalRoute) => void
  updateApprovalRoute: (id: string, data: Partial<ApprovalRoute>) => void
  deleteApprovalRoute: (id: string) => void
  matchApprovalBranch: (performance: Performance) => ApprovalBranch | undefined

  addPerformance: (perf: Performance) => void
  updatePerformance: (id: string, data: Partial<Performance>) => void
  approvePerformanceNode: (perfId: string, nodeIndex: number, comment: string) => void
  rejectPerformanceNode: (perfId: string, nodeIndex: number, comment: string) => void
}

export const useTheaterStore = create<TheaterStore>((set, get) => ({
  stages: mockStages,
  troupes: mockTroupes,
  occupancies: initialOccupancies,
  periodicRules: mockRules,
  approvalBranches: mockBranches,
  approvalRoutes: mockRoutes,
  performances: mockPerformances,

  addStage: (stage) => set((s) => ({ stages: [...s.stages, stage] })),
  updateStage: (id, data) => set((s) => ({ stages: s.stages.map((st) => (st.id === id ? { ...st, ...data } : st)) })),
  addEquipment: (stageId, category, item) => set((s) => ({
    stages: s.stages.map(st => {
      if (st.id !== stageId) return st
      const newItem: EquipmentItem = { ...item, id: `eq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, stageId, category }
      if (category === "灯光") return { ...st, lightingEquipment: [...st.lightingEquipment, newItem] }
      return { ...st, soundEquipment: [...st.soundEquipment, newItem] }
    })
  })),
  updateEquipment: (stageId, equipmentId, data) => set((s) => ({
    stages: s.stages.map(st => {
      if (st.id !== stageId) return st
      return {
        ...st,
        lightingEquipment: st.lightingEquipment.map(e => e.id === equipmentId ? { ...e, ...data } : e),
        soundEquipment: st.soundEquipment.map(e => e.id === equipmentId ? { ...e, ...data } : e),
      }
    })
  })),
  deleteEquipment: (stageId, equipmentId) => set((s) => ({
    stages: s.stages.map(st => {
      if (st.id !== stageId) return st
      return {
        ...st,
        lightingEquipment: st.lightingEquipment.filter(e => e.id !== equipmentId),
        soundEquipment: st.soundEquipment.filter(e => e.id !== equipmentId),
      }
    })
  })),

  addOccupancy: (occ) => set((s) => ({ occupancies: [...s.occupancies, occ] })),
  updateOccupancy: (id, data) => set((s) => ({ occupancies: s.occupancies.map((o) => (o.id === id ? { ...o, ...data } : o)) })),
  deleteOccupancy: (id) => set((s) => ({ occupancies: s.occupancies.filter((o) => o.id !== id) })),
  batchAddOccupancies: (occs) => set((s) => ({ occupancies: [...s.occupancies, ...occs] })),

  addPeriodicRule: (rule) => set((s) => ({ periodicRules: [...s.periodicRules, rule] })),
  updatePeriodicRule: (id, data) => set((s) => ({ periodicRules: s.periodicRules.map((r) => (r.id === id ? { ...r, ...data } : r)) })),
  deletePeriodicRule: (id) => set((s) => ({ periodicRules: s.periodicRules.filter((r) => r.id !== id) })),

  generateFromRule: (ruleId, weeksAhead) => {
    const rule = get().periodicRules.find((r) => r.id === ruleId)
    if (!rule) return []
    const today = new Date()
    const endDate = addDays(today, weeksAhead * 7)
    const from = new Date(rule.effectiveFrom)
    const to = new Date(rule.effectiveTo)
    const actualEnd = to < endDate ? to : endDate
    const result: Occupancy[] = []
    let current = new Date(from)
    let counter = Date.now()
    while (current <= actualEnd) {
      if (getDay(current) === rule.dayOfWeek) {
        const dateStr = format(current, "yyyy-MM-dd")
        const exists = get().occupancies.some(
          (o) => o.date === dateStr && o.stageId === rule.stageId && o.periodicRuleId === ruleId
        )
        if (!exists) {
          result.push({
            id: `occ-gen-${++counter}`,
            stageId: rule.stageId,
            troupeId: rule.troupeId,
            date: dateStr,
            startTime: rule.startTime,
            endTime: rule.endTime,
            type: rule.occupancyType,
            source: "periodic",
            periodicRuleId: rule.id,
            isException: false,
            cancelled: false,
          })
        }
      }
      current = addDays(current, 1)
    }
    return result
  },

  addApprovalBranch: (branch) => set((s) => ({ approvalBranches: [...s.approvalBranches, branch] })),
  updateApprovalBranch: (id, data) => set((s) => ({ approvalBranches: s.approvalBranches.map((b) => (b.id === id ? { ...b, ...data } : b)) })),
  deleteApprovalBranch: (id) => set((s) => ({ approvalBranches: s.approvalBranches.filter((b) => b.id !== id) })),

  addApprovalRoute: (route) => set((s) => ({ approvalRoutes: [...s.approvalRoutes, route] })),
  updateApprovalRoute: (id, data) => set((s) => ({ approvalRoutes: s.approvalRoutes.map((r) => (r.id === id ? { ...r, ...data } : r)) })),
  deleteApprovalRoute: (id) => set((s) => ({ approvalRoutes: s.approvalRoutes.filter((r) => r.id !== id) })),

  matchApprovalBranch: (performance) => {
    const parseValue = (val: string | number | string[]): string[] => {
      if (Array.isArray(val)) return val
      if (typeof val === "string" && val.includes(",")) return val.split(",").map(s => s.trim())
      return [String(val)]
    }

    const routes = [...get().approvalRoutes].sort((a, b) => a.priority - b.priority)
    for (const route of routes) {
      const allMatch = route.conditions.every((cond) => {
        const fieldValue = cond.field === "performanceType"
          ? performance.type
          : cond.field === "scale"
            ? performance.scale
            : cond.field === "expectedAudience"
              ? performance.expectedAudience
              : performance.expectedAudience
        switch (cond.operator) {
          case "eq": return String(fieldValue) === String(cond.value)
          case "neq": return String(fieldValue) !== String(cond.value)
          case "gt": return Number(fieldValue) > Number(cond.value)
          case "lt": return Number(fieldValue) < Number(cond.value)
          case "in": {
            const values = parseValue(cond.value)
            return values.includes(String(fieldValue))
          }
          case "between": {
            const values = parseValue(cond.value)
            if (values.length >= 2) {
              const num = Number(fieldValue)
              const low = Number(values[0])
              const high = Number(values[1])
              return num >= low && num <= high
            }
            return false
          }
          default: return false
        }
      })
      if (allMatch) {
        return get().approvalBranches.find((b) => b.id === route.branchId)
      }
    }
    return get().approvalBranches[0]
  },

  addPerformance: (perf) => set((s) => ({ performances: [...s.performances, perf] })),
  updatePerformance: (id, data) => set((s) => ({ performances: s.performances.map((p) => (p.id === id ? { ...p, ...data } : p)) })),

  approvePerformanceNode: (perfId, nodeIndex, comment) => {
    set((s) => ({
      performances: s.performances.map((p) => {
        if (p.id !== perfId) return p
        const branch = s.approvalBranches.find((b) => b.id === p.approvalBranchId)
        const node = branch?.nodes[nodeIndex]
        if (!node) return p
        const newRecords = [...p.approvalRecords, {
          nodeId: node.id,
          approverRole: node.role,
          result: "approved" as const,
          comment,
          timestamp: new Date().toISOString(),
        }]
        const isLast = branch && nodeIndex >= branch.nodes.length - 1
        return {
          ...p,
          status: isLast ? "approved" as const : p.status,
          currentApprovalNode: isLast ? p.currentApprovalNode : nodeIndex + 1,
          approvalRecords: newRecords,
        }
      }),
    }))
  },

  rejectPerformanceNode: (perfId, nodeIndex, comment) => {
    set((s) => ({
      performances: s.performances.map((p) => {
        if (p.id !== perfId) return p
        const branch = s.approvalBranches.find((b) => b.id === p.approvalBranchId)
        const node = branch?.nodes[nodeIndex]
        if (!node) return p
        const newRecords = [...p.approvalRecords, {
          nodeId: node.id,
          approverRole: node.role,
          result: "rejected" as const,
          comment,
          timestamp: new Date().toISOString(),
        }]
        return {
          ...p,
          status: "rejected" as const,
          rejectReason: comment,
          approvalRecords: newRecords,
        }
      }),
    }))
  },
}))
