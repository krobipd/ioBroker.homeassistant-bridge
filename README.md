# ioBroker.homeassistant-bridge

![Version](https://img.shields.io/badge/version-0.5.2-blue)
![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

Ein minimaler Home-Assistant-Emulator für ioBroker.

Dieser Adapter ermöglicht es Geräten, die ausschließlich ein
Home-Assistant-Dashboard anzeigen können, einen Home-Assistant-Server
vorzutäuschen und stattdessen eine beliebige Web-URL bereitzustellen.

Die Implementierung wurde vollständig mit Unterstützung von Claude.ai
erstellt.

------------------------------------------------------------------------

## Ziel

Geräte wie das **Shelly Wall Display XL** erlauben offiziell nur die
Verbindung zu einem Home Assistant Server.

Mit dieser Bridge kann stattdessen z. B.:

-   eine ioBroker VIS\
-   eine VIS-2 Instanz\
-   ein eigenes Dashboard\
-   oder eine beliebige interne/externe Web-Applikation

angezeigt werden --- **ohne echten Home Assistant Core**.

------------------------------------------------------------------------

## Getestet mit

-   Shelly Wall Display XL

Damit lässt sich eine ioBroker VIS nativ auf dem Wall Display betreiben.

------------------------------------------------------------------------

## Funktionsweise (Kurzfassung)

Der Adapter:

-   emuliert relevante Home Assistant API-Endpunkte\
-   stellt einen `_home-assistant._tcp` mDNS-Service bereit\
-   implementiert einen minimalen Auth-Flow\
-   leitet nach erfolgreicher Anmeldung auf die konfigurierte Ziel-URL
    weiter

Das Display erkennt die Bridge als Home Assistant Server.

------------------------------------------------------------------------

## mDNS Hinweis

Der Adapter registriert einen `_home-assistant._tcp` Service via Avahi,
sodass eine automatische Erkennung per mDNS möglich sein sollte.

In meinen Tests hat die automatische Discovery jedoch nicht zuverlässig
funktioniert.

Die manuelle Einrichtung funktioniert dagegen stabil:

    IP:   <IP-des-ioBroker>
    Port: 8123

Über die direkte IP-Eingabe verbindet sich das Display zuverlässig mit
der Bridge.

------------------------------------------------------------------------

## Voraussetzungen

-   **Node.js ≥ 20**
-   **ioBroker js-controller ≥ 7.0.0**
-   **ioBroker Admin ≥ 7.0.0**
-   Linux-System mit Avahi (für mDNS)

------------------------------------------------------------------------

## Installation

```bash
cd /opt/iobroker
npm install iobroker.homeassistant-bridge
iobroker add homeassistant-bridge
```

Oder über die ioBroker Admin-Oberfläche: Adapter → Suche nach "homeassistant-bridge".

------------------------------------------------------------------------

## Konfiguration

Die Konfiguration erfolgt über die Admin-Oberfläche (jsonConfig):

| Option | Beschreibung | Standard |
|--------|--------------|----------|
| **Port** | HTTP-Port des Servers | 8123 |
| **Redirect URL** | Ziel-URL für das Display (z.B. VIS) | *muss gesetzt werden* |
| **mDNS aktivieren** | Avahi Service Discovery | aktiviert |
| **Service-Name** | Name im Netzwerk | "ioBroker" |
| **Auth aktivieren** | Credentials prüfen | deaktiviert |
| **Benutzername** | Login-Name (wenn Auth aktiv) | "admin" |
| **Passwort** | Login-Passwort (verschlüsselt gespeichert) | - |

**Wichtig:** Die Redirect URL muss eine im Netzwerk erreichbare Adresse sein, z.B.:
```
http://192.168.1.100:8082/vis/index.html
```

`localhost` funktioniert nicht, da das Display die URL aufruft!

------------------------------------------------------------------------

## Troubleshooting

### Display findet den Server nicht (mDNS)

1. Prüfe ob Avahi läuft:
   ```bash
   systemctl status avahi-daemon
   ```

2. Prüfe ob der Service registriert ist:
   ```bash
   avahi-browse _home-assistant._tcp -r -t
   ```

3. Falls mDNS nicht funktioniert, nutze die manuelle Konfiguration am Display mit der IP-Adresse des ioBroker-Servers.

### Avahi Berechtigungsfehler

```bash
sudo chown iobroker /etc/avahi/services
```

### Health-Check

Der Adapter bietet einen Health-Endpoint:
```
http://<IP>:8123/health
```

------------------------------------------------------------------------

## Changelog

Siehe [CHANGELOG.md](CHANGELOG.md) für die vollständige Versionshistorie.

------------------------------------------------------------------------

## Lizenz

MIT License - siehe [LICENSE](LICENSE)

------------------------------------------------------------------------

*Entwickelt mit Unterstützung von Claude.ai*
