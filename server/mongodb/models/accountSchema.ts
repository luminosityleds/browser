import mongoose, { Schema, Document } from "mongoose"

export interface AccountInterface extends Document {
    name : string;
    email : string;
    creationDate : Date;
    deletionDate : Date | null;
    lastUpdated : Date;
    notifications : string[];
}

const AccountSchema : Schema = new Schema<AccountInterface>({
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        unique: true,
        required: true
    },
    creationDate : {
        type: Date,
        default : Date.now()
    },
    deletionDate : {
        type: Date,
        default: null
    },
    lastUpdated : {
        type: Date,
        default : Date.now(),
        required: true
    },
    // Array is by default initialized as empty array
    notifications : {
        type: [String]
    }
})