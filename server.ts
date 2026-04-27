import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type LeadRecord = {
  id: string;
  name: string;
  phone: string;
  city: string;
  service: string;
  message: string;
  source: string;
  sourceIp: string;
  createdAt: string;
};

type AdminAuditRecord = {
  id: string;
  adminEmail: string;
  action: "view_leads" | "export_leads";
  metadata: Record<string, unknown>;
  sourceIp: string;
  createdAt: string;
};

const normalizeLeadSource = (rawSource: unknown, rawService: unknown) => {
  const source = String(rawSource || "").trim().toLowerCase();
  if (["products_flow", "conversion_form", "whatsapp_fallback"].includes(source)) {
    return source;
  }

  const service = String(rawService || "").toLowerCase();
  if (service.includes("product consultation")) return "products_flow";
  return "conversion_form";
};

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "elyrazen.in@gmail.com").toLowerCase();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const LEAD_WEBHOOK_URL = process.env.LEAD_WEBHOOK_URL;
  const leadRateLimitMs = Number(process.env.LEAD_RATE_LIMIT_MS || 60000);
  const leadRateLimitMap = new Map<string, number>();
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  app.use(cors());
  app.use(express.json());

  // Supabase Connection
  let supabase: SupabaseClient | null = null;
  let isDbConnected = false;
  let dbStatusMessage = "Connected (Local File Fallback)";

  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { error } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .limit(1);

      if (error) throw error;

      console.log("Connected to Supabase");
      isDbConnected = true;
      dbStatusMessage = "Connected (Supabase)";
    } catch (err) {
      console.error("Supabase connection error:", err);
      supabase = null;
    }
  } else {
    console.log("Supabase credentials not found in environment. Using local file fallback.");
  }

  // Function to get fallback products from local JSON
  const getLocalProducts = async () => {
    try {
      const dataPath = path.join(__dirname, "data", "products.json");
      const fileContent = await fs.readFile(dataPath, "utf-8");
      return JSON.parse(fileContent);
    } catch (e) {
      return [];
    }
  };

  const getLocalCaseStudies = async () => {
    try {
      const dataPath = path.join(__dirname, "data", "case-studies.json");
      const fileContent = await fs.readFile(dataPath, "utf-8");
      return JSON.parse(fileContent);
    } catch (e) {
      return [];
    }
  };

  const saveLead = async (lead: LeadRecord) => {
    if (supabase && isDbConnected) {
      const dbLead = {
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        city: lead.city,
        service: lead.service,
        message: lead.message,
        source: lead.source,
        sourceip: lead.sourceIp,
        createdat: lead.createdAt,
      };
      const { error } = await supabase.from("leads").insert(dbLead);
      if (error) throw error;
      return;
    }

    const dataPath = path.join(__dirname, "data", "leads.json");
    const fileContent = await fs.readFile(dataPath, "utf-8").catch(() => "[]");
    const leads = JSON.parse(fileContent) as Array<LeadRecord>;
    leads.push(lead);
    await fs.writeFile(dataPath, JSON.stringify(leads, null, 2), "utf-8");
  };

  const getLocalLeads = async () => {
    try {
      const dataPath = path.join(__dirname, "data", "leads.json");
      const fileContent = await fs.readFile(dataPath, "utf-8");
      return JSON.parse(fileContent) as Array<Partial<LeadRecord>>;
    } catch (e) {
      return [] as Array<Partial<LeadRecord>>;
    }
  };

  const getLocalAdminAuditLogs = async () => {
    try {
      const dataPath = path.join(__dirname, "data", "admin-audit-logs.json");
      const fileContent = await fs.readFile(dataPath, "utf-8");
      return JSON.parse(fileContent) as Array<Partial<AdminAuditRecord>>;
    } catch (e) {
      return [] as Array<Partial<AdminAuditRecord>>;
    }
  };

  const saveAdminAuditLog = async (audit: AdminAuditRecord) => {
    if (supabase && isDbConnected) {
      const { error } = await supabase.from("admin_audit_logs").insert({
        id: audit.id,
        admin_email: audit.adminEmail,
        action: audit.action,
        metadata: audit.metadata,
        sourceip: audit.sourceIp,
        createdat: audit.createdAt,
      });

      if (error) {
        throw error;
      }
      return;
    }

    const dataPath = path.join(__dirname, "data", "admin-audit-logs.json");
    const logs = await getLocalAdminAuditLogs();
    logs.push(audit);
    await fs.writeFile(dataPath, JSON.stringify(logs, null, 2), "utf-8");
  };

  const getAdminEmailFromRequest = async (req: express.Request) => {
    if (!supabase) {
      return { error: "Supabase is not configured", status: 500 as const };
    }

    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return { error: "Missing bearer token", status: 401 as const };
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return { error: "Invalid or expired session", status: 401 as const };
    }

    const email = String(data.user.email || "").toLowerCase();
    if (email !== ADMIN_EMAIL) {
      return { error: "Forbidden", status: 403 as const };
    }

    return { email };
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      database: dbStatusMessage
    });
  });

  // Seed Route: Upsert local JSON data to Supabase products table
  app.post("/api/seed", async (req, res) => {
    if (!supabase || !isDbConnected) {
      return res.status(400).json({ error: "DB not connected. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first." });
    }
    
    try {
      const localProducts = await getLocalProducts();
      const productsToUpsert = localProducts.map((product: Record<string, unknown>) => ({
        id: String(product.id || ""),
        name: String(product.name || ""),
        description: String(product.description || ""),
        category: String(product.category || ""),
        brand: String(product.brand || ""),
        protocol: String(product.protocol || ""),
        installavailable: Boolean(product.installAvailable),
        popular: Boolean(product.popular),
        imageurl: String(product.imageUrl || ""),
        price: String(product.price || ""),
      }));

      const { error } = await supabase
        .from("products")
        .upsert(productsToUpsert, { onConflict: "id" });

      if (error) throw error;

      res.json({ message: "Supabase products synchronized successfully", count: productsToUpsert.length });
    } catch (err) {
      res.status(500).json({ error: "Seeding failed", detail: err });
    }
  });

  // Main Products Route (Supabase first, then local)
  app.get("/api/products", async (req, res) => {
    try {
      if (supabase && isDbConnected) {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("id", { ascending: true });

        if (!error && data && data.length > 0) {
          const normalizedProducts = data.map((product) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.category,
            brand: product.brand,
            protocol: product.protocol,
            installAvailable: product.installavailable,
            popular: product.popular,
            imageUrl: product.imageurl,
            price: product.price,
          }));
          return res.json(normalizedProducts);
        }

        if (error) {
          console.error("Supabase fetch error:", error);
        }
      }
      
      // Fallback if Supabase is unavailable or empty
      const localProducts = await getLocalProducts();
      res.json(localProducts);
    } catch (err) {
      console.error("Fetch error:", err);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/case-studies", async (req, res) => {
    try {
      const caseStudies = await getLocalCaseStudies();
      res.json(caseStudies);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch case studies" });
    }
  });

  app.get("/api/metrics/conversions", async (req, res) => {
    try {
      const days = Math.min(90, Math.max(1, Number(req.query.days) || 14));
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - (days - 1));

      const dailyMap: Record<string, number> = {};
      const sourceMap: Record<string, number> = {};

      for (let i = 0; i < days; i += 1) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        dailyMap[key] = 0;
      }

      const consumeLead = (createdAtRaw: unknown, sourceRaw: unknown, serviceRaw: unknown) => {
        if (!createdAtRaw) return;
        const createdDate = new Date(String(createdAtRaw));
        if (Number.isNaN(createdDate.getTime())) return;
        if (createdDate < startDate) return;

        const dayKey = createdDate.toISOString().slice(0, 10);
        if (!(dayKey in dailyMap)) return;

        dailyMap[dayKey] += 1;
        const source = normalizeLeadSource(sourceRaw, serviceRaw);
        sourceMap[source] = (sourceMap[source] || 0) + 1;
      };

      if (supabase && isDbConnected) {
        const { data, error } = await supabase
          .from("leads")
          .select("createdat, source, service")
          .gte("createdat", startDate.toISOString())
          .order("createdat", { ascending: true });

        if (!error && data) {
          data.forEach((lead) => consumeLead(lead.createdat, (lead as { source?: string }).source, lead.service));
        } else {
          const localLeads = await getLocalLeads();
          localLeads.forEach((lead) => consumeLead(lead.createdAt, lead.source, lead.service));
        }
      } else {
        const localLeads = await getLocalLeads();
        localLeads.forEach((lead) => consumeLead(lead.createdAt, lead.source, lead.service));
      }

      return res.json({
        rangeDays: days,
        totalLeads: Object.values(dailyMap).reduce((sum, value) => sum + value, 0),
        daily: Object.entries(dailyMap).map(([date, count]) => ({ date, count })),
        sourceSplit: Object.entries(sourceMap)
          .map(([source, count]) => ({ source, count }))
          .sort((a, b) => b.count - a.count),
      });
    } catch (err) {
      return res.status(500).json({ error: "Failed to compute conversion metrics" });
    }
  });

  app.get("/api/admin/leads", async (req, res) => {
    try {
      const adminAuth = await getAdminEmailFromRequest(req);
      if ("error" in adminAuth) {
        return res.status(adminAuth.status).json({ error: adminAuth.error });
      }
      const adminEmail = adminAuth.email;

      const query = String(req.query.query || "").trim().toLowerCase();

      if (isDbConnected) {
        const { data: leadRows, error: leadsError } = await supabase
          .from("leads")
          .select("id, name, phone, city, service, message, source, createdat")
          .order("createdat", { ascending: false })
          .limit(1000);

        if (leadsError) {
          return res.status(500).json({ error: "Failed to load leads" });
        }

        const leads = (leadRows || []).map((lead) => ({
          id: String(lead.id || ""),
          name: String(lead.name || ""),
          phone: String(lead.phone || ""),
          city: String(lead.city || ""),
          service: String(lead.service || ""),
          message: String(lead.message || ""),
          source: normalizeLeadSource((lead as { source?: string }).source, lead.service),
          createdAt: String(lead.createdat || ""),
        }));

        const filtered = query
          ? leads.filter((lead) =>
              [lead.name, lead.phone, lead.city, lead.service, lead.source, lead.message]
                .join(" ")
                .toLowerCase()
                .includes(query),
            )
          : leads;

        await saveAdminAuditLog({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          adminEmail,
          action: "view_leads",
          metadata: {
            query: query || null,
            resultCount: filtered.length,
          },
          sourceIp: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown",
          createdAt: new Date().toISOString(),
        });

        return res.json({ leads: filtered });
      }

      const localLeads = await getLocalLeads();
      const leads = localLeads
        .map((lead) => ({
          id: String(lead.id || ""),
          name: String(lead.name || ""),
          phone: String(lead.phone || ""),
          city: String(lead.city || ""),
          service: String(lead.service || ""),
          message: String(lead.message || ""),
          source: normalizeLeadSource(lead.source, lead.service),
          createdAt: String(lead.createdAt || ""),
        }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      const filtered = query
        ? leads.filter((lead) =>
            [lead.name, lead.phone, lead.city, lead.service, lead.source, lead.message]
              .join(" ")
              .toLowerCase()
              .includes(query),
          )
        : leads;

      await saveAdminAuditLog({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        adminEmail,
        action: "view_leads",
        metadata: {
          query: query || null,
          resultCount: filtered.length,
        },
        sourceIp: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown",
        createdAt: new Date().toISOString(),
      });

      return res.json({ leads: filtered });
    } catch (err) {
      return res.status(500).json({ error: "Failed to load admin leads" });
    }
  });

  app.post("/api/admin/audit", async (req, res) => {
    try {
      const adminAuth = await getAdminEmailFromRequest(req);
      if ("error" in adminAuth) {
        return res.status(adminAuth.status).json({ error: adminAuth.error });
      }

      const actionRaw = String(req.body?.action || "").trim().toLowerCase();
      if (!["view_leads", "export_leads"].includes(actionRaw)) {
        return res.status(400).json({ error: "Invalid action" });
      }

      const metadata = typeof req.body?.metadata === "object" && req.body?.metadata !== null
        ? req.body.metadata as Record<string, unknown>
        : {};

      await saveAdminAuditLog({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        adminEmail: adminAuth.email,
        action: actionRaw as "view_leads" | "export_leads",
        metadata,
        sourceIp: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown",
        createdAt: new Date().toISOString(),
      });

      return res.status(201).json({ message: "Audit logged" });
    } catch (err) {
      return res.status(500).json({ error: "Failed to save audit log" });
    }
  });

  app.get("/api/admin/audit", async (req, res) => {
    try {
      const adminAuth = await getAdminEmailFromRequest(req);
      if ("error" in adminAuth) {
        return res.status(adminAuth.status).json({ error: adminAuth.error });
      }

      const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 100));

      if (supabase && isDbConnected) {
        const { data, error } = await supabase
          .from("admin_audit_logs")
          .select("id, admin_email, action, metadata, sourceip, createdat")
          .order("createdat", { ascending: false })
          .limit(limit);

        if (error) {
          return res.status(500).json({ error: "Failed to load audit logs" });
        }

        return res.json({
          logs: (data || []).map((log) => ({
            id: String(log.id || ""),
            adminEmail: String(log.admin_email || ""),
            action: String(log.action || ""),
            metadata: (log.metadata || {}) as Record<string, unknown>,
            sourceIp: String(log.sourceip || ""),
            createdAt: String(log.createdat || ""),
          })),
        });
      }

      const localLogs = await getLocalAdminAuditLogs();
      const logs = localLogs
        .map((log) => ({
          id: String(log.id || ""),
          adminEmail: String(log.adminEmail || ""),
          action: String(log.action || ""),
          metadata: (log.metadata || {}) as Record<string, unknown>,
          sourceIp: String(log.sourceIp || ""),
          createdAt: String(log.createdAt || ""),
        }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit);

      return res.json({ logs });
    } catch (err) {
      return res.status(500).json({ error: "Failed to load audit logs" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
      const now = Date.now();
      const lastSubmission = leadRateLimitMap.get(clientIp);

      if (lastSubmission && now - lastSubmission < leadRateLimitMs) {
        return res.status(429).json({ error: "Too many requests. Please wait before retrying." });
      }

      const { name, phone, city, service, message, website, source } = req.body || {};

      // Honeypot field must stay empty for human users.
      if (website) {
        return res.status(400).json({ error: "Invalid submission" });
      }

      const normalizedName = String(name || "").trim();
      const normalizedPhone = String(phone || "").trim();
      const normalizedCity = String(city || "").trim();
      const normalizedService = String(service || "").trim();
      const normalizedMessage = String(message || "").trim();
      const normalizedSource = normalizeLeadSource(source, normalizedService);

      if (!normalizedName || !normalizedPhone || !normalizedCity || !normalizedService) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (!/^[0-9+()\-\s]{10,20}$/.test(normalizedPhone)) {
        return res.status(400).json({ error: "Invalid phone number" });
      }

      if (normalizedName.length > 80 || normalizedCity.length > 80 || normalizedService.length > 120 || normalizedMessage.length > 500) {
        return res.status(400).json({ error: "Input is too long" });
      }

      const lead = {
        id: Date.now().toString(),
        name: normalizedName,
        phone: normalizedPhone,
        city: normalizedCity,
        service: normalizedService,
        message: normalizedMessage,
        source: normalizedSource,
        sourceIp: clientIp,
        createdAt: new Date().toISOString(),
      };

      await saveLead(lead);

      if (LEAD_WEBHOOK_URL) {
        try {
          await fetch(LEAD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(lead),
          });
        } catch (webhookErr) {
          console.error("Lead webhook forwarding failed:", webhookErr);
        }
      }

      leadRateLimitMap.set(clientIp, now);
      return res.status(201).json({ message: "Lead captured successfully", id: lead.id });
    } catch (err) {
      return res.status(500).json({ error: "Failed to save lead" });
    }
  });

  app.get("/api/auth/session", async (req, res) => {
    if (!supabase) {
      return res.status(500).json({ error: "Supabase is not configured" });
    }

    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return res.status(401).json({ error: "Missing bearer token" });
    }

    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) {
        return res.status(401).json({ error: "Invalid or expired session" });
      }

      return res.json({
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata,
      });
    } catch (err) {
      return res.status(500).json({ error: "Failed to validate session" });
    }
  });

  // Vite middleware setup
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

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Stop the existing process or set PORT to an open port before starting the app.`,
      );
      process.exit(1);
    }

    console.error("Server startup failed:", error);
    process.exit(1);
  });
}

startServer();
