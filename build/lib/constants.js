"use strict";
/**
 * Shared constants for the homeassistant-bridge adapter
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOGIN_SCHEMA = exports.CLEANUP_INTERVAL_MS = exports.SESSION_TTL_MS = exports.HA_VERSION = void 0;
/** Emulated Home Assistant version (March 2026) */
exports.HA_VERSION = '2026.3.1';
/** Session TTL: 10 minutes */
exports.SESSION_TTL_MS = 10 * 60 * 1000;
/** Cleanup interval: 5 minutes */
exports.CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
/** Login form schema for Home Assistant auth flow */
exports.LOGIN_SCHEMA = [
    { name: 'username', required: true, type: 'string' },
    { name: 'password', required: true, type: 'string' },
];
