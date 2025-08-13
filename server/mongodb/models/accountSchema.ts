import mongoose, { Schema, Document } from "mongoose"
import { DeviceInterface } from "./deviceSchema"

export interface AccountInterface extends Document {
    name : string;
    email : string;
    password : string;
    creationDate : Date;
    deletionDate : Date | null;
    lastUpdated : Date;
    notifications : string[];
    devicesLinked : mongoose.Types.ObjectId[];
    usVerified?: boolean;
    verifyToken?: string;
    verifyTokenExpiry?: Date;
}

const AccountSchema : Schema = new Schema<AccountInterface>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: { 
        type: String, 
        required: true 
    },
    creationDate: {
        type: Date,
        default : Date.now()
    },
    lastUpdated: {
        type: Date,
        default : Date.now(),
        required: true
    },
    // Array is by default initialized as empty array
    notifications: {
        type: [String]
    },
    devicesLinked: [{
        type: Schema.Types.ObjectId,
        ref: "Device"
    }],
    deletionDate: {
        type: Date, // Optional date to track when the account is marked for deletion
        default: null // Default value is null, meaning the account is not deleted
    },

    usVerified: { type: Boolean, default: false },
    verifyToken: { type: String },
    verifyTokenExpiry: { type: Date },
})

const Account = mongoose.model<AccountInterface>("Account", AccountSchema);
export default Account;