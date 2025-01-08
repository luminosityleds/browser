import mongoose, { Schema, Document } from "mongoose"
import { DeviceInterface } from "./deviceSchema"

export interface AccountInterface extends Document {
    name : string;
    email : string;
    creationDate : Date;
    deletionDate : Date | null;
    lastUpdated : Date;
    notifications : string[];
    devicesLinked : mongoose.Types.ObjectId[] | DeviceInterface[];
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
    }]
})

const Account = mongoose.model<AccountInterface>("Account", AccountSchema);
export default Account;