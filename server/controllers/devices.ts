import express, { Request, Response } from "express";
import deviceSchema from "../mongodb/models/deviceSchema";
import accountSchema from "../mongodb/models/accountSchema";
import mongoose from "mongoose";

const addDevice = async (req: Request, res: Response) => {
    // TODO: Add functionality to add a device to the db
}

const connectDevice = async (req: Request, res: Response) => {
    // TODO: Add functionality to connect a device
    // Would update the database and create a socket connection with the device
    // The socket connection is necessary to make other changes such as color and brightness
}

const disconnectDevice = async (req: Request, res: Response) => {
    // TODO: Add functionality to disconnect a device
    // Would update the database and close a socket connection with the device
}

const getDevice = async (req: Request, res: Response) => {
    // TODO: Add functionality to retrieve a device from the db
}

const updateDevice = async (req: Request, res: Response) => {
    // TODO: Add functionality to update an existing device in the db
}

const deleteDevice = async (req: Request, res: Response) => {
    // TODO: Add functionality to remove an existing device from the db
}

export default {
    addDevice,
    connectDevice,
    disconnectDevice,
    getDevice,
    updateDevice,
    deleteDevice
}