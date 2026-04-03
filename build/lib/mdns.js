"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var mdns_exports = {};
__export(mdns_exports, {
  MDNSService: () => MDNSService
});
module.exports = __toCommonJS(mdns_exports);
var import_node_crypto = __toESM(require("node:crypto"));
var import_node_fs = __toESM(require("node:fs"));
var import_node_os = __toESM(require("node:os"));
var import_node_child_process = require("node:child_process");
var import_constants = require("./constants");
const AVAHI_SERVICE_DIR = "/etc/avahi/services";
const AVAHI_SERVICE_FILE = `${AVAHI_SERVICE_DIR}/homeassistant-bridge.service`;
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
    this.uuid = import_node_crypto.default.randomUUID();
  }
  /** First non-internal IPv4 address */
  getLocalIP() {
    const interfaces = import_node_os.default.networkInterfaces();
    for (const ifaces of Object.values(interfaces)) {
      if (!ifaces) {
        continue;
      }
      for (const iface of ifaces) {
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
    return "127.0.0.1";
  }
  /** Check if avahi-daemon is running */
  isAvahiRunning() {
    for (const cmd of ["systemctl is-active avahi-daemon", "pgrep avahi-daemon"]) {
      try {
        (0, import_node_child_process.execSync)(cmd, { stdio: "ignore" });
        return true;
      } catch {
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
      `<?xml version="1.0" standalone='no'?>`,
      '<!DOCTYPE service-group SYSTEM "avahi-service.dtd">',
      "<service-group>",
      `  <name replace-wildcards="yes">${serviceName}</name>`,
      '  <service protocol="ipv4">',
      "    <type>_home-assistant._tcp</type>",
      `    <port>${port}</port>`,
      `    <txt-record>base_url=${baseUrl}</txt-record>`,
      `    <txt-record>internal_url=${baseUrl}</txt-record>`,
      "    <txt-record>external_url=</txt-record>",
      `    <txt-record>version=${import_constants.HA_VERSION}</txt-record>`,
      `    <txt-record>uuid=${this.uuid}</txt-record>`,
      `    <txt-record>location_name=${serviceName}</txt-record>`,
      "    <txt-record>requires_api_password=True</txt-record>",
      "  </service>",
      "</service-group>"
    ].join("\n");
  }
  /** Reload avahi-daemon to pick up the new service file */
  reloadAvahi() {
    try {
      (0, import_node_child_process.execSync)("avahi-daemon --reload 2>/dev/null || kill -HUP $(pgrep avahi-daemon)", {
        stdio: "ignore",
        shell: "/bin/sh"
      });
    } catch {
    }
  }
  /** Start mDNS broadcasting via Avahi */
  start() {
    if (!this.isAvahiRunning()) {
      this.adapter.log.error("mDNS: Avahi daemon is not running!");
      this.adapter.log.error(
        "mDNS: Install: sudo apt install avahi-daemon && sudo systemctl enable --now avahi-daemon"
      );
      this.adapter.log.error("mDNS: Permission: sudo chown iobroker /etc/avahi/services");
      this.adapter.log.warn(`mDNS: Fallback: enter http://YOUR_IP:${this.config.port} on the display`);
      return;
    }
    const localIP = this.getLocalIP();
    const baseUrl = `http://${localIP}:${this.config.port}`;
    const serviceName = this.config.serviceName || "ioBroker";
    try {
      const serviceXml = this.buildServiceXml(serviceName, this.config.port, baseUrl);
      if (!import_node_fs.default.existsSync(AVAHI_SERVICE_DIR)) {
        import_node_fs.default.mkdirSync(AVAHI_SERVICE_DIR, { recursive: true });
      }
      import_node_fs.default.writeFileSync(AVAHI_SERVICE_FILE, serviceXml, "utf8");
      this.active = true;
      this.reloadAvahi();
      this.adapter.log.info(
        `mDNS: Broadcasting ${serviceName}._home-assistant._tcp.local on ${localIP}:${this.config.port}`
      );
      this.adapter.log.info(`mDNS: UUID: ${this.uuid}`);
      this.adapter.log.info("mDNS: Verify: avahi-browse _home-assistant._tcp -r -t");
    } catch (error) {
      const err = error;
      this.adapter.log.error(`mDNS: Failed to write service file: ${err.message}`);
      if (err.code === "EACCES") {
        this.adapter.log.error("mDNS: Permission denied \u2014 run: sudo chown iobroker /etc/avahi/services");
      }
    }
  }
  /** Stop mDNS broadcasting and remove service file */
  stop() {
    if (!this.active) {
      return;
    }
    try {
      if (import_node_fs.default.existsSync(AVAHI_SERVICE_FILE)) {
        import_node_fs.default.unlinkSync(AVAHI_SERVICE_FILE);
        this.reloadAvahi();
        this.adapter.log.info("mDNS: Service file removed");
      }
    } catch (error) {
      const err = error;
      this.adapter.log.warn(`mDNS: Could not remove service file: ${err.message}`);
    }
    this.active = false;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MDNSService
});
//# sourceMappingURL=mdns.js.map
