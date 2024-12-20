// Import the elsfx route
import elsfx from './elsfx';

const router = express.Router();

export type TRoute = {
  path: string;
  accesslevel: number[]; // Define access levels for the route
  controller: typeof router; // Route controller
};

// Define routes
const routes: TRoute[] = [
  {
    path: "/elsfx",
    accesslevel: [0], // Public access
    controller: elsfx, // Route controller
  },
];

// Export the routes
export default routes;
