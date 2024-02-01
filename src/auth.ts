import koaPassport from "koa-passport";
import passportLocal from "passport-local";
import User, { IUserDocument } from "./schemas/User";

const fetchUser2 = async (id?: number, email?: string, password?: string): Promise<IUserDocument | undefined> => {
    try {
        if (id) {
            return await User.findById(id); // Assuming `id` is the MongoDB document ID
        }
        if (email && password) {
            return await User.findOne({ email });
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        return undefined;
    }
};

export const initializeLocalStrategy = (passport: typeof koaPassport) => {
    passport.serializeUser(function (user: IUserDocument, done) {
        done(null, user.id);
    });

    passport.deserializeUser(async function (id: number, done) {
        try {
            const user = await fetchUser2(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    const LocalStrategy = passportLocal.Strategy;

    passport.use(
        new LocalStrategy(function (email: string, password: string, done) {
            fetchUser2(undefined, email, password)
                .then((user) => {
                    if (user === null || user === undefined) {
                        done(null, false);
                    }
                    user.comparePassword(password, (err: Error, isMatch: boolean) => {
                        if (err) done(null, false);
                        if (isMatch) done(null, user);
                        done(null, false);
                    });
                })
                .catch((err) => done(err));
        })
    );
};
