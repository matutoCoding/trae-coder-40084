import type { Stage, Troupe, EquipmentItem } from "@/types"

const eqLighting = (stageId: string, offset: number): EquipmentItem[] => [
  { id: `el-${stageId}-1`, name: "聚光灯", category: "灯光", spec: "2000W 追光", quantity: 8 + offset, stageId },
  { id: `el-${stageId}-2`, name: "面光灯", category: "灯光", spec: "1000W LED", quantity: 12 + offset, stageId },
  { id: `el-${stageId}-3`, name: "侧光灯", category: "灯光", spec: "750W 卤素", quantity: 6 + offset, stageId },
  { id: `el-${stageId}-4`, name: "天幕灯", category: "灯光", spec: "LED RGBW", quantity: 4 + offset, stageId },
  { id: `el-${stageId}-5`, name: "换色器", category: "灯光", spec: "6色", quantity: 10 + offset, stageId },
  { id: `el-${stageId}-6`, name: "调光台", category: "灯光", spec: "48路", quantity: 1, stageId },
]

const eqSound = (stageId: string, offset: number): EquipmentItem[] => [
  { id: `es-${stageId}-1`, name: "主扩音箱", category: "音响", spec: "双15寸 有源", quantity: 4 + offset, stageId },
  { id: `es-${stageId}-2`, name: "返听音箱", category: "音响", spec: "12寸 有源", quantity: 6 + offset, stageId },
  { id: `es-${stageId}-3`, name: "调音台", category: "音响", spec: "32路 数字", quantity: 1, stageId },
  { id: `es-${stageId}-4`, name: "无线话筒", category: "音响", spec: "手持式", quantity: 8 + offset, stageId },
  { id: `es-${stageId}-5`, name: "头戴话筒", category: "音响", spec: "耳挂式", quantity: 6 + offset, stageId },
]

export const stages: Stage[] = [
  {
    id: "stage-1",
    name: "星光大剧场",
    type: "大剧场",
    seatCount: 1200,
    status: "active",
    lightingEquipment: eqLighting("stage-1", 4),
    soundEquipment: eqSound("stage-1", 4),
  },
  {
    id: "stage-2",
    name: "月光小剧场",
    type: "小剧场",
    seatCount: 350,
    status: "active",
    lightingEquipment: eqLighting("stage-2", 0),
    soundEquipment: eqSound("stage-2", 0),
  },
  {
    id: "stage-3",
    name: "灵感实验剧场",
    type: "实验剧场",
    seatCount: 120,
    status: "active",
    lightingEquipment: eqLighting("stage-3", -2),
    soundEquipment: eqSound("stage-3", -2),
  },
  {
    id: "stage-4",
    name: "星空露天舞台",
    type: "露天舞台",
    seatCount: 2000,
    status: "active",
    lightingEquipment: eqLighting("stage-4", 6),
    soundEquipment: eqSound("stage-4", 6),
  },
]

export const troupes: Troupe[] = [
  { id: "troupe-1", name: "晨曦话剧团", contact: "王团长 138-0001-0001", color: "#D4A843" },
  { id: "troupe-2", name: "梦之声音乐剧团", contact: "李团长 138-0002-0002", color: "#5B9BD5" },
  { id: "troupe-3", name: "蝶舞舞蹈团", contact: "赵团长 138-0003-0003", color: "#E07B7B" },
  { id: "troupe-4", name: "国韵戏曲团", contact: "陈团长 138-0004-0004", color: "#7BC67E" },
  { id: "troupe-5", name: "回响乐团", contact: "张团长 138-0005-0005", color: "#C49BDE" },
]
