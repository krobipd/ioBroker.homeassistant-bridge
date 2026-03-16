"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MDNSService = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_os_1 = __importDefault(require("node:os"));
const node_child_process_1 = require("node:child_process");
const constants_1 = require("./constants");
const AVAHI_SERVICE_DIR = '/etc/avahi/services';
const AVAHI_SERVICE_FILE = `${AVAHI_SERVICE_DIR}/homeassistant-bridge.service`;
/** Avahi mDNS service for Home Assistant discovery */
class MDNSService {
    adapter;
    config;
    uuid;
    active = false;
    /**
     * Creates a new MDNSService instance
     *
     * @param adapter - Adapter interface for logging
     * @param config - Adapter configuration
     */
    constructor(adapter, config) {
        this.adapter = adapter;
        this.config = config;
        this.uuid = node_crypto_1.default.randomUUID();
    }
    /** First non-internal IPv4 address */
    getLocalIP() {
        const interfaces = node_os_1.default.networkInterfaces();
        for (const ifaces of Object.values(interfaces)) {
            if (!ifaces) {
                continue;
            }
            for (const iface of ifaces) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address;
                }
            }
        }
        return '127.0.0.1';
    }
    /** Check if avahi-daemon is running */
    isAvahiRunning() {
        for (const cmd of ['systemctl is-active avahi-daemon', 'pgrep avahi-daemon']) {
            try {
                (0, node_child_process_1.execSync)(cmd, { stdio: 'ignore' });
                return true;
            }
            catch {
                // try next command
            }
        }
        return false;
    }
    /**
     * Build Avahi service XML
     *
     * @param serviceName - Name of the service for mDNS discovery
     * @param port - Port number for the service
     * @param baseUrl - Base URL for the service
     */
    buildServiceXml(serviceName, port, baseUrl) {
        return [
            '<?xml version="1.0" standalone=\'no\'?>',
            '<!DOCTYPE service-group SYSTEM "avahi-service.dtd">',
            '<service-group>',
            `  <name replace-wildcards="yes">${serviceName}</name>`,
            '  <service protocol="ipv4">',
            '    <type>_home-assistant._tcp</type>',
            `    <port>${port}</port>`,
            `    <txt-record>base_url=${baseUrl}</txt-record>`,
            `    <txt-record>internal_url=${baseUrl}</txt-record>`,
            '    <txt-record>external_url=</txt-record>',
            `    <txt-record>version=${constants_1.HA_VERSION}</txt-record>`,
            `    <txt-record>uuid=${this.uuid}</txt-record>`,
            `    <txt-record>location_name=${serviceName}</txt-record>`,
            '    <txt-record>requires_api_password=True</txt-record>',
            '  </service>',
            '</service-group>',
        ].join('\n');
    }
    /** Reload avahi-daemon to pick up the new service file */
    reloadAvahi() {
        try {
            (0, node_child_process_1.execSync)('avahi-daemon --reload 2>/dev/null || kill -HUP $(pgrep avahi-daemon)', {
                stdio: 'ignore',
                shell: '/bin/sh',
            });
        }
        catch {
            // non-critical — avahi polls service dir anyway
        }
    }
    /** Start mDNS broadcasting via Avahi */
    start() {
        if (!this.isAvahiRunning()) {
            this.adapter.log.error('mDNS: Avahi daemon is not running!');
            this.adapter.log.error('mDNS: Install: sudo apt install avahi-daemon && sudo systemctl enable --now avahi-daemon');
            this.adapter.log.error('mDNS: Permission: sudo chown iobroker /etc/avahi/services');
            this.adapter.log.warn(`mDNS: Fallback: enter http://YOUR_IP:${this.config.port} on the display`);
            return;
        }
        const localIP = this.getLocalIP();
        const baseUrl = `http://${localIP}:${this.config.port}`;
        const serviceName = this.config.serviceName || 'ioBroker';
        try {
            const serviceXml = this.buildServiceXml(serviceName, this.config.port, baseUrl);
            if (!node_fs_1.default.existsSync(AVAHI_SERVICE_DIR)) {
                node_fs_1.default.mkdirSync(AVAHI_SERVICE_DIR, { recursive: true });
            }
            node_fs_1.default.writeFileSync(AVAHI_SERVICE_FILE, serviceXml, 'utf8');
            this.active = true;
            this.reloadAvahi();
            this.adapter.log.info(`mDNS: Broadcasting ${serviceName}._home-assistant._tcp.local on ${localIP}:${this.config.port}`);
            this.adapter.log.info(`mDNS: UUID: ${this.uuid}`);
            this.adapter.log.info('mDNS: Verify: avahi-browse _home-assistant._tcp -r -t');
        }
        catch (error) {
            const err = error;
            this.adapter.log.error(`mDNS: Failed to write service file: ${err.message}`);
            if (err.code === 'EACCES') {
                this.adapter.log.error('mDNS: Permission denied — run: sudo chown iobroker /etc/avahi/services');
            }
        }
    }
    /** Stop mDNS broadcasting and remove service file */
    stop() {
        if (!this.active) {
            return;
        }
        try {
            if (node_fs_1.default.existsSync(AVAHI_SERVICE_FILE)) {
                node_fs_1.default.unlinkSync(AVAHI_SERVICE_FILE);
                this.reloadAvahi();
                this.adapter.log.info('mDNS: Service file removed');
            }
        }
        catch (error) {
            const err = error;
            this.adapter.log.warn(`mDNS: Could not remove service file: ${err.message}`);
        }
        this.active = false;
    }
}
exports.MDNSService = MDNSService;
