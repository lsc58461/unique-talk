import { AdminDashboardView } from '@/features/admin/components/admin-dashboard-view'
import { AdminService } from '@/features/admin/services/admin-service'

export default async function AdminDashboard() {
  const stats = await AdminService.getStats()

  return <AdminDashboardView stats={stats} />
}
