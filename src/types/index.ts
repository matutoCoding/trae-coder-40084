export type StageType = "大剧场" | "小剧场" | "实验剧场" | "露天舞台"
export type StageStatus = "active" | "inactive"
export type EquipmentCategory = "灯光" | "音响"
export type OccupancyType = "排练" | "演出" | "装台" | "拆台"
export type OccupancySource = "periodic" | "manual" | "performance"
export type PerformanceType = "话剧" | "音乐剧" | "舞蹈" | "音乐会" | "戏曲" | "其他"
export type PerformanceScale = "小型" | "中型" | "大型" | "特大型"
export type PerformanceStatus = "draft" | "pending" | "approved" | "rejected"
export type ApprovalRole = "剧场主管" | "艺术总监" | "总经理" | "技术主管"
export type ConditionField = "performanceType" | "scale" | "expectedAudience" | "seatRange"
export type ConditionOperator = "eq" | "neq" | "gt" | "lt" | "in" | "between"

export interface EquipmentItem {
  id: string
  name: string
  category: EquipmentCategory
  spec: string
  quantity: number
  stageId: string
}

export interface Stage {
  id: string
  name: string
  type: StageType
  seatCount: number
  status: StageStatus
  lightingEquipment: EquipmentItem[]
  soundEquipment: EquipmentItem[]
}

export interface Troupe {
  id: string
  name: string
  contact: string
  color: string
}

export interface Occupancy {
  id: string
  stageId: string
  troupeId: string
  date: string
  startTime: string
  endTime: string
  type: OccupancyType
  source: OccupancySource
  periodicRuleId?: string
  isException: boolean
  cancelled: boolean
  performanceId?: string
  remark?: string
}

export interface PeriodicRule {
  id: string
  name: string
  troupeId: string
  stageId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  effectiveFrom: string
  effectiveTo: string
  enabled: boolean
  occupancyType: OccupancyType
}

export interface ApprovalNode {
  id: string
  role: ApprovalRole
  order: number
  branchId: string
}

export interface ApprovalBranch {
  id: string
  name: string
  nodes: ApprovalNode[]
}

export interface RouteCondition {
  id: string
  field: ConditionField
  operator: ConditionOperator
  value: string | number | string[]
}

export interface ApprovalRoute {
  id: string
  name: string
  conditions: RouteCondition[]
  branchId: string
  priority: number
}

export interface EquipmentRequirement {
  equipmentId: string
  quantity: number
  remark?: string
}

export interface ApprovalRecord {
  nodeId: string
  approverRole: string
  result: "approved" | "rejected"
  comment?: string
  timestamp: string
}

export interface Performance {
  id: string
  name: string
  troupeId: string
  stageId: string
  type: PerformanceType
  date: string
  startTime: string
  endTime: string
  scale: PerformanceScale
  expectedAudience: number
  status: PerformanceStatus
  lightingRequirements: EquipmentRequirement[]
  soundRequirements: EquipmentRequirement[]
  approvalBranchId?: string
  currentApprovalNode?: number
  approvalRecords: ApprovalRecord[]
  rejectReason?: string
}
