import { FilesystemBundleStore } from "../dist/index.js";
import { runBundleStoreTests } from "./bundle-store-conformance.js";

runBundleStoreTests((root) => new FilesystemBundleStore(root), "FilesystemBundleStore");
