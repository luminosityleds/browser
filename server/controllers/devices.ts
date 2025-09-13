import express, { Request, Response } from "express";
import deviceSchema from "../mongodb/models/deviceSchema";
import accountSchema from "../mongodb/models/accountSchema";
import mongoose from "mongoose";

const addDevice = async (req: Request, res: Response) => {
    // TODO: Add functionality to add a device to the db
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
    getDevice,
    updateDevice,
    deleteDevice
}