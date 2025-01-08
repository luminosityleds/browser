import mongoose, { Document, Schema } from "mongoose"

export interface DeviceInterface extends Document {
    name : string;
    powered? : boolean;
    poweredTimestamp? : Date;
    connected? : boolean;
    connectedTimestamp? : Date;
    color? : string;
    colorTimestamp? : Date;
    brightness? : number;
    brightnessTimestamp? : Date;
}

const DeviceSchema : Schema = new Schema<DeviceInterface>({
    name: {
        type: String,
        required: true
    },
    powered: {
        type: Boolean,
    },
    poweredTimestamp: {
        type: Date,
    },
    connected: {
        type: Boolean,
    },
    connectedTimestamp: {
        type: Date,
    },
    color: {
        type: String,
    },
    colorTimestamp: {
        type: Date,
    },
    brightness: {
        type: Number,
    },
    brightnessTimestamp: {
        type: Date
    }
})

const Device = mongoose.model<DeviceInterface>("Device", DeviceSchema);
export default Device;