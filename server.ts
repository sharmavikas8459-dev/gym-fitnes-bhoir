import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { dbService } from "./src/dbService.js";
import { PLANS, calculateExpiryDate } from "./src/gymUtils.js";
import { PlanId } from "./src/types.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Simple token-based authentication middleware
  const adminCredentials = {
    username: "bhoir3777",
    password: "swara3777"
  };

  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Access denied. No token provided." });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (token.startsWith("bhoir_secure_token_")) {
      next();
    } else {
      res.status(403).json({ error: "Invalid token." });
    }
  };

  // Helper to format date from YYYY-MM-DD to DD-MM-YYYY
  const formatToIndianDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Helper to trigger notification logging
  const sendNotificationLogs = (memberName: string, mobile: string, planName: string, price: number, purchaseDate: string, expiryDate: string) => {
    const purchaseFormatted = formatToIndianDate(purchaseDate);
    const expiryFormatted = formatToIndianDate(expiryDate);
    
    const messageContent = `Welcome to Bhoir Fitness & Gym.

Member Name: ${memberName}
Plan: ${planName} (₹${price})
Purchase Date: ${purchaseFormatted}
Expiry Date: ${expiryFormatted}

Thank you for joining Bhoir Fitness & Gym.
For support, contact Nitesh Bhoir.`;

    console.log(`[SIMULATED NOTIFICATION SENT TO ${mobile}]`);
    console.log(messageContent);
    return messageContent;
  };

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Admin login endpoint
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (username === adminCredentials.username && password === adminCredentials.password) {
      const token = "bhoir_secure_token_" + Date.now();
      res.json({
        success: true,
        token,
        user: {
          username: adminCredentials.username,
          name: "Nitesh Bhoir",
          role: "Gym Owner"
        }
      });
    } else {
      res.status(401).json({ success: false, error: "Invalid username or password" });
    }
  });

  // Dashboard Stats
  app.get("/api/stats", authMiddleware, (req, res) => {
    try {
      const stats = dbService.getStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Members List with filters
  app.get("/api/members", authMiddleware, (req, res) => {
    try {
      const { search, status, planId } = req.query;
      const members = dbService.getMembers(
        search as string,
        status as string,
        planId as string
      );
      res.json(members);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Member Detail
  app.get("/api/members/:id", authMiddleware, (req, res) => {
    try {
      const data = dbService.getMember(req.params.id);
      if (!data.member) {
        res.status(404).json({ error: "Member not found" });
        return;
      }
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Add Member
  app.post("/api/members", authMiddleware, (req, res) => {
    try {
      const { fullName, mobile, planId, joiningDate, amountPaid } = req.body;
      if (!fullName || !mobile || !planId || !joiningDate || amountPaid === undefined) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const member = dbService.addMember(fullName, mobile, planId as PlanId, joiningDate, Number(amountPaid));
      
      // Auto-trigger WhatsApp/SMS simulation
      const planName = PLANS[planId as PlanId].name;
      const smsMessage = sendNotificationLogs(fullName, mobile, planName, Number(amountPaid), joiningDate, member.expiryDate);
      
      res.status(201).json({ member, smsMessage });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update Member
  app.put("/api/members/:id", authMiddleware, (req, res) => {
    try {
      const { fullName, mobile, planId, amountPaid, joiningDate } = req.body;
      if (!fullName || !mobile || !planId || amountPaid === undefined || !joiningDate) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const member = dbService.updateMember(req.params.id, fullName, mobile, planId as PlanId, Number(amountPaid), joiningDate);
      res.json(member);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Renew Member
  app.post("/api/members/:id/renew", authMiddleware, (req, res) => {
    try {
      const { planId, purchaseDate, amountPaid } = req.body;
      if (!planId || !purchaseDate || amountPaid === undefined) {
        res.status(400).json({ error: "Missing required renewal fields" });
        return;
      }

      const { member, renewal } = dbService.renewMember(req.params.id, planId as PlanId, purchaseDate, Number(amountPaid));
      
      // Trigger WhatsApp/SMS notification simulation
      const planName = PLANS[planId as PlanId].name;
      const smsMessage = sendNotificationLogs(member.fullName, member.mobile, planName, Number(amountPaid), purchaseDate, renewal.expiryDate);

      res.json({ member, renewal, smsMessage });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete Member
  app.delete("/api/members/:id", authMiddleware, (req, res) => {
    try {
      const result = dbService.deleteMember(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Logs endpoint
  app.get("/api/logs", authMiddleware, (req, res) => {
    try {
      const logs = dbService.getActivityLogs();
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
