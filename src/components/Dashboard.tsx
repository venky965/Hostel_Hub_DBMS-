import { 
  Users, 
  DoorOpen, 
  CreditCard, 
  MessageSquare, 
  IndianRupee
} from 'lucide-react';
import { DashboardStats, Payment, Room, Complaint } from '../types';
import { cn } from '../lib/utils';
import StatsCard from './StatsCard';

interface DashboardProps {
  stats: DashboardStats;
  payments: Payment[];
  rooms: Room[];
  complaints: Complaint[];
}

export default function Dashboard({ stats, payments, rooms, complaints }: DashboardProps) {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Students" 
          value={stats.totalStudents} 
          icon={Users} 
          color="blue" 
        />
        <StatsCard 
          title="Rooms Occupied" 
          value={`${stats.occupiedRooms}/${stats.totalRooms}`} 
          icon={DoorOpen} 
          color="green" 
        />
        <StatsCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue}`} 
          icon={IndianRupee} 
          color="purple" 
        />
        <StatsCard 
          title="Open Complaints" 
          value={stats.openComplaints} 
          icon={MessageSquare} 
          color="red" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Occupation / Progress - Occupies 1 column */}
        <div className="bg-white dark:bg-card-bg rounded-xl border border-[#E5E7EB] dark:border-border flex flex-col shadow-sm">
          <div className="p-5 border-b border-[#F3F4F6] dark:border-border">
            <h3 className="text-base font-bold">Hostel Capacity</h3>
            <p className="text-xs text-text-secondary">Overall occupancy</p>
          </div>
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-gray-100 dark:text-bg-dark"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={402}
                  strokeDashoffset={402 - (402 * (stats.occupiedRooms / stats.totalRooms))}
                  className="text-accent transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{Math.round((stats.occupiedRooms / stats.totalRooms) * 100)}%</span>
                <span className="text-[10px] text-text-secondary uppercase">Full</span>
              </div>
            </div>
            <div className="mt-8 space-y-3 w-full">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-bg-dark rounded-lg border dark:border-border">
                <p className="text-[10px] font-bold text-text-secondary uppercase">Available</p>
                <p className="text-sm font-bold text-success">{stats.totalRooms - stats.occupiedRooms}</p>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-bg-dark rounded-lg border dark:border-border">
                <p className="text-[10px] font-bold text-text-secondary uppercase">Booked</p>
                <p className="text-sm font-bold text-accent">{stats.occupiedRooms}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Fee Payments - Occupies 3 columns */}
        <div className="lg:col-span-3 bg-white dark:bg-card-bg rounded-xl border border-[#E5E7EB] dark:border-border flex flex-col shadow-sm">
          <div className="p-5 border-b border-[#F3F4F6] dark:border-border flex items-center justify-between">
            <h3 className="text-base font-bold">Recent Fee Payments</h3>
            <button className="text-xs font-semibold px-3 py-1 bg-accent/10 text-accent rounded-lg">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02] text-text-secondary">
                  <th className="px-6 py-3 font-medium">Student Name</th>
                  <th className="px-6 py-3 font-medium">Room</th>
                  <th className="px-6 py-3 font-medium text-right">Amount</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6] dark:divide-border">
                {payments.slice(0, 8).map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-medium">{payment.studentName}</td>
                    <td className="px-6 py-4 text-text-secondary">Room {payment.roomNumber}</td>
                    <td className="px-6 py-4 font-bold text-right">₹{payment.amount}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        payment.status === 'Paid' 
                          ? "bg-success/10 text-success" 
                          : "bg-warning/10 text-warning"
                      )}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tables Section - Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-4 bg-white dark:bg-card-bg rounded-xl border border-[#E5E7EB] dark:border-border flex flex-col shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#F3F4F6] dark:border-border flex items-center justify-between">
            <h3 className="text-base font-bold">Latest Complaints</h3>
            <button className="text-xs font-semibold px-3 py-1 bg-danger/10 text-danger rounded-lg">View Maintenance Log</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y md:divide-y-0 divide-[#F3F4F6] dark:divide-border overflow-y-auto">
             {complaints.filter(c => c.status !== 'Resolved').slice(0, 3).map((complaint) => (
               <div key={complaint.id} className="p-5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors h-full">
                 <div className="flex justify-between items-center mb-1 text-[11px] font-bold uppercase tracking-widest">
                   <span className={cn(
                     complaint.priority === 'High' ? "text-danger" : 
                     complaint.priority === 'Medium' ? "text-warning" : "text-text-secondary"
                   )}>
                     Priority: {complaint.priority}
                   </span>
                   <span className="text-text-secondary">Room {complaint.roomNumber}</span>
                 </div>
                 <h4 className="text-sm font-semibold mb-1">{complaint.title}</h4>
                 <p className="text-xs text-text-secondary leading-relaxed">{complaint.description}</p>
               </div>
             ))}
             {complaints.filter(c => c.status !== 'Resolved').length === 0 && (
               <div className="p-10 text-center col-span-3 text-text-secondary text-sm">
                 No active complaints to display
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
