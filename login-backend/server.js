const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://aloksingh20060:aloksingh10@cluster0.gafty.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection error:", err));

// Define a User schema
// Define a User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // New field for storing user name
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);


// Route: User registration (save name, email, and password to MongoDB)
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body; // Extract `name`, `email`, and `password` from the request body

  try {
    // Create a new user with name, email, and password
    const newUser = new User({ name, email, password });
    await newUser.save(); // Save the user data into MongoDB
    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(400).send("Error registering user: " + error.message);
  }
});


// Route: User login (validate email/password)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });
    if (user) {
      res.status(200).send("Login successful");
    } else {
      res.status(400).send("Invalid email or password");
    }
  } catch (error) {
    res.status(500).send("Error logging in: " + error.message);
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
