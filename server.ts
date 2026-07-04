import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function seedDatabase() {
  const roomCount = await prisma.room.count();
  if (roomCount === 0) {
    const INITIAL_ROOMS = [
      { id: '1', number: '101', type: 'Double', status: 'Available', capacity: 2, currentOccupants: 0, pricePerMonth: 500 },
      { id: '2', number: '102', type: 'Single', status: 'Available', capacity: 1, currentOccupants: 0, pricePerMonth: 800 },
      { id: '3', number: '201', type: 'Double', status: 'Available', capacity: 2, currentOccupants: 0, pricePerMonth: 500 },
      { id: '4', number: '202', type: 'Triple', status: 'Available', capacity: 3, currentOccupants: 0, pricePerMonth: 400 },
      { id: '5', number: '301', type: 'Quad', status: 'Available', capacity: 4, currentOccupants: 0, pricePerMonth: 300 }
    ];
    
    for (const r of INITIAL_ROOMS) {
      await prisma.room.upsert({
        where: { id: r.id },
        update: {},
        create: r
      });
    }

    const INITIAL_STUDENTS = [
      {
        id: '4logzrt',
        name: 'jai',
        email: 'jai@gmail.com',
        phone: '147896325',
        roomNumber: '101',
        roomId: '1',
        course: 'EEE',
        admissionDate: '2026-05-05',
        status: 'Active'
      }
    ];

    for (const s of INITIAL_STUDENTS) {
      await prisma.student.upsert({
        where: { id: s.id },
        update: {},
        create: s
      });
    }

    // Initialize room occupants for the seeded student
    await prisma.room.update({
      where: { id: '1' },
      data: { currentOccupants: 1, status: 'Available' }
    });
    // Seed Payments
    const INITIAL_PAYMENTS = [
      {
        id: '1',
        studentId: '4logzrt',
        studentName: 'jai',
        roomNumber: '101',
        amount: 500,
        date: '2026-05-05',
        month: 'May 2026',
        status: 'Paid',
        method: 'Online'
      }
    ];

    for (const p of INITIAL_PAYMENTS) {
      await prisma.payment.upsert({
        where: { id: p.id },
        update: {},
        create: p
      });
    }

    // Seed Complaints
    const INITIAL_COMPLAINTS = [
      {
        id: '1',
        studentId: '4logzrt',
        studentName: 'jai',
        roomNumber: '101',
        title: 'Fan Noise',
        description: 'The ceiling fan is making clicking noise.',
        date: '2026-05-06',
        status: 'Pending',
        priority: 'Medium'
      }
    ];

    for (const c of INITIAL_COMPLAINTS) {
      await prisma.complaint.upsert({
        where: { id: c.id },
        update: {},
        create: c
      });
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Middleware to disable caching for API routes
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
  });

  // Database Status and Schema
  app.get("/api/database/info", async (req, res) => {
    try {
      // Fetch table names dynamically from the SQLite master table
      const tableRows = await prisma.$queryRawUnsafe(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations'"
      ) as { name: string }[];
      
      const tables = tableRows.map(row => row.name);
      
      const info = await Promise.all(tables.map(async (name) => {
        let count = 0;
        try {
          const countResult = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${name}"`) as any[];
          if (countResult && countResult[0]) {
            const val = Object.values(countResult[0])[0];
            count = typeof val === 'bigint' ? Number(val) : Number(val || 0);
          }
        } catch (e) {
          console.error(`Error counting rows for table ${name}:`, e);
        }

        // Get columns using raw query (PRAGMA works in SQLite)
        const rawColumns = await prisma.$queryRawUnsafe(`PRAGMA table_info("${name}")`) as any[];
        
        // Convert BigInt to Number for JSON serialization
        const columns = rawColumns.map(col => {
          const newCol: any = {};
          for (const key in col) {
            newCol[key] = typeof col[key] === 'bigint' ? Number(col[key]) : col[key];
          }
          return newCol;
        });

        // Get table creation SQL statement (DDL) dynamically from SQLite master
        let sql = "";
        try {
          const sqlResult = await prisma.$queryRawUnsafe(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${name}'`) as any[];
          if (sqlResult && sqlResult[0]) {
            sql = sqlResult[0].sql || "";
          }
        } catch (e) {
          console.error(`Error fetching DDL for table ${name}:`, e);
        }

        return {
          name,
          columns,
          rowCount: count,
          sql: sql || `-- DDL definition not found for ${name}`
        };
      }));

      // Generate the full schema DDL dynamically by joining individual tables
      const fullDdl = `-- ===================================================\n` +
                      `-- HOSTEL MANAGEMENT SYSTEM - DYNAMIC SQL DATABASE SCHEMA\n` +
                      `-- Retrieved dynamically from SQLite master catalog\n` +
                      `-- Generated at: ${new Date().toISOString()}\n` +
                      `-- ===================================================\n\n` +
                      info.map(t => t.sql + ";").join("\n\n");

      res.json({
        database: "hostel.db (via Dynamic Introspection)",
        tables: info,
        fullDdl
      });
    } catch (error) {
      console.error("Error fetching db info:", error);
      res.status(500).json({ error: "Failed to fetch database info" });
    }
  });

  // Raw SQL Query Executor (Allows running SELECT and custom queries directly)
  app.post("/api/database/query", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "A valid SQL query is required" });
      }

      // Execute query raw
      const rawResult = await prisma.$queryRawUnsafe(query);
      
      // Safe BigInt formatting for JSON compatibility
      const result = JSON.parse(JSON.stringify(rawResult, (key, value) => 
        typeof value === 'bigint' ? Number(value) : value
      ));

      res.json({
        success: true,
        query,
        data: result
      });
    } catch (error: any) {
      console.error("Error running raw SQL:", error);
      res.status(400).json({ 
        success: false, 
        error: error.message || "An error occurred while executing the SQL query." 
      });
    }
  });

  // API Routes
  
  // Students
  app.get("/api/students", async (req, res) => {
    try {
      const students = await prisma.student.findMany();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const s = req.body;
      const oldStudent = await prisma.student.findUnique({ where: { id: s.id } });
      
      const student = await prisma.student.upsert({
        where: { id: s.id },
        update: {
          name: s.name,
          email: s.email,
          phone: s.phone,
          roomNumber: s.roomNumber,
          roomId: s.roomId ?? null,
          course: s.course,
          admissionDate: s.admissionDate,
          status: s.status
        },
        create: {
          id: s.id,
          name: s.name,
          email: s.email,
          phone: s.phone,
          roomNumber: s.roomNumber,
          roomId: s.roomId ?? null,
          course: s.course,
          admissionDate: s.admissionDate,
          status: s.status
        }
      });
      
      // Helper function to update room occupancy
      const updateRoomOccupancy = async (roomId: string) => {
        const count = await prisma.student.count({ where: { roomId } });
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (room) {
          const status = count >= room.capacity ? 'Full' : 'Available';
          await prisma.room.update({
            where: { id: roomId },
            data: { currentOccupants: count, status }
          });
        }
      };

      // Update new room occupancy
      if (s.roomId) {
        await updateRoomOccupancy(s.roomId);
      }

      // Update old room if it changed
      if (oldStudent && oldStudent.roomId && oldStudent.roomId !== s.roomId) {
        await updateRoomOccupancy(oldStudent.roomId);
      }

      res.status(201).json(student);
    } catch (error) {
      console.error("Error saving student:", error);
      res.status(500).json({ error: "Failed to save student" });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      const student = await prisma.student.findUnique({ where: { id: req.params.id } });
      await prisma.student.delete({ where: { id: req.params.id } });
      
      if (student && student.roomId) {
        const count = await prisma.student.count({ where: { roomId: student.roomId } });
        const room = await prisma.room.findUnique({ where: { id: student.roomId } });
        if (room) {
          const status = count >= room.capacity ? 'Full' : 'Available';
          await prisma.room.update({
            where: { id: student.roomId },
            data: { currentOccupants: count, status }
          });
        }
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  // Rooms
  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await prisma.room.findMany();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      const r = req.body;
      const room = await prisma.room.upsert({
        where: { id: r.id },
        update: {
          number: r.number,
          type: r.type,
          status: r.status,
          capacity: r.capacity,
          currentOccupants: r.currentOccupants,
          pricePerMonth: r.pricePerMonth
        },
        create: r
      });
      res.status(201).json(room);
    } catch (error) {
      console.error("Error saving room:", error);
      res.status(500).json({ error: "Failed to save room" });
    }
  });

  app.delete("/api/rooms/:id", async (req, res) => {
    try {
      await prisma.room.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting room:", error);
      res.status(500).json({ error: "Failed to delete room" });
    }
  });

  // Payments
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await prisma.payment.findMany();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const p = req.body;
      const payment = await prisma.payment.upsert({
        where: { id: p.id },
        update: {
          studentId: p.studentId,
          studentName: p.studentName,
          roomNumber: p.roomNumber,
          amount: p.amount,
          date: p.date,
          month: p.month,
          status: p.status,
          method: p.method
        },
        create: p
      });
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error saving payment:", error);
      res.status(500).json({ error: "Failed to save payment" });
    }
  });

  app.delete("/api/payments/:id", async (req, res) => {
    try {
      await prisma.payment.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json({ error: "Failed to delete payment" });
    }
  });

  // Complaints
  app.get("/api/complaints", async (req, res) => {
    try {
      const complaints = await prisma.complaint.findMany();
      res.json(complaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      res.status(500).json({ error: "Failed to fetch complaints" });
    }
  });

  app.post("/api/complaints", async (req, res) => {
    try {
      const c = req.body;
      const complaint = await prisma.complaint.upsert({
        where: { id: c.id },
        update: {
          studentId: c.studentId,
          studentName: c.studentName,
          roomNumber: c.roomNumber,
          title: c.title,
          description: c.description,
          date: c.date,
          status: c.status,
          priority: c.priority
        },
        create: c
      });
      res.status(201).json(complaint);
    } catch (error) {
      console.error("Error saving complaint:", error);
      res.status(500).json({ error: "Failed to save complaint" });
    }
  });

  app.delete("/api/complaints/:id", async (req, res) => {
    try {
      await prisma.complaint.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting complaint:", error);
      res.status(500).json({ error: "Failed to delete complaint" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Seed database asynchronously in the background so boot is fast
    seedDatabase()
      .then(() => console.log("Database seeded successfully if needed"))
      .catch((err) => console.error("Database seeding failed:", err));
  });
}

startServer();
