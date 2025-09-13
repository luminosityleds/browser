import express, { Request, Response } from "express";
import devicesController from "../controllers/devices";

const router = express.Router();

/** Add a new device to the db
 *  POST /devices/new
*/
router.post("/new", devicesController.addDevice)

/** Retrieve a device from uuid
 *  GET /devices/get/:uuid
 */
router.get("/:uuid", devicesController.getDevice)

/** Update existing device by uuid
 *  PUT /devices/update/:uuid
 */
router.put("/:uuid", devicesController.updateDevice)

/** Delete device by uuid
 *  DELETE /devices/delete/:uuid
 */
router.delete("/:uuid", devicesController.deleteDevice)