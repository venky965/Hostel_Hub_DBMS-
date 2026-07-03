export type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  roomNumber: string;
  roomId?: string;
  course: string;
  admissionDate: string;
  status: 'Active' | 'Inactive';
};

export type Room = {
  id: string;
  number: string;
  type: 'Single' | 'Double' | 'Triple' | 'Quad';
  status: 'Available' | 'Full';
  capacity: number;
  currentOccupants: number;
  pricePerMonth: number;
};

export type Payment = {
  id: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  amount: number;
  date: string;
  month: string;
  status: 'Paid' | 'Pending';
  method: 'Cash' | 'Online' | 'Card';
};

export type Complaint = {
  id: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  title: string;
  description: string;
  date: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
};

export type DashboardStats = {
  totalStudents: number;
  totalRooms: number;
  occupiedRooms: number;
  pendingFees: number;
  totalRevenue: number;
  openComplaints: number;
};
