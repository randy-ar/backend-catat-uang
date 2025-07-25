"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySession = void 0;
const verifySession = async (req, res) => {
    return res.status(200).json({ message: 'Session verified' });
};
exports.verifySession = verifySession;
