// Install required packages before using:
// npm install express mongoose cors bcryptjs dotenv jsonwebtoken @google/generative-ai

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

// Check if GEMINI_API_KEY is set
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing! Check your .env file.");
    process.exit(1); // Stop the server if API key is missing
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "b37bb9cb0c68c956130fc5d97f64a2b42f95bfa12e7dad9898fdfd1d1b447b24";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
});

const transactionSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    type: String,
    amount: Number,
    description: String,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

// Register Endpoint
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(400).json({ message: "Registration failed: " + error.message });
    }
});

// Login Endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "24h" });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: "Login failed: " + error.message });
    }
});

// User data endpoint
app.get("/user", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user data: " + error.message });
    }
});

// Add Transaction Endpoint
app.post("/transactions", authenticateToken, async (req, res) => {
    const { type, amount, description } = req.body;
    if (!type || !amount || !description) {
        return res.status(400).json({ message: "Type, amount, and description are required" });
    }
    try {
        const newTransaction = new Transaction({ userId: req.userId, type, amount, description });
        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(500).json({ message: "Error adding transaction: " + error.message });
    }
});

// Get Transactions for User
app.get("/transactions", authenticateToken, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.userId });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching transactions: " + error.message });
    }
});

// Chatbot Endpoint
app.post("/chatbot", async (req, res) => {
    try {
        console.log("📩 Received request at /chatbot");

        const userMessage = req.body.message;
        console.log("🗣 User Message:", userMessage);

        if (!userMessage) {
            console.error("❌ Error: Empty message received");
            return res.status(400).json({ reply: "Message cannot be empty" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        console.log("🚀 Model initialized");

        const chat = await model.startChat();
        const result = await chat.sendMessage(userMessage);
        console.log("💬 Gemini API Response:", JSON.stringify(result, null, 2));

        const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
        console.log("🔹 Response text:", responseText);

        res.json({ reply: responseText });
    } catch (error) {
        console.error("❌ Error in chatbot route:", error);
        res.status(500).json({ reply: "Internal server error: " + error.message });
    }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));