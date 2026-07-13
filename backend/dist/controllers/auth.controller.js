"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.profile = exports.login = exports.register = void 0;
const authService = __importStar(require("../services/auth.service"));
const auth_validation_1 = require("../validations/auth.validation");
const register = async (req, res) => {
    try {
        const parseResult = auth_validation_1.registerSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
            return;
        }
        const result = await authService.registerUser(req.body);
        res.status(201).json({ success: true, ...result });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const parseResult = auth_validation_1.loginSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
            return;
        }
        const result = await authService.loginUser(req.body);
        res.status(200).json({ success: true, ...result });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.login = login;
const profile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: "Unauthorized" });
            return;
        }
        const result = await authService.getUserById(req.user.userId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.profile = profile;
