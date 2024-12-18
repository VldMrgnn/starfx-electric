# Proof of Concept: Integrating Starfx with ElectricSQL

**Status:** *Work in Progress*

This proof of concept demonstrates how to integrate [Starfx](https://starfx.bower.sh/) with [ElectricSQL](https://electric-sql.com/). It showcases how to set up an ElectricSQL server, connect to a PostgreSQL database, and perform read and sync operations, as well as run a simple Node.js-based CRUD API.

## Prerequisites

1. **PostgreSQL Server**  
   Ensure you have access to a running PostgreSQL instance.  
   For installation and configuration, refer to the official [PostgreSQL documentation](https://www.postgresql.org/docs/).

2. **ElectricSQL Server**  
   Follow the [ElectricSQL installation guide](https://electric-sql.com/docs/guides/installation) to set up and run your ElectricSQL server.

3. **Node.js and npm**  
   Make sure you have [Node.js](https://nodejs.org/) and npm installed.

## Setup Instructions

1. **Clone the Repository**  
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Install Dependencies**  
   ```bash
   npm install
   ```

3. **Environment Variables**  
   Create an `.env` file in the project root and define the following keys:
   ```env
   DATABASE_URL=postgresql://<user>:<password>@<electricserver>:<port>/<database>
   VITE_ELECTRIC_SERVICE=http://<electricserver>:3000/v1/shape
   ```
   
   - **DATABASE_URL**: Points to your PostgreSQL instance managed by ElectricSQL.
   - **VITE_ELECTRIC_SERVICE**: Defines the service endpoint for ElectricSQL’s sync functionality.

## Running the Servers

1. **ElectricSQL Server**  
   Start the ElectricSQL server according to the official instructions.  
   *(Refer to the [ElectricSQL documentation](https://electric-sql.com/docs/guides/installation) for details.)*

2. **Node.js Backend Server**  
   This project includes a simple Node.js HTTP server that provides CRUD operations on sample tables (e.g., `users`, `emails`).  
   To start the server:
   ```bash
   npm run server
   ```

3. **Client Application**  
   Start the development client:
   ```bash
   npm run dev
   ```

## Project Structure

- **`src/server/server.js`**: A basic Node.js server handling CRUD operations.
- **Client Side Files**: Located in `src`, configured to connect via the environment variables.

## Notes

- This is a first attempt for the integration of Starfx with ElectricSQL. Most likely in the future, a more refine and optimized version will be available.

<!-- this is a plan of action. not exactly accomplished yet. -->
 <!-- by schema -> api-mdw = subscribe (initialize then go live)
 by api -> start/stop stream
 by api -> parse to store.
 by api -> optimistic operations - insert, update, delete.
 -->
## Some More Explanation

**How it works:**  
ElectricSQL pushes updates for the "shapes" we subscribe to.  
These shapes represent portions of PostgreSQL tables (or materialized views).

**Push Updates:**  
These pushes are well-structured and follow a logical sequence. First, a “batch” of historical data is delivered, which is then used to initially populate the shape. After that, the shape on the client transitions into a "live" mode and begins receiving real-time updates. ElectricSQL manages this transition internally, providing significant value because synchronization can be more complex than it first appears.

**Current Approach:**  
For the initial setup, the `ThunkCtx` interface was extended with fields specific to ElectricSQL (as guided by their documentation). This extended type is then used for subscriptions:

```typescript
export interface EleCtx extends ThunkCtx {
  table: string;
  where?: string;
  replica?: `full` | `default`;
  columns?: string[];
}
```

A middleware (`mdw-electric.ts`) has been introduced to leverage the shape subscriptions. This middleware remains active to continuously receive updates.

**Bi-Directional Updates:**  
Currently, ElectricSQL does not handle pushing updates back to the database. That responsibility remains on our side, handled via the standard Starfx API.

**Synchronization Strategy:**  
ElectricSQL suggests several synchronization strategies. Without committing fully to any predefined pattern, an optimistic update approach seems natural. To facilitate this, we need a local buffer of optimistic data that can be rolled back if necessary.

In this setup, the Starfx "loaders" table is used as a straightforward solution. Loaders respond quickly to both success and failure, come with built-in metadata handling, and support the optimistic update pattern well. Any rollback logic is managed by the synchronization process itself.

To support this, constants were defined for special loader keys, along with a simple but effective selector that prioritizes optimistic data over current data.

**Looking Ahead:**  
It may be more elegant to define an “electric” slice, for example:

```typescript
slice.electric({
   shape: `users`,
   columns: [`id`, `name`, `email`],
   where: `active = true`,
   replica: `full`
})
```

With such a definition in place, the middleware could create subscriptions for all similarly defined slices, and pre-built thunks for CRUD operations could be introduced. Further consideration will be needed to determine when and how to start or stop these data streams.
