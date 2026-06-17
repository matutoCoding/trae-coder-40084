import type { ApprovalBranch, ApprovalRoute } from "@/types"

export const approvalBranches: ApprovalBranch[] = [
  {
    id: "branch-1",
    name: "三级审批（大型演出）",
    nodes: [
      { id: "node-1-1", role: "剧场主管", order: 1, branchId: "branch-1" },
      { id: "node-1-2", role: "艺术总监", order: 2, branchId: "branch-1" },
      { id: "node-1-3", role: "总经理", order: 3, branchId: "branch-1" },
    ],
  },
  {
    id: "branch-2",
    name: "二级审批（中型演出）",
    nodes: [
      { id: "node-2-1", role: "剧场主管", order: 1, branchId: "branch-2" },
      { id: "node-2-2", role: "艺术总监", order: 2, branchId: "branch-2" },
    ],
  },
  {
    id: "branch-3",
    name: "一级审批（小型演出）",
    nodes: [
      { id: "node-3-1", role: "剧场主管", order: 1, branchId: "branch-3" },
    ],
  },
  {
    id: "branch-4",
    name: "技术审批（含技术审核）",
    nodes: [
      { id: "node-4-1", role: "技术主管", order: 1, branchId: "branch-4" },
      { id: "node-4-2", role: "剧场主管", order: 2, branchId: "branch-4" },
      { id: "node-4-3", role: "总经理", order: 3, branchId: "branch-4" },
    ],
  },
]

export const approvalRoutes: ApprovalRoute[] = [
  {
    id: "route-5",
    name: "音乐会特殊路由",
    conditions: [
      { id: "rc-5-1", field: "performanceType", operator: "eq", value: "音乐会" },
    ],
    branchId: "branch-4",
    priority: 0,
  },
  {
    id: "route-6",
    name: "舞蹈&戏曲合并审批",
    conditions: [
      { id: "rc-6-1", field: "performanceType", operator: "in", value: "舞蹈,戏曲" },
    ],
    branchId: "branch-2",
    priority: 1,
  },
  {
    id: "route-8",
    name: "观众人数>1000特批",
    conditions: [
      { id: "rc-8-1", field: "expectedAudience", operator: "gt", value: "1000" },
    ],
    branchId: "branch-1",
    priority: 2,
  },
  {
    id: "route-7",
    name: "观众人数500-1000区间",
    conditions: [
      { id: "rc-7-1", field: "expectedAudience", operator: "between", value: "500,1000" },
    ],
    branchId: "branch-1",
    priority: 3,
  },
  {
    id: "route-1",
    name: "特大型演出路由",
    conditions: [
      { id: "rc-1-1", field: "scale", operator: "eq", value: "特大型" },
    ],
    branchId: "branch-1",
    priority: 4,
  },
  {
    id: "route-2",
    name: "大型演出路由",
    conditions: [
      { id: "rc-2-1", field: "scale", operator: "eq", value: "大型" },
    ],
    branchId: "branch-1",
    priority: 5,
  },
  {
    id: "route-3",
    name: "中型演出路由",
    conditions: [
      { id: "rc-3-1", field: "scale", operator: "eq", value: "中型" },
    ],
    branchId: "branch-2",
    priority: 6,
  },
  {
    id: "route-4",
    name: "小型演出路由",
    conditions: [
      { id: "rc-4-1", field: "scale", operator: "eq", value: "小型" },
    ],
    branchId: "branch-3",
    priority: 7,
  },
]
