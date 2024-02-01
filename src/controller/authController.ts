import { Context } from "koa";
import User from "../schemas/User";

interface IRegisterBody {
    email: string;
    password: string;
}

const register = async (ctx: Context) => {
    const body = ctx.request.body as IRegisterBody;
    if (body.email && body.password) {
        const user = await User.findOne({ email: body.email });
        if (user !== undefined && user !== null) {
            ctx.body = { error: "That Email already exists" };
            ctx.status = 400;
            return;
        }

        const newUser = new User({
            email: body.email,
            password: body.password,
        });

        try {
            await newUser.save();
            ctx.body = { message: "User Created" };
            ctx.status = 201;
        } catch (err) {
            console.error(err);
        }
    } else {
        ctx.body = { error: "Missing Email or Password" };
        ctx.status = 401;
    }
};

export { register };
