/**
 * Type definitions for the homeassistant-bridge adapter
 */

/** Adapter configuration from io-package.json native section */
export interface AdapterConfig {
    port: number;
    visUrl: string;
    authRequired: boolean;
    username: string;
    password: string;
    mdnsEnabled: boolean;
    serviceName: string;
}

/** Session data stored in the sessions map */
export interface SessionData {
    created: number;
    flowId?: string;
}

/** Minimal adapter interface for dependency injection */
export interface AdapterInterface {
    log: {
        debug: (msg: string) => void;
        info: (msg: string) => void;
        warn: (msg: string) => void;
        error: (msg: string) => void;
    };
    setStateAsync: (id: string, value: ioBroker.StateValue, ack: boolean) => ioBroker.SetStatePromise;
}
