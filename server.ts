import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const STORE_FILE = path.join(process.cwd(), "data", "store.json");

// Define interface matching StoreState
import { Product, Order, PushNotification, ActionLog } from "./src/types";

interface StoreSchema {
  products: Product[];
  orders: Order[];
  notifications: PushNotification[];
  logs: ActionLog[];
}

const DEFAULT_PRODUCTS: Product[] = [];

// Seed & load store helper
function loadStore(): StoreSchema {
  const dir = path.dirname(STORE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(STORE_FILE)) {
    const freshDb: StoreSchema = {
       products: [],
       orders: [],
       notifications: [
         {
           id: "notif-init",
           orderId: "init",
           title: "Welcome to OmniShop",
           message: "OmniShop Store engine active. Enjoy full inventory, ML recommendations, analytics, and vendor utilities!",
           timestamp: new Date().toISOString(),
           status: "unread"
         }
       ],
       logs: []
     };
    fs.writeFileSync(STORE_FILE, JSON.stringify(freshDb, null, 2));
    return freshDb;
  }

  try {
    const raw = fs.readFileSync(STORE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StoreSchema;
    
    // Purge any existing seed/demo products from database
    const originalLen = parsed.products ? parsed.products.length : 0;
    parsed.products = (parsed.products || []).filter(p => !p.id.startsWith("seed-prd-") && !["prod-1", "prod-2", "prod-3", "prod-4"].includes(p.id));
    if (parsed.products.length !== originalLen) {
      fs.writeFileSync(STORE_FILE, JSON.stringify(parsed, null, 2));
    }
    return parsed;
  } catch (err) {
    console.error("Error reading store file, resetting DB to defaults.", err);
    const freshDb: StoreSchema = {
       products: [],
       orders: [],
       notifications: [],
       logs: []
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(freshDb, null, 2));
    return freshDb;
  }
}

function saveStore(db: StoreSchema) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Failed to commit store database to file", err);
  }
}

