import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IScore extends Document {
    user: Types.ObjectId;
    score: number;
    createdAt: Date;
}

const scoreSchema: Schema<IScore> = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Score = mongoose.model<IScore>('Score', scoreSchema);

export default Score;