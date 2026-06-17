import type { PeriodicRule, Occupancy } from "@/types"
import { addDays, format, getDay } from "date-fns"

export const periodicRules: PeriodicRule[] = [
  {
    id: "rule-1",
    name: "晨曦话剧团·周二排练",
    troupeId: "troupe-1",
    stageId: "stage-2",
    dayOfWeek: 2,
    startTime: "09:00",
    endTime: "12:00",
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-12-31",
    enabled: true,
    occupancyType: "排练",
  },
  {
    id: "rule-2",
    name: "晨曦话剧团·周四排练",
    troupeId: "troupe-1",
    stageId: "stage-2",
    dayOfWeek: 4,
    startTime: "14:00",
    endTime: "18:00",
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-12-31",
    enabled: true,
    occupancyType: "排练",
  },
  {
    id: "rule-3",
    name: "梦之声·周一排练",
    troupeId: "troupe-2",
    stageId: "stage-1",
    dayOfWeek: 1,
    startTime: "10:00",
    endTime: "16:00",
    effectiveFrom: "2026-03-01",
    effectiveTo: "2026-09-30",
    enabled: true,
    occupancyType: "排练",
  },
  {
    id: "rule-4",
    name: "蝶舞舞蹈团·周三排练",
    troupeId: "troupe-3",
    stageId: "stage-3",
    dayOfWeek: 3,
    startTime: "09:00",
    endTime: "13:00",
    effectiveFrom: "2026-02-01",
    effectiveTo: "2026-11-30",
    enabled: true,
    occupancyType: "排练",
  },
  {
    id: "rule-5",
    name: "国韵戏曲团·周五装台",
    troupeId: "troupe-4",
    stageId: "stage-1",
    dayOfWeek: 5,
    startTime: "08:00",
    endTime: "20:00",
    effectiveFrom: "2026-04-01",
    effectiveTo: "2026-10-31",
    enabled: false,
    occupancyType: "装台",
  },
]

function generateOccupanciesFromRules(rules: PeriodicRule[], weeksAhead: number = 12): Occupancy[] {
  const occupancies: Occupancy[] = []
  const today = new Date()
  let counter = 1000

  for (const rule of rules) {
    if (!rule.enabled) continue
    const from = new Date(rule.effectiveFrom)
    const to = new Date(rule.effectiveTo)
    const endDate = addDays(today, weeksAhead * 7)
    const actualEnd = to < endDate ? to : endDate

    let current = new Date(from)
    while (current <= actualEnd) {
      if (getDay(current) === rule.dayOfWeek) {
        const dateStr = format(current, "yyyy-MM-dd")
        occupancies.push({
          id: `occ-auto-${++counter}`,
          stageId: rule.stageId,
          troupeId: rule.troupeId,
          date: dateStr,
          startTime: rule.startTime,
          endTime: rule.endTime,
          type: rule.occupancyType,
          source: "periodic",
          periodicRuleId: rule.id,
          isException: false,
        })
      }
      current = addDays(current, 1)
    }
  }
  return occupancies
}

const manualOccupancies: Occupancy[] = [
  {
    id: "occ-manual-1",
    stageId: "stage-1",
    troupeId: "troupe-2",
    date: "2026-06-20",
    startTime: "19:00",
    endTime: "22:00",
    type: "演出",
    source: "performance",
    isException: false,
    performanceId: "perf-1",
  },
  {
    id: "occ-manual-2",
    stageId: "stage-3",
    troupeId: "troupe-3",
    date: "2026-06-22",
    startTime: "15:00",
    endTime: "17:00",
    type: "演出",
    source: "performance",
    isException: false,
    performanceId: "perf-2",
  },
  {
    id: "occ-manual-3",
    stageId: "stage-2",
    troupeId: "troupe-1",
    date: "2026-06-25",
    startTime: "19:30",
    endTime: "22:00",
    type: "演出",
    source: "performance",
    isException: false,
    performanceId: "perf-3",
  },
]

export const initialOccupancies: Occupancy[] = [
  ...generateOccupanciesFromRules(periodicRules, 8),
  ...manualOccupancies,
]
