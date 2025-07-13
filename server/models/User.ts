import mongoose, { Schema, Document} from 'mongoose';

export interface IUser extends Document {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
    highScore: number;
}

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String },
    highScore: { type: Number, default: 0},
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;