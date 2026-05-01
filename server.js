const express = require("express");
const app = express();
const PORT = 3000;

// parse json bodies
app.use(express.json());

// simple request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// uniform response helper
const respond = (res, status, message, data) =>
  res.status(status).json({
    message,
    time: new Date().toISOString(),
    ...(data !== undefined && { data }),
  });

// basic health check
app.get("/", (_req, res) => {
  respond(res, 200, "Server Running");
});

// mock db
let users = [];
let nextId = 1;

// get all users
app.get("/users", (_req, res) => {
  respond(res, 200, "Users fetched", users);
});

// find user by id
app.get("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id));
  if (!user) return respond(res, 404, "User not found");
  respond(res, 200, "User fetched", user);
});

// add a new user
app.post("/users", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) return respond(res, 400, "Name and email are required");
  if (users.some((u) => u.email === email))
    return respond(res, 400, "Email already exists");

  const user = { id: nextId++, name, email };
  users.push(user);
  respond(res, 200, "User added", user);
});

// remove user
app.delete("/users/:id", (req, res) => {
  const index = users.findIndex((u) => u.id === Number(req.params.id));
  if (index === -1) return respond(res, 404, "User not found");

  const [deleted] = users.splice(index, 1);
  respond(res, 200, "User deleted", deleted);
});

// auth
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "1234";

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return respond(res, 400, "All fields required");
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD)
    return respond(res, 200, "Login Success");

  respond(res, 400, "Invalid Credentials");
});

// start server
app.listen(PORT, () => {
  console.log(`Server is running → http://localhost:${PORT}`);
});
