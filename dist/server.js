"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
const child_process_1 = require("child_process");
const app_1 = __importDefault(require("./app"));
(0, child_process_1.exec)('npm run generate-service', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    console.log(stdout);
    console.log(stderr);
});
const PORT = process.env.PORT || 5000;
app_1.default.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
