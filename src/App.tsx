import { BrowserRouter, Routes, Route } from "react-router-dom"
import Layout from "@/components/Layout"
import Dashboard from "@/pages/Dashboard"
import StageList from "@/pages/StageList"
import StageDetail from "@/pages/StageDetail"
import ScheduleCalendar from "@/pages/ScheduleCalendar"
import OccupancyDetail from "@/pages/OccupancyDetail"
import PeriodicRules from "@/pages/PeriodicRules"
import NewPeriodicRule from "@/pages/NewPeriodicRule"
import BatchPreview from "@/pages/BatchPreview"
import ExceptionAdjust from "@/pages/ExceptionAdjust"
import ApprovalRoutes from "@/pages/ApprovalRoutes"
import ApprovalBranches from "@/pages/ApprovalBranches"
import MyApproval from "@/pages/MyApproval"
import PerformanceList from "@/pages/PerformanceList"
import NewPerformance from "@/pages/NewPerformance"
import PerformanceDetail from "@/pages/PerformanceDetail"
import EquipmentList from "@/pages/EquipmentList"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stages" element={<StageList />} />
          <Route path="/stages/:id" element={<StageDetail />} />
          <Route path="/schedule" element={<ScheduleCalendar />} />
          <Route path="/schedule/occupancy/:id" element={<OccupancyDetail />} />
          <Route path="/periodic" element={<PeriodicRules />} />
          <Route path="/periodic/new" element={<NewPeriodicRule />} />
          <Route path="/periodic/preview" element={<BatchPreview />} />
          <Route path="/periodic/exception/:id" element={<ExceptionAdjust />} />
          <Route path="/approval/routes" element={<ApprovalRoutes />} />
          <Route path="/approval/branches" element={<ApprovalBranches />} />
          <Route path="/approval/my" element={<MyApproval />} />
          <Route path="/performances" element={<PerformanceList />} />
          <Route path="/performances/new" element={<NewPerformance />} />
          <Route path="/performances/:id" element={<PerformanceDetail />} />
          <Route path="/equipment" element={<EquipmentList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
