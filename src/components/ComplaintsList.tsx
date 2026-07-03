import { useState } from 'react';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Flag,
  Users
} from 'lucide-react';
import { Complaint, Student } from '../types';
import { generateId, cn } from '../lib/utils';
import Modal from './Modal';

interface ComplaintsListProps {
  complaints: Complaint[];
  onAddComplaint: (complaint: Complaint) => void;
  onUpdateComplaint: (complaint: Complaint) => void;
  onDeleteComplaint: (id: string) => void;
  students: Student[];
}

export default function ComplaintsList({ complaints, onAddComplaint, onUpdateComplaint, onDeleteComplaint, students }: ComplaintsListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState<Partial<Complaint>>({
    status: 'Pending',
    priority: 'Medium',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddComplaint = () => {
    if (newComplaint.studentId && newComplaint.title) {
      const student = students.find(s => s.id === newComplaint.studentId);
      const complaint: Complaint = {
        id: generateId(),
        studentId: newComplaint.studentId || '',
        studentName: student?.name || 'Unknown',
        roomNumber: student?.roomNumber || 'N/A',
        title: newComplaint.title || '',
        description: newComplaint.description || '',
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        priority: newComplaint.priority as any || 'Medium'
      };
      onAddComplaint(complaint);
      setIsAddModalOpen(false);
      setNewComplaint({ status: 'Pending', priority: 'Medium' });
    }
  };

  const updateStatus = (id: string, status: Complaint['status']) => {
    const complaint = complaints.find(c => c.id === id);
    if (complaint) {
      onUpdateComplaint({ ...complaint, status });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-card-bg p-6 rounded-xl border dark:border-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold">Complaints Management</h2>
          <p className="text-sm text-text-secondary">Track and resolve facility incidents</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-danger text-white rounded-lg hover:bg-red-700 transition-all font-semibold shadow-md shadow-danger/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Complaint</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {complaints.map((complaint) => (
          <div 
            key={complaint.id}
            className="group bg-white dark:bg-card-bg p-6 rounded-xl border dark:border-border hover:border-accent/30 transition-all shadow-sm"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className={cn(
                "w-12 h-12 rounded-lg border flex items-center justify-center shrink-0",
                complaint.status === 'Resolved' ? "bg-success/10 text-success border-success/20" : "bg-danger/10 text-danger border-danger/20"
              )}>
                {complaint.status === 'Resolved' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-bold dark:text-white">{complaint.title}</h3>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    complaint.priority === 'High' ? "bg-danger text-white" : 
                    complaint.priority === 'Medium' ? "bg-warning/10 text-warning" :
                    "bg-gray-100 text-text-secondary dark:bg-bg-dark"
                  )}>
                    {complaint.priority}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    complaint.status === 'Resolved' ? "bg-success/10 text-success" : 
                    complaint.status === 'In Progress' ? "bg-accent/10 text-accent" :
                    "bg-warning/10 text-warning"
                  )}>
                    {complaint.status}
                  </span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
                  {complaint.description}
                </p>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-[11px] text-text-secondary font-bold uppercase tracking-tight">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{complaint.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5" />
                    <span>Room {complaint.roomNumber}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{complaint.studentName}</span>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col justify-end gap-2 shrink-0">
                {complaint.status === 'Pending' && (
                  <button 
                    onClick={() => updateStatus(complaint.id, 'In Progress')}
                    className="px-4 py-2 bg-accent text-white rounded-lg text-xs font-bold hover:bg-accent-hover transition-all"
                  >
                    Start Work
                  </button>
                )}
                {complaint.status !== 'Resolved' && (
                  <button 
                    onClick={() => updateStatus(complaint.id, 'Resolved')}
                    className="px-4 py-2 bg-success text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-all"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Submit Incident Report"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">Identify Student</label>
            <select 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 outline-none transition-all"
              value={newComplaint.studentId || ''}
              onChange={(e) => setNewComplaint({...newComplaint, studentId: e.target.value})}
            >
              <option value="">Select Student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} (Room {s.roomNumber})</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">Issue Title</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Electrical Shortage"
              value={newComplaint.title || ''}
              onChange={(e) => setNewComplaint({...newComplaint, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">Severity Level</label>
            <div className="flex gap-2">
              {(['Low', 'Medium', 'High'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setNewComplaint({...newComplaint, priority: p})}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all",
                    newComplaint.priority === p 
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/20" 
                      : "bg-gray-100 dark:bg-white/5 text-gray-400"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">Detailed Description</label>
            <textarea 
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 outline-none transition-all resize-none"
              placeholder="Provide as much detail as possible..."
              value={newComplaint.description || ''}
              onChange={(e) => setNewComplaint({...newComplaint, description: e.target.value})}
            />
          </div>
          <button 
            onClick={handleAddComplaint}
            className="w-full py-4 bg-danger text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-xl shadow-danger/20"
          >
            File Complaint
          </button>
        </div>
      </Modal>
    </div>
  );
}
