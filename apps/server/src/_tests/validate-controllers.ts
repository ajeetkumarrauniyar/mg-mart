import {
  UserController,
  ProductController,
  CartController,
  OrderController,
} from "../controllers/index.js";
import { initializeFirebase } from "../services/firebase.js";

console.log("🔍 Validating Controllers...\n");

try {
  initializeFirebase();
  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.log("❌ Firebase initialization failed:", error);
  process.exit(1);
}

try {
  const userController = new UserController();
  console.log("✅ UserController: Instantiated successfully");
  console.log(
    `   Methods: ${Object.getOwnPropertyNames(
      Object.getPrototypeOf(userController)
    )
      .filter((name) => name !== "constructor")
      .join(", ")}`
  );
} catch (error) {
  console.log("❌ UserController: Failed to instantiate", error);
}

try {
  const productController = new ProductController();
  console.log("✅ ProductController: Instantiated successfully");
  console.log(
    `   Methods: ${Object.getOwnPropertyNames(
      Object.getPrototypeOf(productController)
    )
      .filter((name) => name !== "constructor")
      .join(", ")}`
  );
} catch (error) {
  console.log("❌ ProductController: Failed to instantiate", error);
}

try {
  const cartController = new CartController();
  console.log("✅ CartController: Instantiated successfully");
} catch (error) {
  console.log("❌ CartController: Failed to instantiate", error);
}

try {
  const orderController = new OrderController();
  console.log("✅ OrderController: Instantiated successfully");
} catch (error) {
  console.log("❌ OrderController: Failed to instantiate", error);
}

console.log("\n🎉 Controller validation complete!");
