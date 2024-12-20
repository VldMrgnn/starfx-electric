import express, { Request, Response, NextFunction } from "express";
import Routes from "./routes";

const app = express();

// Middleware to handle route access based on user level
Routes.forEach((route) => {
  app.use(
    "/rest/api" + route.path,
    (req: Request, res: Response, next: NextFunction) => {
      const userLevel = req.session?.accesslevel ? req.session.accesslevel : 0;
      if (route.accesslevel.some((x) => x === userLevel || userLevel > x)) {
        next();
      } else {
        return res.status(403).send(`Forbidden`);
      }
    },
    route.controller
  );
});

// Start the server
const PORT = 3000; // Change this as needed
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
