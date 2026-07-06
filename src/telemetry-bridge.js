;(function() {
    window.global = window;
    window.process = { env: {} };
    window.module = { exports: {} };
    window.exports = window.module.exports;

    // Mock Ajv validation engine to prevent internal framework crashes
    window.Ajv = window.Ajv || function() {
        return {
            compile: function() {
                return function() { return true; }; // Force validate everything as valid
            },
            addSchema: function() {}
        };
    };

    // Intercept old Fingerprint component crashes
    var MockFingerprint = function() {};
    MockFingerprint.prototype.get = function(cb) { if (cb) cb("mock-id", []); };
    window.Fingerprint = MockFingerprint;
    window.Fingerprint2 = MockFingerprint;

    // Create explicit base objects so the SDK can latch onto them
    window.Telemetry = window.Telemetry || { initialized: false };
    window.telemetryInstance = window.telemetryInstance || { _globalObject: {} };

    // Setup your library's expected $t footprint mapping
    window.$t = window.$t || function(...args) {
        return window.Telemetry || window.EkTelemetry;
    };

    // Expose all major tracking triggers cleanly to $t
    var methods = ['initialize', 'start', 'end', 'impression', 'interact', 'log', 'error', 'sync'];
    methods.forEach(function(method) {
        window.$t[method] = function(...args) {
            // Find wherever the active SDK methods were assigned
            var sdk = window.Telemetry || window.EkTelemetry || window.$t._sdk;
            if (sdk && typeof sdk[method] === 'function') {
                return sdk[method].apply(sdk, args);
            }
            console.warn("Telemetry method " + method + " called but SDK is not fully wired yet.");
        };
    });

    // Intercept module exports to capture the internal Telemetry classes
    Object.defineProperty(window.module, 'exports', {
        set: function(val) {
            window.EkTelemetry = val;
            window.$t._sdk = val;
            // Merge everything assigned by Sunbird into our global $t footprint
            Object.assign(window.$t, val);

            // Re-bridge Telemetry references back to global scope if missing
            if (typeof window.Telemetry === 'undefined' || !window.Telemetry.initialize) {
                window.Telemetry = val;
            }
        },
        get: function() {
            return window.EkTelemetry;
        },
        configurable: true
    });
})();
;