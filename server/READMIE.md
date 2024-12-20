# Server Setup Example for ElectricSQL Endpoint

This folder contains example server-side code to help developers set up their ElectricSQL endpoint alongside a Node.js Express server.

## Files and Their Purpose

1. **`elsfx.ts`**: Contains example routes for managing users and email data, with PostgreSQL integration.
2. **`routes.ts`**: Demonstrates how to register routes, including the `elsfx` route, with specific access levels.
3. **`index.ts`**: Provides an example of how to start an Express server and configure middleware for route access control.

## Instructions to Set Up

1. **Copy the `server` folder** into your project.
2. **Install the required dependencies**:
   ```bash
   npm install express pg
   ```
3. **Set up environment variables** for your PostgreSQL database:
   ```plaintext
   ELSFXUSER      # PostgreSQL username
   ELSFXHOST      # PostgreSQL host
   ELSFXDB        # PostgreSQL database name
   ELSFXPASSWORD  # PostgreSQL password
   ELSFXPORT      # PostgreSQL port (default: 5432)
   ```
   These can be set in a `.env` file or directly in your environment.

4. **Start the server**:
   ```bash
   node index.js
   ```

5. **Access the API**:  
   Open your browser or API testing tool (e.g., Postman) and go to:  
   `http://localhost:3000/rest/api/elsfx`

---

## Notes

- The code provided is for **illustrative purposes only**. Ensure proper configuration and security for your production setup, including handling sensitive data securely.
- Refer to the **ElectricSQL documentation** for further details on integrating with their ecosystem.

