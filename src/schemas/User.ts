/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose, { Document } from "mongoose";
import bcrypt from "bcrypt";

const SALT_WORK_FACTOR = 10;

interface IUser {
    email: string;
    password: string;
    createdAt: Date;
    comparePassword(candidatePassword: string, callback: (err?: Error, isMatch?: boolean) => void): void;
}

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // Make email unique
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Pre-save hook to hash the password
userSchema.pre("save", function (next) {
    const user = this;

    // Only hash the password if it has been modified (or is new)
    if (!user.isModified("password")) return next();

    // Generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) return next(err);

        // Hash the password using the generated salt
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) return next(err);

            // Override the plaintext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (candidatePassword: string, callback: (err?: Error, isMatch?: boolean) => undefined) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

export interface IUserDocument extends IUser, Document {}

const User = mongoose.model<IUserDocument>("User", userSchema);

export default User;
