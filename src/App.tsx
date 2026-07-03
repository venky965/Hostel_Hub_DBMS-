import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  DoorOpen, 
  CreditCard, 
  MessageSquare, 
  LayoutDashboard, 
  Moon, 
  Sun, 
  Menu, 
  X,
  LogOut,
  Bell,
  Database
} from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { INITIAL_STUDENTS, INITIAL_ROOMS, INITIAL_PAYMENTS, INITIAL_COMPLAINTS } from './constants';
import { Student, Room, Payment, Complaint, DashboardStats } from './types';
import { cn } from './lib/utils';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StudentsList from './components/StudentsList';
import RoomsList from './components/RoomsList';
import PaymentsList from './components/PaymentsList';
import ComplaintsList from './components/ComplaintsList';
import DatabaseExplorer from './components/DatabaseExplorer';

type View = 'dashboard' | 'students' | 'rooms' | 'payments' | 'complaints' | 'database';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useLocalStorage('dark-mode', false);
  const [user, setUser] = useLocalStorage<string | null>('auth-user', null);

  const handleLogin = (username: string) => {
    setUser(username);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleDeleteStudent = async (studentId: string) => {
    await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
    fetchData();
  };

  const handleAddStudent = async (student: Student) => {
    await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    fetchData();
  };

  const handleDeleteRoom = async (roomId: string) => {
    await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
    fetchData();
  };

  const handleAddRoom = async (room: Room) => {
    await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room)
    });
    fetchData();
  };

  const handleDeletePayment = async (paymentId: string) => {
    await fetch(`/api/payments/${paymentId}`, { method: 'DELETE' });
    fetchData();
  };

  const handleAddPayment = async (payment: Payment) => {
    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment)
    });
    fetchData();
  };

  const handleDeleteComplaint = async (complaintId: string) => {
    await fetch(`/api/complaints/${complaintId}`, { method: 'DELETE' });
    fetchData();
  };

  const handleAddComplaint = async (complaint: Complaint) => {
    await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaint)
    });
    fetchData();
  };

  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [sRes, rRes, pRes, cRes] = await Promise.all([
        fetch(`/api/students?t=${Date.now()}`),
        fetch(`/api/rooms?t=${Date.now()}`),
        fetch(`/api/payments?t=${Date.now()}`),
        fetch(`/api/complaints?t=${Date.now()}`)
      ]);

      if (!sRes.ok || !rRes.ok || !pRes.ok || !cRes.ok) {
        throw new Error('Database connection failed. Please restart the server or check the logs.');
      }

      setStudents(await sRes.json());
      setRooms(await rRes.json());
      setPayments(await pRes.json());
      setComplaints(await cRes.json());
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(error.message || "An unexpected error occurred while connecting to the database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Apply dark mode class to html
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Derived Stats
  const stats: DashboardStats = useMemo(() => {
    const activeStudentIds = new Set(students.map(s => s.id));
    const filteredPayments = payments.filter(p => activeStudentIds.has(p.studentId));
    const filteredComplaints = complaints.filter(c => activeStudentIds.has(c.studentId));

    const totalRevenue = filteredPayments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const pendingFees = filteredPayments
      .filter(p => p.status === 'Pending')
      .reduce((sum, p) => sum + p.amount, 0);

    const occupiedRoomsCount = rooms.filter(room => {
      const roomOccupants = students.filter(s => s.roomId === room.id);
      return roomOccupants.length > 0;
    }).length;

    return {
      totalStudents: students.length,
      totalRooms: rooms.length,
      occupiedRooms: occupiedRoomsCount,
      pendingFees,
      totalRevenue,
      openComplaints: filteredComplaints.filter(c => c.status !== 'Resolved').length,
    };
  }, [students, rooms, payments, complaints]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'rooms', label: 'Room Allocation', icon: DoorOpen },
    { id: 'payments', label: 'Fee Payments', icon: CreditCard },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'database', label: 'Database Explorer', icon: Database },
  ];

  const renderView = () => {
    const activeStudentIds = new Set(students.map(s => s.id));
    const filteredPayments = payments.filter(p => activeStudentIds.has(p.studentId));
    const filteredComplaints = complaints.filter(c => activeStudentIds.has(c.studentId));

    switch (view) {
      case 'dashboard':
        return <Dashboard stats={stats} payments={filteredPayments} rooms={rooms} complaints={filteredComplaints} />;
      case 'students':
        return (
          <StudentsList 
            students={students} 
            onAddStudent={handleAddStudent} 
            onDeleteStudent={handleDeleteStudent} 
            rooms={rooms} 
            payments={payments}
            onAddPayment={handleAddPayment}
          />
        );
      case 'rooms':
        return <RoomsList rooms={rooms} onAddRoom={handleAddRoom} onDeleteRoom={handleDeleteRoom} students={students} />;
      case 'payments':
        return <PaymentsList payments={filteredPayments} onAddPayment={handleAddPayment} onDeletePayment={handleDeletePayment} students={students} />;
      case 'complaints':
        return <ComplaintsList 
          complaints={filteredComplaints} 
          onAddComplaint={handleAddComplaint} 
          onUpdateComplaint={async (complaint) => {
            await fetch('/api/complaints', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(complaint)
            });
            fetchData();
          }}
          onDeleteComplaint={handleDeleteComplaint}
          students={students} 
        />;
      case 'database':
        return <DatabaseExplorer students={students} rooms={rooms} payments={payments} complaints={complaints} />;
      default:
        return <Dashboard stats={stats} payments={filteredPayments} rooms={rooms} complaints={filteredComplaints} />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (isLoading || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-bg-dark p-4">
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          {error ? (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Database Error</h2>
                <p className="text-text-secondary">{error}</p>
              </div>
              <button 
                onClick={() => fetchData()}
                className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium transition-colors"
              >
                Retry Connection
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-text-secondary font-medium animate-pulse">Connecting to SQL Database...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-bg-dark text-[#1A1A1A] dark:text-text-primary transition-colors duration-300 font-sans">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-screen bg-white dark:bg-sidebar-bg border-r border-[#E5E7EB] dark:border-border z-50 transition-all duration-300 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "w-60 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-6 h-20">
            <div className="bg-accent rounded-lg p-2 w-10 h-10 flex items-center justify-center">
              <span className="text-white font-black text-xl">H</span>
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-xl tracking-tight text-[#1A1A1A] dark:text-accent"
              >
                HostelHub
              </motion.span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 space-y-px">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id as View);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-6 py-3.5 transition-all duration-200 group relative text-sm font-medium",
                  view === item.id 
                    ? "bg-blue-50/50 dark:bg-accent/10 text-accent border-r-3 border-accent" 
                    : "text-gray-500 dark:text-text-secondary hover:bg-gray-50 dark:hover:bg-white/5 dark:hover:text-text-primary"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  view === item.id ? "text-accent" : "group-hover:text-accent transition-colors"
                )} />
                {isSidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-[#F3F4F6] dark:border-border">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 w-full px-3 py-3 rounded-xl text-gray-500 dark:text-text-secondary hover:bg-red-50 hover:text-red-500 dark:hover:bg-danger/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 min-h-screen",
        isSidebarOpen ? "lg:ml-60" : "lg:ml-20"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 h-20 bg-white/80 dark:bg-bg-dark/80 backdrop-blur-md border-b dark:border-border">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-semibold capitalize hidden md:block">
              {view === 'dashboard' ? 'Hostel Overview' : view.replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-sidebar-bg hover:ring-2 ring-accent/20 transition-all border dark:border-border"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="w-px h-6 bg-[#E5E7EB] dark:bg-border" />
            
            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-card-bg border dark:border-border rounded-lg grayscale hover:grayscale-0 transition-all cursor-pointer shadow-sm">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user}</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-success rounded-full" />
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest leading-none">Online</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-600 border border-border" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <section className="p-8 max-w-screen-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
