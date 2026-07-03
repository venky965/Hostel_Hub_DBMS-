import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2,
  Edit2,
  Phone,
  Mail,
  Calendar,
  DoorOpen,
  DollarSign,
  User,
  CreditCard,
  UserCheck,
  Award
} from 'lucide-react';
import { Student, Room, Payment } from '../types';
import { generateId, cn, formatDate } from '../lib/utils';
import Modal from './Modal';

interface StudentsListProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  rooms: Room[];
  payments: Payment[];
  onAddPayment: (payment: Payment) => void;
}

const getCurrentMonthYear = () => {
  const date = new Date();
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

export default function StudentsList({ 
  students, 
  onAddStudent, 
  onDeleteStudent, 
  rooms, 
  payments, 
  onAddPayment 
}: StudentsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // State for form fields
  const [formFields, setFormFields] = useState({
    name: '',
    email: '',
    phone: '',
    roomId: '',
    course: '',
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'Active' as 'Active' | 'Inactive',
    feeStatus: 'Pending' as 'Paid' | 'Pending',
    feeAmount: 500,
    paymentMethod: 'Online' as 'Online' | 'Cash' | 'Card',
  });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.roomNumber.includes(searchTerm) ||
    s.phone.includes(searchTerm)
  );

  // Helper to find fee status for any student
  const getStudentPaymentInfo = (studentId: string) => {
    // Look up the latest payment record for this student
    const studentPayments = payments.filter(p => p.studentId === studentId);
    if (studentPayments.length === 0) {
      return { status: 'Pending' as 'Paid' | 'Pending', amount: 0, method: 'Online' as const };
    }
    // Sort to get the latest payment
    const latest = [...studentPayments].sort((a, b) => b.date.localeCompare(a.date))[0];
    return {
      status: latest.status as 'Paid' | 'Pending',
      amount: latest.amount,
      method: latest.method as 'Online' | 'Cash' | 'Card',
      month: latest.month
    };
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormFields({
      name: '',
      email: '',
      phone: '',
      roomId: rooms[0]?.id || '',
      course: 'Computer Science',
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      feeStatus: 'Pending',
      feeAmount: rooms[0]?.pricePerMonth || 500,
      paymentMethod: 'Online',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    const payInfo = getStudentPaymentInfo(student.id);
    
    setFormFields({
      name: student.name,
      email: student.email,
      phone: student.phone,
      roomId: student.roomId || '',
      course: student.course,
      admissionDate: student.admissionDate,
      status: student.status,
      feeStatus: payInfo.status,
      feeAmount: payInfo.amount || 0,
      paymentMethod: payInfo.method,
    });
    setIsAddModalOpen(true);
  };

  const handleRoomChange = (roomId: string) => {
    const selectedRoom = rooms.find(r => r.id === roomId);
    setFormFields(prev => ({
      ...prev,
      roomId,
      feeAmount: selectedRoom ? selectedRoom.pricePerMonth : prev.feeAmount
    }));
  };

  const handleSaveStudent = () => {
    if (formFields.name && formFields.email && formFields.roomId) {
      const selectedRoom = rooms.find(r => r.id === formFields.roomId);
      const studentId = editingStudent ? editingStudent.id : generateId();
      
      const student: Student = {
        id: studentId,
        name: formFields.name,
        email: formFields.email,
        phone: formFields.phone,
        roomNumber: selectedRoom?.number || '',
        roomId: formFields.roomId,
        course: formFields.course,
        admissionDate: formFields.admissionDate,
        status: formFields.status
      };

      // Save student via App callback (calls upsert API endpoint)
      onAddStudent(student);

      // Create/upsert corresponding payment
      const paymentRecord: Payment = {
        id: `pay_${studentId}`,
        studentId: studentId,
        studentName: formFields.name,
        roomNumber: selectedRoom?.number || '',
        amount: Number(formFields.feeAmount),
        date: new Date().toISOString().split('T')[0],
        month: getCurrentMonthYear(),
        status: formFields.feeStatus,
        method: formFields.paymentMethod
      };

      onAddPayment(paymentRecord);

      setIsAddModalOpen(false);
      setEditingStudent(null);
    }
  };

  const deleteStudent = () => {
    if (studentToDelete) {
      onDeleteStudent(studentToDelete);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-card-bg p-5 rounded-xl border dark:border-border shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input 
            type="text" 
            placeholder="Search by name, email, phone, or room..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-bg-dark border dark:border-border focus:ring-2 focus:ring-accent/20 transition-all outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-hover transition-all shadow-md shadow-accent/20 text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hostel Member</span>
          </button>
        </div>
      </div>

      {/* Students / Members Table */}
      <div className="bg-white dark:bg-card-bg rounded-xl border dark:border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.02] text-text-secondary text-[11px] font-bold uppercase tracking-widest border-b dark:border-border">
                <th className="px-6 py-4">Member Info</th>
                <th className="px-6 py-4">Mobile Number</th>
                <th className="px-6 py-4">Allocated Room</th>
                <th className="px-6 py-4">Admission Date</th>
                <th className="px-6 py-4 font-semibold text-center">Fee Status</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] dark:divide-border">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const payInfo = getStudentPaymentInfo(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold uppercase text-xs">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{student.name}</p>
                            <p className="text-[11px] text-text-secondary">{student.course} • {student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-mono">{student.phone || 'No mobile listed'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                          <DoorOpen className="w-4 h-4 text-accent" />
                          <span>Room #{student.roomNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatDate(student.admissionDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1",
                          payInfo.status === 'Paid' 
                            ? "bg-success/10 text-success border border-success/20" 
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        )}>
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            payInfo.status === 'Paid' ? "bg-success" : "bg-amber-500"
                          )} />
                          {payInfo.status}
                        </span>
                        <p className="text-[10px] text-text-secondary mt-0.5 font-mono">
                          ${payInfo.amount} • {payInfo.method}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1",
                          student.status === 'Active' 
                            ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" 
                            : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                        )}>
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            student.status === 'Active' ? "bg-blue-500" : "bg-gray-400"
                          )} />
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenEditModal(student)}
                            className="p-2 rounded-lg hover:bg-accent/10 text-accent transition-colors"
                            title="Edit student info"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setStudentToDelete(student.id)}
                            className="p-2 rounded-lg hover:bg-danger/10 text-danger transition-colors"
                            title="Remove student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-secondary text-sm">
                    No hostel members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title={editingStudent ? "Edit Member Details" : "Add New Hostel Member"}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Full Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-accent outline-none transition-all text-sm font-medium"
                placeholder="Kai"
                value={formFields.name}
                onChange={(e) => setFormFields({...formFields, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-accent outline-none transition-all text-sm font-medium"
                placeholder="kai@example.com"
                value={formFields.email}
                onChange={(e) => setFormFields({...formFields, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Mobile Number</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-accent outline-none transition-all text-sm font-medium font-mono"
                placeholder="+91 98765 43210"
                value={formFields.phone}
                onChange={(e) => setFormFields({...formFields, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Course / Profession</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-accent outline-none transition-all text-sm font-medium"
                placeholder="Computer Science"
                value={formFields.course}
                onChange={(e) => setFormFields({...formFields, course: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Room Allocation</label>
              <select 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-accent outline-none transition-all text-sm font-medium"
                value={formFields.roomId}
                onChange={(e) => handleRoomChange(e.target.value)}
              >
                <option value="">Select Room</option>
                {rooms.map(room => {
                  const roomOccupants = students.filter(s => s.roomId === room.id);
                  const isFull = roomOccupants.length >= room.capacity && editingStudent?.roomId !== room.id;
                  return (
                    <option key={room.id} value={room.id} disabled={isFull}>
                      Room {room.number} ({room.type}){isFull ? ' - Full' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Admission Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-accent outline-none transition-all text-sm font-medium"
                value={formFields.admissionDate}
                onChange={(e) => setFormFields({...formFields, admissionDate: e.target.value})}
              />
            </div>
          </div>

          {/* Fee & Status Sections */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border dark:border-border/60 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-accent">Fees & Status Settings</h4>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400">Fee Status</label>
                <select 
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/5 border dark:border-border/50 outline-none focus:border-accent text-xs font-semibold"
                  value={formFields.feeStatus}
                  onChange={(e) => setFormFields({...formFields, feeStatus: e.target.value as any})}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400">Fee Amount ($)</label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/5 border dark:border-border/50 outline-none focus:border-accent text-xs font-mono font-semibold"
                  value={formFields.feeAmount}
                  onChange={(e) => setFormFields({...formFields, feeAmount: Number(e.target.value)})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400">Method</label>
                <select 
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/5 border dark:border-border/50 outline-none focus:border-accent text-xs font-semibold"
                  value={formFields.paymentMethod}
                  onChange={(e) => setFormFields({...formFields, paymentMethod: e.target.value as any})}
                >
                  <option value="Online">Online</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400">Hostel Membership Status</label>
              <select 
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-white/5 border dark:border-border/50 outline-none focus:border-accent text-xs font-semibold"
                value={formFields.status}
                onChange={(e) => setFormFields({...formFields, status: e.target.value as any})}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleSaveStudent}
            className="w-full py-3.5 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-all shadow-xl shadow-accent/20"
          >
            {editingStudent ? "Save Changes" : "Confirm Admission"}
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        title="Confirm Deletion"
      >
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold">Remove Student?</h3>
            <p className="text-sm text-text-secondary">
              This action cannot be undone. All records for this student will be permanently removed.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStudentToDelete(null)}
              className="flex-1 py-3 bg-gray-100 dark:bg-white/5 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={deleteStudent}
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