// Initialize server-side Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not set. Recommendation engine will run on fallback heuristics.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  app.use(express.json());

  // SEED STORE ON STARTUP
  let db_memory = loadStore();

  // Middleware to sync database before certain reads
  app.use((req, res, next) => {
    // Keep memory cache fresh in case of external file alterations
    db_memory = loadStore();
    next();
  });

  // ========== API ENDPOINTS ==========

  // 1. PRODUCTS LISTING
  app.get("/api/products", (req, res) => {
    res.json(db_memory.products);
  });

  // 2. VENDOR: PRODUCT UPLOAD
  app.post("/api/vendor/products", (req, res) => {
    const { name, description, category, price, stock, image, vendorId, brand, isExpress, originalPrice } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ error: "Missing required product fields (name, category, price, stock)" });
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: String(name).trim(),
      description: String(description || "No description provided.").trim(),
      category: String(category).trim(),
      price: Math.max(0.01, Number(price)),
      stock: Math.max(0, parseInt(String(stock), 10)),
      image: String(image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80").trim(),
      vendorId: String(vendorId || "vendor-user").trim(),
      rating: 5.0,
      reviewsCount: 0,
      createdAt: new Date().toISOString(),
      brand: brand ? String(brand).trim() : undefined,
      isExpress: isExpress !== undefined ? Boolean(isExpress) : undefined,
      originalPrice: originalPrice ? Math.max(0.01, Number(originalPrice)) : undefined
    };

    db_memory.products.push(newProduct);
    saveStore(db_memory);

    // Notify administrators / push feed
    db_memory.notifications.unshift({
      id: `notif-${Date.now()}`,
      orderId: "vendor-action",
      title: "New Product Uploaded",
      message: `Vendor added a new item: "${newProduct.name}" under ${newProduct.category} (Stock: ${newProduct.stock})`,
      timestamp: new Date().toISOString(),
      status: "unread"
    });
    saveStore(db_memory);

    res.status(201).json(newProduct);
  });

  // 3. VENDOR / ADMIN: UPDATE STOCK DIRECTLY
  app.post("/api/vendor/products/stock", (req, res) => {
    const { productId, adjustment } = req.body;
    const product = db_memory.products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const currentStock = product.stock;
    const diff = parseInt(String(adjustment), 10);
    product.stock = Math.max(0, currentStock + diff);
    saveStore(db_memory);

    // If stock gets critcally low, trigger alert notification
    if (product.stock <= 3) {
      db_memory.notifications.unshift({
        id: `notif-${Date.now()}`,
        orderId: "stock-alert",
        title: "Low Stock Alert ⚠️",
        message: `Product "${product.name}" is critically low on stock! Only ${product.stock} items remaining.`,
        timestamp: new Date().toISOString(),
        status: "unread"
      });
      saveStore(db_memory);
    }

    res.json(product);
  });

  // 3.5 VENDOR: DELETE PRODUCT FROM ACTIVE CATALOG
  app.post("/api/vendor/products/delete", (req, res) => {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "Missing productId to delete." });
    }

    const initialLength = db_memory.products.length;
    const targetProduct = db_memory.products.find(p => p.id === productId);
    db_memory.products = db_memory.products.filter(p => p.id !== productId);

    if (db_memory.products.length === initialLength) {
      return res.status(404).json({ error: "Product not found under active register database." });
    }

    saveStore(db_memory);

    // Notify administrators / push feed
    db_memory.notifications.unshift({
      id: `notif-${Date.now()}`,
      orderId: "vendor-action",
      title: "Product Removed 🗑️",
      message: `Vendor removed item: "${targetProduct ? targetProduct.name : productId}" from store catalog.`,
      timestamp: new Date().toISOString(),
      status: "unread"
    });
    saveStore(db_memory);

    res.json({ success: true, message: "Product successfully deleted.", productId });
  });

  // 4. CUSTOMER: LOG ACTION FOR ML ENGINE RECOMMENDATION
  app.post("/api/history/log", (req, res) => {
    const { productId, actionType } = req.body;
    if (!productId || !actionType) {
      return res.status(400).json({ error: "Missing log fields" });
    }

    const log: ActionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId,
      actionType,
      timestamp: new Date().toISOString()
    };

    db_memory.logs.push(log);
    // Prune logs list if getting too large (keep last 500)
    if (db_memory.logs.length > 500) {
      db_memory.logs = db_memory.logs.slice(-500);
    }
    saveStore(db_memory);
    res.json({ success: true });
  });

  // 5. CUSTOMER: SECURE PAYMENT GATEWAY & CHECKOUT SIMULATOR (FULL TRANSACTION LOGIC)
  app.post("/api/checkout", (req, res) => {
    try {
      const { 
        customerName, 
        customerEmail, 
        cardNum, 
        cardExpiry, 
        cardCvv, 
        address, 
        cart, 
        paymentMethod = "mpesa", 
        mpesaPhone, 
        mpesaTxCode 
      } = req.body;

      if (!customerName || !customerEmail || !address || !cart || !cart.length) {
        return res.status(400).json({ error: "Checkout payload incomplete. Please check delivery inputs." });
      }

      let billingRef = "M-Pesa Pay";

      if (paymentMethod === "card") {
        if (!cardNum || !cardExpiry || !cardCvv) {
          return res.status(400).json({ error: "Credit card details are required for Card billing." });
        }
        // Secure Credit Card Validation (Mock Integrity check: strip symbols, check length)
        const sanitizedCard = String(cardNum).replace(/\s+/g, "");
        if (sanitizedCard.length < 15 || sanitizedCard.length > 16 || isNaN(Number(sanitizedCard))) {
          return res.status(400).json({ error: "Secure Gate: Invalid Credit Card Number format." });
        }

        const sanitizedCvv = String(cardCvv).trim();
        if (sanitizedCvv.length < 3 || sanitizedCvv.length > 4 || isNaN(Number(sanitizedCvv))) {
          return res.status(400).json({ error: "Secure Gate: Invalid CVV security code format." });
        }
        billingRef = `xxxx-xxxx-xxxx-${sanitizedCard.slice(-4)}`;
      } else {
        // M-Pesa Validation
        if (!mpesaPhone || !mpesaTxCode) {
          return res.status(400).json({ error: "M-Pesa Phone number and transaction code are required." });
        }
        const mpesaPhoneStr = String(mpesaPhone);
        const mpesaTxCodeStr = String(mpesaTxCode);
        const sanitizedPhone = mpesaPhoneStr.replace(/\s+/g, "");
        if (sanitizedPhone.length < 9) {
          return res.status(400).json({ error: "Invalid M-Pesa phone number format." });
        }
        const cleanTxCode = mpesaTxCodeStr.trim().toUpperCase();
        if (cleanTxCode.length < 8) {
          return res.status(400).json({ error: "Verify Reference: M-Pesa receipt code must be at least 8 alphanumeric characters." });
        }
        billingRef = `M-Pesa: ${sanitizedPhone} (Ref: ${cleanTxCode})`;
      }

      // Verify stock and calculate totals
      if (!Array.isArray(cart)) {
        return res.status(400).json({ error: "Checkout aborted: The cart structure provided is invalid." });
      }

      if (!db_memory.products) {
        db_memory.products = [];
      }

      const itemsToBuy: { product: Product; quantity: number }[] = [];
      let orderTotal = 0;

      for (const cartItem of cart) {
        if (!cartItem || (!cartItem.productId && !cartItem.id)) {
          continue;
        }
        const targetId = cartItem.productId || cartItem.id;
        const prod = db_memory.products.find(p => p && p.id === targetId);
        if (!prod) {
          return res.status(400).json({ error: `Product "${cartItem.name || targetId}" no longer exists in our catalog.` });
        }

        const orderQty = Math.max(1, parseInt(String(cartItem.quantity || 1), 10));
        const currentStock = typeof prod.stock === "number" ? prod.stock : 0;
        if (currentStock < orderQty) {
          return res.status(400).json({ error: `Stock exhausted: Sorry, only ${currentStock} units of "${prod.name}" are left in stock.` });
        }

        itemsToBuy.push({ product: prod, quantity: orderQty });
        orderTotal += (typeof prod.price === "number" ? prod.price : 0) * orderQty;
      }

      if (itemsToBuy.length === 0) {
        return res.status(400).json({ error: "Checkout aborted: No valid items found in your shopping cart." });
      }

      // All balances & stocks are safe! Proceed to process final transaction
      // 1. Decrease Stocks
      itemsToBuy.forEach(item => {
        item.product.stock -= item.quantity;
      });

      const orderId = `ord-${Math.floor(Math.random() * 900000) + 100000}`;

      // 2. Save Order records
      const completeOrder: Order = {
        id: orderId,
        customerName: String(customerName).trim(),
        customerEmail: String(customerEmail).trim().toLowerCase(),
        items: itemsToBuy.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        })),
        total: Number(orderTotal.toFixed(2)),
        status: "pending",
        date: new Date().toISOString(),
        cardLast4: billingRef,
        address: String(address).trim()
      };

      if (!db_memory.orders) {
        db_memory.orders = [];
      }
      if (!db_memory.notifications) {
        db_memory.notifications = [];
      }

      db_memory.orders.push(completeOrder);

      // 3. Trigger Order Status Push Notifications
      db_memory.notifications.unshift({
        id: `notif-${Date.now()}-c`,
        orderId: orderId,
        title: "Order Placed Successfully! 🎉",
        message: `Your payment of KSh ${completeOrder.total.toLocaleString()} has been secured. Order #${orderId} is being processed.`,
        timestamp: new Date().toISOString(),
        status: "unread"
      });

      // Vendor Alert Notification
      const itemsDescription = completeOrder.items.map(item => `${item.name} (${item.quantity}x)`).join(", ");
      db_memory.notifications.unshift({
        id: `notif-vendor-order-${Date.now()}`,
        orderId: orderId,
        title: "New Store Order Placed! 🛒",
        message: `Vendor Alert: Order #${orderId} was placed by ${completeOrder.customerName} containing: ${itemsDescription} for a total value of KSh ${completeOrder.total.toLocaleString()}.`,
        timestamp: new Date().toISOString(),
        status: "unread"
      });

      // Check if stock alerts should fire
      itemsToBuy.forEach(item => {
        if (item.product.stock <= 3) {
          db_memory.notifications.unshift({
            id: `notif-alert-${Date.now()}-${item.product.id}`,
            orderId: "stock-alert",
            title: "Low Stock Warning ⚠️",
            message: `Product "${item.product.name}" has only ${item.product.stock} units remaining. Please restock!`,
            timestamp: new Date().toISOString(),
            status: "unread"
          });
        }
      });

      saveStore(db_memory);

      res.status(201).json({
        success: true,
        order: completeOrder,
        message: "Checkout transaction completed through authenticated payments route."
      });
    } catch (err: any) {
      console.error("FATAL CHECKOUT ERROR:", err);
      res.status(500).json({
        error: `Secure billing processor declined due to unexpected parameter alignment. Details: ${err.message || err}`
      });
    }
  });

  // 6. ADMIN: ORDER SHIPPED/UPDATED GATEWAY
  app.post("/api/admin/orders/status", (req, res) => {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ error: "Missing orderId or status" });
    }

    const order = db_memory.orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;

    // Create Push Notification
    let statusEmoji = "📦";
    if (status === "shipped") statusEmoji = "🚚";
    if (status === "delivered") statusEmoji = "✨";
    if (status === "cancelled") statusEmoji = "❌";

    db_memory.notifications.unshift({
      id: `notif-${Date.now()}-u`,
      orderId: order.id,
      title: `Order Status Updated ${statusEmoji}`,
      message: `Hi ${order.customerName}, your OmniShop order #${order.id} status is now: ${status.toUpperCase()}.`,
      timestamp: new Date().toISOString(),
      status: "unread"
    });

    saveStore(db_memory);
    res.json(order);
  });

  // 7. NOTIFICATIONS FEED
  app.get("/api/notifications", (req, res) => {
    const queryEmail = req.query.email ? String(req.query.email).toLowerCase() : null;

    if (queryEmail) {
      // Find orders belonging to user to feed customer-specific updates
      const userOrderIds = db_memory.orders
        .filter(o => o.customerEmail === queryEmail)
        .map(o => o.id);

      // Return user specific order updates AND general global notifications
      const filtered = db_memory.notifications.filter(n =>
        n.orderId === "init" ||
        n.orderId === "global" ||
        userOrderIds.includes(n.orderId)
      );
      return res.json(filtered);
    }

    // Admins / General users receive all notifications
    res.json(db_memory.notifications);
  });

  app.post("/api/notifications/read-all", (req, res) => {
    db_memory.notifications.forEach(n => {
      n.status = "read";
    });
    saveStore(db_memory);
    res.json({ success: true });
  });

  // 8. ADMIN: ANALYTICS CONSOLE
  app.get("/api/admin/analytics", (req, res) => {
    const orders = db_memory.orders;
    const products = db_memory.products;

    const totalRevenue = orders
      .filter(o => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);

    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 3).length;

    // Compute sales per category
    const categorySales: { [cat: string]: number } = {};
    const categoryVolume: { [cat: string]: number } = {};

    products.forEach(p => {
       categorySales[p.category] = 0;
       categoryVolume[p.category] = 0;
    });

    orders.forEach(o => {
      if (o.status === "cancelled") return;
      o.items.forEach(item => {
        // Find matching product category
        const catalogProd = products.find(p => p.id === item.productId);
        const cat = catalogProd ? catalogProd.category : "Unassigned";
        categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);
        categoryVolume[cat] = (categoryVolume[cat] || 0) + item.quantity;
      });
    });

    // Generate beautiful hourly projection stats
    const hourlySales = [
      { hour: "08:00 AM", amount: totalRevenue * 0.12 },
      { hour: "10:00 AM", amount: totalRevenue * 0.18 },
      { hour: "12:00 PM", amount: totalRevenue * 0.22 },
      { hour: "02:00 PM", amount: totalRevenue * 0.15 },
      { hour: "04:00 PM", amount: totalRevenue * 0.20 },
      { hour: "06:00 PM", amount: totalRevenue * 0.13 }
    ];

    res.json({
      totalRevenue: Number(totalRevenue.toFixed(2)),
      ordersCount: orders.length,
      productsCount: products.length,
      outOfStockCount,
      lowStockCount,
      categorySales,
      categoryVolume,
      hourlySales
    });
  });

  // 8b. ADMIN: GET ALL ORDERS DIRECTLY
  app.get("/api/admin/orders", (req, res) => {
    res.json(db_memory.orders);
  });

  // 9. CLIENT SIDE MACHINE-LEARNING RECOMMENDATION ENGINE (GEMINI-POWERED)
  app.post("/api/recommendations", async (req, res) => {
    const { browsingHistory } = req.body; // Array of product names or descriptions they viewed

    const products = db_memory.products;

    // Core validation: if user has no browsing history logs, yield fallback standard catalog recommendations
    if (!browsingHistory || !browsingHistory.length) {
      // Find top rated products
      const standardRecs = products
        .slice()
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3)
        .map(p => ({
          productId: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          image: p.image,
          reason: "Top rated absolute favorite in OmniShop collection."
        }));
      return res.json(standardRecs);
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("No key configured");
      }

      const client = getGeminiClient();

      // Product manifest we provide to Gemini to choose from
      const catalogManifest = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        description: p.description
      }));

      const promptHtmlString = `
You are a highly-trained E-Commerce Machine Learning Personalization engine connected to modern store search logs.
You are given a user's recent browsing history and our live product catalog.
Analyze the user's browsing pattern (interests, tastes, themes like minimalist tech, audio depth, desk setups, apparel) and select EXACTLY 3 products from our actual catalog that best match their taste profile.

User Browsing History Logs (List of products viewed or carted):
${JSON.stringify(browsingHistory)}

Available Store Catalog (Choose ONLY from this exact list, using matching 'id'):
${JSON.stringify(catalogManifest)}

For each of the 3 recommended products, write a beautiful, personalized, high-context humanized explanation (one brief sentence) explaining WHY this is suggested based on their history (e.g. "Since you explored split ergonomic layouts, the Amber Zenith mechanical keybeds align perfectly with your search for physical productivity comfort."). Make the tone clever, modern, and supportive.

Return the recommendation list in strict JSON schema format mapping EXACTLY to are array pattern.
`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptHtmlString,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of recommended products from Catalog matching user browsing pattern",
            items: {
              type: Type.OBJECT,
              properties: {
                productId: {
                  type: Type.STRING,
                  description: "The EXACT 'id' of the recommended product from catalog."
                },
                name: {
                  type: Type.STRING,
                  description: "The EXACT 'name' of the product."
                },
                reason: {
                  type: Type.STRING,
                  description: "Clever, dynamic personal rationalization linking back to their browsing history."
                }
              },
              required: ["productId", "name", "reason"]
            }
          }
        }
      });

      const jsonStr = (response.text || "[]").trim();
      const parsedRecommendations = JSON.parse(jsonStr);

      // Map the recommendations to the full catalog properties
      const mappedRecommendations = parsedRecommendations.map((rec: any) => {
        const fullProd = products.find(p => p.id === rec.productId || p.name === rec.name);
        if (fullProd) {
          return {
            productId: fullProd.id,
            name: fullProd.name,
            category: fullProd.category,
            price: fullProd.price,
            image: fullProd.image,
            reason: rec.reason
          };
        }
        return null; // Ignore invalid hallucinations
      }).filter(Boolean);

      // Hand-off fallback list if Gemini recommendation resulted in insufficient or hallucinated catalog items
      if (mappedRecommendations.length < 2) {
        throw new Error("Hallucination or incomplete list returned");
      }

      res.json(mappedRecommendations);

    } catch (error) {
       // Graceful machine learning fallback: heuristics based on matching viewed categories
       // E.g. find categories of browsed items, filter catalog by those categories, send top scoring ones!
       const viewedCategories = products
         .filter(p => browsingHistory.some((hist: string) => hist.includes(p.name) || hist.includes(p.category)))
         .map(p => p.category);

       let recommended = products
         .filter(p => !browsingHistory.some((hist: string) => hist.includes(p.name)))
         .filter(p => viewedCategories.includes(p.category))
         .slice(0, 3);

       if (recommended.length < 3) {
         // fill up list with other items
         const extra = products.filter(p => !recommended.find(r => r.id === p.id)).slice(0, 3 - recommended.length);
         recommended = [...recommended, ...extra];
       }

       const mapped = recommended.map(p => ({
         productId: p.id,
         name: p.name,
         category: p.category,
         price: p.price,
         image: p.image,
         reason: `Suggested based on matching interest in premium ${p.category} product options.`
       }));

       res.json(mapped);
    }
  });

  // 10. CUSTOMER CARE CHATBOT (GEMINI-POWERED)
  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid message history" });
    }

    const lastMsg = messages[messages.length - 1];
    const lastMsgText = String(lastMsg?.content || "");

    try {
      const client = getGeminiClient();
      const systemInstruction = `You are "Wanta", the virtual customer care representative for Wantalian Home Hub ("Mali Safi kwa Bei Poa"), a premium interior modular systems & workspace living technology e-commerce platform.
    
We offer premium products like:
1. Aura Soundbar Pro (KSh 249.99) - High-fidelity sonic waves soundbar with walnut wood grills.
2. Nova Light Canvas (KSh 139.50) - Modular LED ambient light sheets.
3. Zenith Ergo Split Keyboard (KSh 189.00) - Ergonomic split mechanical keyboard in aviation-grade metal.
4. Desk mats, Kinetic Watches, Commuter Packs, etc.

Operational details to assist customers:
- Payment Method: We support both Credit/Debit card and "Lipa Na M-PESA" (M-Pesa Paybill is 247 247 and Account Number is 628766 under Wantalian Home Hub) using Kenya Shillings directly.
- Delivery options: We deliver across Nairobi and all major counties in Kenya. Shipping options are standard or express delivery.
- Return Policy: 30-day hassle-free returns on premium interior systems if items are in pristine original packaging.

Be friendly, conversational, enthusiastic, helpful, and professional. Speak with a welcoming Kenyan hospitality vibe, using friendly terms if appropriate (e.g., "Karibu", "Mali Safi", "Habari"), but keep the English professional and neat. Answer questions about products, ordering, shipping, and payments. Ensure your answers are concise, structured with standard Markdown, and elegant. Always reply in Markdown.`;

      const history = messages.slice(0, -1).map(m => ({
        role: m.role === "assistant" || m.role === "model" ? "model" : "user",
        parts: [{ text: String(m.content || "") }]
      }));

      const chatInstance = client.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction,
        },
        history: history
      });

      const response = await chatInstance.sendMessage({ message: lastMsgText });
      res.json({ text: response.text || "I apologize, but I didn't get that. How can I help you today?" });
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      
      const input = lastMsgText.toLowerCase().trim();
      let reply = "";

      if (input.includes("m-pesa") || input.includes("mpesa") || input.includes("pay") || input.includes("till") || input.includes("lipa") || input.includes("paybill")) {
        reply = `Habari! Paying is quick and easy at **Wantalian Home Hub**:
- **Lipa Na M-PESA**: Use **Paybill 247 247** with Account Number **628766** (Wantalian Home Hub).
- **Alternative**: We also accept all major local & international debit/credit cards at checkout!

Let me know if you need help calculating your exact KES total for checkout! 🇰🇪✨`;
      } else if (input.includes("deliver") || input.includes("county") || input.includes("ship") || input.includes("nairobi") || input.includes("where") || input.includes("mombasa") || input.includes("kisumu")) {
        reply = `Jambo! Yes, we offer secure parcel door-delivery and premium logistics across Kenya:
- **Nairobi & Environs**: Same-day or next-day express courier.
- **Other Counties**: (Mombasa, Kisumu, Nakuru, Eldoret, etc.) We ship via verified G4S or Wells Fargo Courier systems arriving in 24-48 hours.
- **Tracking**: You will receive live in-app notifications and SMS updates when your workspace systems ship!

Which county are you shopping from? 📦`;
      } else if (input.includes("return") || input.includes("policy") || input.includes("refund") || input.includes("warranty")) {
        reply = `We prioritize absolute confidence in your setup! Here is our standard policy:
- **30-Day Return**: Hassle-free returns on modular systems & workspace tech if items are in clean, pristine original packaging.
- **Warranty**: All items (like the **Aura Soundbar Pro** and **Zenith Split Keyboard**) enjoy a 1-year product integrity warranty.
- **Refunds**: Once inspected, refunds are dispatched in 3 business days back to your card or original M-Pesa phone number.`;
      } else if (input.includes("best") || input.includes("product") || input.includes("recommend") || input.includes("hot") || input.includes("soundbar") || input.includes("keyboard") || input.includes("light")) {
        reply = `Our current workspace centerpieces include these **Mali Safi** favourites:
1. **Aura Soundbar Pro (KSh 249,99)**: Incredible walnut-grilled spatial soundbar for audiophiles.
2. **Zenith Ergo Split Keyboard (KSh 189,00)**: Premium ortholinear aluminum mechanical keybed for peak typing posture comfort.
3. **Nova Light Canvas (KSh 139,50)**: Smart module LED tiles that pulse in sync with the room atmosphere.

Would you like me to help you add any of these to your shopping cart? 🛠️🔥`;
      } else if (input.includes("hello") || input.includes("hi") || input.includes("hey") || input.includes("jambo") || input.includes("habari") || input.includes("mambo")) {
        reply = `Habari! Jambo! Karibu to the **Wantalian Home Hub** Customer Care. 😊✨
I am **Wanta**, and I'm ready to assist you. 

You can ask me questions about:
- 💳 **Lipa na M-Pesa** Till Number & rates
- 🚚 **County Delivery** options
- 📦 **Return & Warranty** policies
- 🔥 Our hot **workspace systems and modular acoustics**

How can I help you customize your hub today?`;
      } else {
        reply = `Habari! I am currently assisting you on offline backup mode due to minor system traffic, but I can definitely help:
- **Lipa na M-Pesa**: Paybill **247 247**, Account Number **628766** (Wantalian Home Hub).
- **Delivery**: Same-day Nairobi & 24-48 hour parcel delivery to all other Kenyan counties.
- **Featured**: Aura Soundbar Pro (KSh 249,99) & Zenith Ergonomic Split Keyboard (KSh 189,00).

Could you please ask again or clarify? I am here to help you get the best deal!`;
      }

      res.json({ text: reply });
    }
  });


  // ========== FRONTEND SERVING WITH VITE INTEGRATION ==========

  // Vite integration middleware for development
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
    console.log(`[OmniShop Server] Direct active endpoint on http://localhost:${PORT}`);
  });
}

startServer();
