import { useState } from 'react';
import { 
  Plus, 
  DoorOpen, 
  Users, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Room, Student } from '../types';
import { generateId, cn } from '../lib/utils';
import Modal from './Modal';

interface RoomsListProps {
  rooms: Room[];
  onAddRoom: (room: Room) => void;
  onDeleteRoom: (id: string) => void;
  students: Student[];
}

export default function RoomsList({ rooms, onAddRoom, onDeleteRoom, students }: RoomsListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    type: 'Single',
    capacity: 1,
    currentOccupants: 0,
    status: 'Available'
  });

  const handleAddRoom = () => {
    if (newRoom.number) {
      const room: Room = {
        id: generateId(),
        number: newRoom.number || '',
        type: newRoom.type as any || 'Single',
        capacity: newRoom.capacity || 1,
        currentOccupants: 0,
        status: 'Available',
        pricePerMonth: newRoom.pricePerMonth || 500
      };
      onAddRoom(room);
      setIsAddModalOpen(false);
      setNewRoom({ type: 'Single', capacity: 1, currentOccupants: 0, status: 'Available' });
    }
  };

  const deleteRoom = () => {
    if (roomToDelete) {
      onDeleteRoom(roomToDelete);
      setRoomToDelete(null);
    }
  };

  const getOccupants = (roomId: string) => {
    return students.filter(s => s.roomId === roomId);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-card-bg p-6 rounded-xl border dark:border-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold">Room Allocation</h2>
          <p className="text-sm text-text-secondary">Manage rooms and student assignments</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-all font-semibold shadow-md shadow-accent/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Room</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rooms.map((room) => {
          const occupants = getOccupants(room.id);
          const currentOccupantCount = occupants.length;
          const occupancyRate = (currentOccupantCount / room.capacity) * 100;
          const isFull = currentOccupantCount >= room.capacity;
          
          return (
            <div 
              key={room.id}
              className="bg-white dark:bg-card-bg p-5 rounded-xl border border-[#E5E7EB] dark:border-border hover:shadow-lg transition-all flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center border",
                    isFull ? "bg-accent/10 text-accent border-accent/20" : "bg-success/10 text-success border-success/20"
                  )}>
                    <DoorOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold dark:text-white leading-tight">{room.number}</h3>
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">{room.type}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                  isFull ? "bg-accent/10 text-accent" : "bg-success/10 text-success"
                )}>
                  {isFull ? 'Full' : 'Available'}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setRoomToDelete(room.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-danger/10 text-danger transition-colors ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-4 mt-auto">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-text-secondary">Fee</span>
                  <span className="text-accent">₹{room.pricePerMonth}/mo</span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter text-text-secondary">
                    <span>Capacity</span>
                    <span>{currentOccupantCount}/{room.capacity}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 dark:bg-bg-dark rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-500",
                        occupancyRate >= 100 ? "bg-accent" : occupancyRate > 0 ? "bg-accent/60" : "bg-transparent"
                      )}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                </div>

                {occupants.length > 0 && (
                  <div className="pt-4 border-t border-[#F3F4F6] dark:border-border flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {occupants.map((student) => (
                        <div 
                          key={student.id} 
                          title={student.name}
                          className="w-7 h-7 rounded-full bg-slate-600 border-2 border-white dark:border-card-bg flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm"
                        >
                          {student.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-text-secondary">
                      <Users className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Register New Room"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">Room Number</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. 301"
              value={newRoom.number || ''}
              onChange={(e) => setNewRoom({...newRoom, number: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Room Type</label>
              <select 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 outline-none transition-all"
                value={newRoom.type || 'Single'}
                onChange={(e) => {
                  const type = e.target.value;
                  const capacity = type === 'Single' ? 1 : type === 'Double' ? 2 : type === 'Triple' ? 3 : 4;
                  setNewRoom({...newRoom, type: type as any, capacity});
                }}
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
                <option value="Quad">Quad</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Monthly Price (₹)</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-blue-500 outline-none transition-all"
                placeholder="5000"
                value={newRoom.pricePerMonth || ''}
                onChange={(e) => setNewRoom({...newRoom, pricePerMonth: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-500/5 p-4 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
              New rooms are automatically set to 'Available' status. You can assign students from the Students tab.
            </p>
          </div>
          <button 
            onClick={handleAddRoom}
            className="w-full py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-all shadow-xl shadow-accent/20"
          >
            Create Room
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!roomToDelete}
        onClose={() => setRoomToDelete(null)}
        title="Confirm Deletion"
      >
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold">Remove Room?</h3>
            <p className="text-sm text-text-secondary">
              Are you sure you want to delete this room? This will also remove current occupancy data.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setRoomToDelete(null)}
              className="flex-1 py-3 bg-gray-100 dark:bg-white/5 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={deleteRoom}
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
