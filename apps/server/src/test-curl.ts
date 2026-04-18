import { ImageController } from "./controllers/image-management/ImageController.js";
import { initializeFirebase } from "./services/firebase.js";
import dotenv from "dotenv";

dotenv.config();
initializeFirebase();

const controller = new ImageController();
const req: any = { params: { id: "1343" } };
const res: any = {
    status: (code: number) => ({
        json: (data: any) => {
            console.log("STATUS:", code);
            console.log("RESPONSE RECIEVED:");
            console.log(JSON.stringify(data, null, 2));
        }
    })
};

console.log("Calling perform curl equivalent for product 1343...");
controller.discoverImages(req, res).then(() => {
    console.log("Done.");
    process.exit(0);
});
