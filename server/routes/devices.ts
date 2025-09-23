import express, { Request, Response } from "express";
import devicesController from "../controllers/devices";

const router = express.Router();

/** Add a new device to the db
 *  POST /api/devices/new
 *  @body name - Name of the device
 *  @body uuid - A unique user id that serves as the device descriptor
 *  @body powered - Is the device powered? True/False
 *  @body poweredTimestamp - Time "powered" was last updated
 *  @body connected - Is the device connected? True/False
 *  @body connectedTimestamp - Time "connected" was last updated
 *  @body color - Color of the device
 *  @body colorTimestamp - Time "color" was last updated
 *  @body brightness - Brightness of the device
 *  @body brightnessTimestamp - Time "brightness" was last updated
 *  @body user - Id of the user the device belongs to
 *  @body lastUpdated - Last time this device was updated
*/
router.post("/new", devicesController.addDevice);

/** Connects a device
 *  GET /api/devices/connect/:uuid
 */
router.put("/connect/:uuid", devicesController.connectDevice);

/** Disconnects a device
 *  GET /api/devices/disconnect/:uuid
 */
router.put("/disconnect/:uuid", devicesController.disconnectDevice);


/** Retrieve a device from uuid
 *  GET /api/devices/get/:uuid
 */
router.get("/:uuid", devicesController.getDevice);

/** Update existing device by uuid
 *  PUT /api/devices/update/:uuid
 */
router.put("/:uuid", devicesController.updateDevice);

/** Delete device by uuid
 *  DELETE /api/devices/delete/:uuid
 */
router.delete("/:uuid", devicesController.deleteDevice);

export default router;