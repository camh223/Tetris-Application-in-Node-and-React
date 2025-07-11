import mongoose, { Schema, Document, Types} from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    highScore: number;
}

const UserSchema: Schema<IUser> = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    highScore: { type: Number, default: 0 }
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;