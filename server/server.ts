/* base */
const cors = require("cors");
const http = require("http");
const helmet = require("helmet");
const express = require("express");
const bodyParser = require("body-parser");

/* components */
const apiRouter = require("./api-routes");

// init & config express app
const app = express();
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// init express app server
const server = http.createServer(app);

// load environment variables
require("dotenv").config();

// config express app server to listen on port specified
server.listen(process.env.BACKEND_PORT, () =>
  console.log(`LISTENING ON PORT ${process.env.BACKEND_PORT}`)
);

// set express app to use api routes on /api
app.use("/api", apiRouter);

export {};
