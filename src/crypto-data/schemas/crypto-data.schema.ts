import { Schema, Document } from 'mongoose';

export const CryptoSchema = new Schema({
    coinId: { type: String, required: true },
    priceUsd: { type: Number, required: true },
    marketCapUsd: { type: Number, required: true },
    change24h: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
});

export interface CryptoData extends Document {
    coinId: string;
    priceUsd: number;
    marketCapUsd: number;
    change24h: number;
    timestamp: Date;
}