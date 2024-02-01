import Koa from "koa";
import bodyParser from "koa-bodyparser";
import * as route from "koa-route";
import session from "koa-session";
import passport from "koa-passport";
import { initializeLocalStrategy } from "./auth";
import cors from "@koa/cors";
import mongoose from "mongoose";
import { register } from "./controller/authController";

const app = new Koa();

app.keys = ["your-session-secret"];
app.use(session({}, app));

app.use(bodyParser());
initializeLocalStrategy(passport);
app.use(passport.initialize());
app.use(passport.session());

// CORS
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

// POST /login
app.use(
    route.post(
        "/api/v1/login/",
        passport.authenticate("local", {
            successRedirect: "/api/v1/loginsuccess",
            failureRedirect: "/api/v1/loginFailure",
        })
    )
);

app.use(route.post("/api/v1/register/", register));

app.use(
    route.get("/api/v1/logout", function (ctx) {
        ctx.logout();
        ctx.body = { message: "Logout Success" };
    })
);

app.use(
    route.get("/api/v1/loginFailure", (ctx) => {
        ctx.body = { error: "Incorrect Username or Password" };
        ctx.status = 401;
    })
);

app.use(
    route.get("/api/v1/authFailure", (ctx) => {
        ctx.body = { error: "Not Authorized" };
        ctx.status = 401;
    })
);

app.use(
    route.get("/api/v1/loginsuccess", (ctx) => {
        ctx.body = { message: "Login Success" };
    })
);

app.use(function (ctx, next) {
    if (ctx.isAuthenticated()) {
        return next();
    } else {
        ctx.redirect("/api/v1/authFailure");
    }
});

app.use(
    route.get("/api/v1/session", (ctx) => {
        ctx.body = { message: "ok" };
    })
);

// connect to DB
mongoose.connect("mongodb://localhost:27017/myDatabase?authSource=admin", {
    dbName: "admin",
    user: "userx", // User with less privileges
    pass: "1234",
});

// start server
const port = process.env.PORT || 3001;
app.listen(port, () => console.log("Server listening on", port));
