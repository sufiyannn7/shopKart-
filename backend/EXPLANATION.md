# 🧠 Simple Explanation of the ShopKart Backend

Here is a simple, conceptual guide to understanding how your project is structured. This uses the **MVC (Model-View-Controller)** pattern, which is a standard way to organize backend code so it doesn't get messy.

### 1. `index.js` (The Main Engine)
**Concept:** The entry point of your app. 
**What it does:** It starts up your Express server, connects to your MongoDB database, and pulls in all your routes. Think of it as the main switchboard that turns everything on.

### 2. `.env` (The Secret Safe)
**Concept:** A hidden file to store sensitive information.
**What it does:** It holds things like your database connection URL (`MONGODB_URI`) and your secret key for making tokens (`JWT_SECRET`). We keep these here so they aren't hardcoded into the app where anyone could see them.

### 3. `models/` (The Blueprints)
**Concept:** Defines the shape of your data.
**What it does:** Inside `customer.model.js`, you are telling MongoDB exactly what a "Customer" should look like. It says: *"Every customer MUST have a fullName, an email, a password, and a phone number."* It acts like a strict form that data must fit into before being saved to the database.

### 4. `controllers/` (The Managers / The Brains)
**Concept:** Contains the actual business logic.
**What it does:** Inside `customer.controller.js`, you have the code that actually *does* the work. 
- When someone tries to register, the controller checks if the email exists, hashes the password, and saves the user. 
- When someone logs in, the controller checks the password and generates a login token.

### 5. `routes/` (The Traffic Cops)
**Concept:** Directs incoming web traffic to the right place.
**What it does:** Inside `customer.routes.js`, it listens for specific URLs (like `POST /customers/register`). When a request comes in, the route says, *"Ah, a register request! Let me send you over to the 'registerCustomer' controller to handle this."*

### 6. `middlewares/` (The Security Guards)
**Concept:** Code that runs *in the middle* of a request to check permissions.
**What it does:** Inside `auth.middleware.js`, you have a function called `protectRoute`. Before a user can view their profile (`/me`), this middleware stops the request, checks if the user has a valid login cookie, and only lets them through if the cookie is real. If they aren't logged in, the guard turns them away with a `401 Unauthorized` error.

### 7. `utils/` (The Toolbox)
**Concept:** Helper functions that you might need to use in different places.
**What it does:** Inside `generateToken.js`, you have a small tool that takes a user's ID, creates a secure JWT (JSON Web Token), and puts it inside an HTTP-Only cookie. We put this in a separate file so it keeps the controller clean and can be reused easily.

---

### 🔄 How a Login Request Flows (Step-by-Step for Viva)

If your TA asks you to explain the flow of a login request, explain it like this:

1. **The Route:** The request comes into `index.js`, which sends it to `customer.routes.js`. The traffic cop sees it's a `POST /login` and sends it to the login controller.
2. **The Controller:** `customer.controller.js` takes the email and password from the request.
3. **The Database (Model):** The controller asks the database, *"Do we have a user with this email?"*
4. **The Check (bcrypt):** If the user exists, the controller uses `bcrypt` to compare the hashed password in the database with the password the user just typed in.
5. **The Token (Utils):** If the password matches, the controller uses `generateToken.js` to create a VIP pass (JWT) and puts it in the user's browser as a secure cookie.
6. **The Response:** Finally, the controller sends back a `200 OK` message saying "Login successful!"
