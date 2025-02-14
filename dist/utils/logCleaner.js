"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_cron_1 = __importDefault(require("node-cron"));
const logDirectory = path_1.default.join(__dirname, '');
node_cron_1.default.schedule('0 0 * * 0', () => {
    fs_1.default.truncate(path_1.default.join(logDirectory, 'error.log'), 0, (err) => {
        if (err)
            console.error('Error clearing error.log:', err);
    });
    fs_1.default.truncate(path_1.default.join(logDirectory, 'combined.log'), 0, (err) => {
        if (err)
            console.error('Error clearing combined.log:', err);
    });
    console.log('Logs cleared');
});
