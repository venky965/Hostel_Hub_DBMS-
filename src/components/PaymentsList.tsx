import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  MoreVertical, 
  CheckCircle2, 
  Clock,
  ArrowUpRight,
  Trash2
} from 'lucide-react';
import { Payment, Student } from '../types';
import { generateId, cn } from '../lib/utils';
import Modal from './Modal';

interface PaymentsListProps {
  payments: Payment[];
  onAddPayment: (payment: Payment) => void;
  onDeletePayment: (id: string) => void;
  students: Student[];
}

export default function PaymentsList({ payments, onAddPayment, onDeletePayment, students }: PaymentsListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    status: 'Paid',
    method: 'Online',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddPayment = () => {
    if (newPayment.studentId && newPayment.amount) {
      const student = students.find(s => s.id === newPayment.studentId);
      const payment: Payment = {
        id: generateId(),
        studentId: newPayment.studentId || '',
        studentName: student?.name || 'Unknown',
        roomNumber: student?.roomNumber || 'N/A',
        amount: newPayment.amount || 0,
        date: newPayment.date || '',
        month: newPayment.month || '',
        status: newPayment.status as any || 'Paid',
        method: newPayment.method as any || 'Online'
      };
      onAddPayment(payment);
      setIsAddModalOpen(false);
      setNewPayment({ status: 'Paid', method: 'Online', date: new Date().toISOString().split('T')[0] });
    }
  };

  const deletePayment = () => {
    if (paymentToDelete) {
      onDeletePayment(paymentToDelete);
      setPaymentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-card-bg p-6 rounded-xl border dark:border-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold">Fee Collections</h2>
          <p className="text-sm text-text-secondary">Track student financial standing</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-all font-semibold shadow-md shadow-accent/20"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-card-bg rounded-xl border dark:border-border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-white/[0.02] text-text-secondary text-[11px] font-bold uppercase tracking-widest">
              <th className="px-6 py-4">Ref ID</th>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Room</th>
              <th className="px-6 py-4">Month</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6] dark:divide-border text-sm">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 opacity-50 font-mono text-[10px]">#TRN-{payment.id.toUpperCase()}</td>
                <td className="px-6 py-4 font-semibold">{payment.studentName}</td>
                <td className="px-6 py-4 text-text-secondary">{payment.roomNumber}</td>
                <td className="px-6 py-4 text-text-secondary">{payment.month}</td>
                <td className="px-6 py-4 font-bold text-right">₹{payment.amount}</td>
                <td className="px-6 py-4 text-center">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    payment.status === 'Paid' ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  )}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setPaymentToDelete(payment.id)}
                    className="p-2 rounded-lg hover:bg-danger/10 text-danger transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Record New Transaction"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">Select Student</label>
            <select 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 outline-none transition-all"
              value={newPayment.studentId || ''}
              onChange={(e) => setNewPayment({...newPayment, studentId: e.target.value})}
            >
              <option value="">Search Student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} (Room {s.roomNumber})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Month</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. April 2024"
                value={newPayment.month || ''}
                onChange={(e) => setNewPayment({...newPayment, month: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Amount (₹)</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 outline-none transition-all"
                placeholder="5000"
                value={newPayment.amount || ''}
                onChange={(e) => setNewPayment({...newPayment, amount: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Payment Status</label>
              <select 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 outline-none transition-all"
                value={newPayment.status || 'Paid'}
                onChange={(e) => setNewPayment({...newPayment, status: e.target.value as any})}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Method</label>
              <select 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 outline-none transition-all"
                value={newPayment.method || 'Online'}
                onChange={(e) => setNewPayment({...newPayment, method: e.target.value as any})}
              >
                <option value="Online">Online Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
              </select>
            </div>
          </div>
          <button 
            onClick={handleAddPayment}
            className="w-full py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2"
          >
            <ArrowUpRight className="w-5 h-5" />
            Process Payment
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!paymentToDelete}
        onClose={() => setPaymentToDelete(null)}
        title="Confirm Deletion"
      >
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold">Remove Payment Record?</h3>
            <p className="text-sm text-text-secondary">
              Are you sure you want to delete this payment record? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPaymentToDelete(null)}
              className="flex-1 py-3 bg-gray-100 dark:bg-white/5 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={deletePayment}
              className="flex-1 py-3 bg-danger text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-xl shadow-danger/20"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
