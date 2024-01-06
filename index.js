"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeapUsage = exports.flushThreadCache = exports.arenas = exports.stats = exports.decay = exports.prof = exports.tuning = exports.version = exports.ctl = void 0;
exports.ctl = require('./build/Release/malloc_tools_native').ctl;
exports.version = exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readString('version');
/*
High resource consumption application, prioritizing CPU utilization:
- background_thread:true,metadata_thp:auto combined with relaxed decay time (increased dirty_decay_ms and / or muzzy_decay_ms, e.g. dirty_decay_ms:30000,muzzy_decay_ms:30000).

High resource consumption application, prioritizing memory usage:
- background_thread:true combined with shorter decay time (decreased dirty_decay_ms and / or muzzy_decay_ms, e.g. dirty_decay_ms:5000,muzzy_decay_ms:5000), and lower arena count (e.g. number of CPUs).

Low resource consumption application:
- narenas:1,lg_tcache_max:13 combined with shorter decay time (decreased dirty_decay_ms and / or muzzy_decay_ms,e.g. dirty_decay_ms:1000,muzzy_decay_ms:0).

Extremely conservative -- minimize memory usage at all costs, only suitable when allocation activity is very rare:
- narenas:1,tcache:false,dirty_decay_ms:0,muzzy_decay_ms:0

*/
exports.tuning = {
    get backgroundThread() {
        return (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readBool('background_thread')) || false;
    },
    set backgroundThread(val) {
        exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.writeBool('background_thread', val);
    },
    get dirtyDecayMs() {
        return (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readSSize('arenas.dirty_decay_ms')) || 0;
    },
    set dirtyDecayMs(val) {
        exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.writeSSize('arenas.dirty_decay_ms', val);
    },
    get muzzyDecayMs() {
        return (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readSSize('arenas.muzzy_decay_ms')) || 0;
    },
    set muzzyDecayMs(val) {
        exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.writeSSize('arenas.muzzy_decay_ms', val);
    },
};
let _prefix;
exports.prof = {
    get enabled() {
        return exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readBool('opt.prof');
    },
    get active() {
        return (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readBool('prof.active')) || false;
    },
    set active(status) {
        exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.writeBool('prof.active', status);
    },
    dump(filename) {
        if (!exports.ctl) {
            throw new Error('jemalloc is not loaded');
        }
        if (filename) {
            exports.ctl.writeString('prof.dump', filename);
        }
        else {
            exports.ctl.command('prof.dump');
        }
    },
    get prefix() {
        return _prefix || (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readString('opt.prof_prefix')) || '';
    },
    set prefix(prefix) {
        if (exports.ctl) {
            exports.ctl.writeString('prof.prefix', prefix);
            _prefix = prefix; // there is no getter for this in jemalloc
        }
    },
    get gdump() {
        return (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readBool('prof.gdump')) || false;
    },
    set gdump(enabled) {
        exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.writeBool('prof.gdump', enabled);
    },
    reset(sampleRate) {
        if (!exports.ctl) {
            throw new Error('jemalloc is not loaded');
        }
        if (sampleRate !== undefined) {
            exports.ctl.writeSize('prof.reset', sampleRate);
        }
        else {
            exports.ctl.command('prof.reset');
        }
    },
    get lgSample() {
        return (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readSize('prof.lg_sample')) || 0;
    },
    get interval() {
        return (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readU64('prof.interval')) || 0;
    },
};
exports.decay = {
    get dirty() {
        return (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readSSize('opt.dirty_decay_ms')) || 0;
    },
    set dirty(val) {
        if (exports.ctl) {
            exports.ctl.writeSSize('opt.dirty_decay_ms', val);
        }
    },
    get muzzy() {
        return (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readSSize('opt.muzzy_decay_ms')) || 0;
    },
    set muzzy(val) {
        if (exports.ctl) {
            exports.ctl.writeSSize('opt.muzzy_decay_ms', val);
        }
    }
};
exports.stats = {
    get allocated() {
        return (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readSize('stats.allocated')) || 0;
    },
    get active() {
        return (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readSize('stats.active')) || 0;
    },
    get resident() {
        return (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readSize('stats.resident')) || 0;
    },
    get mapped() {
        return (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readSize('stats.mapped')) || 0;
    },
    get retained() {
        return (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readSize('stats.retained')) || 0;
    },
    get metadata() {
        return (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readSize('stats.metadata')) || 0;
    },
    get backgroundThread() {
        return {
            numThreads: exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readSize('stats.background_thread.num_threads'),
            numRuns: exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readU64('stats.background_thread.num_runs'),
            runInterval: exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readU64('stats.background_thread.run_interval')
        };
    },
};
exports.arenas = {
    get narenas() {
        return exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readUnsigned('arenas.narenas');
    },
    get quantum() {
        return exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readSize('arenas.quantum');
    },
    get page() {
        return exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readSize('arenas.page');
    },
    get tcacheMax() {
        return exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readSize('arenas.tcache_max');
    },
    get nbins() {
        return exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readUnsigned('arenas.nbins');
    },
    get nhbins() {
        return exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readUnsigned('arenas.nhbins');
    },
    get dirtyDecayMs() {
        return (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readSSize('arenas.dirty_decay_ms')) || 0;
    },
    set dirtyDecayMs(val) {
        exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.writeSSize('arenas.dirty_decay_ms', val);
    },
    get muzzyDecayMs() {
        return (exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.readSSize('arenas.muzzy_decay_ms')) || 0;
    },
    set muzzyDecayMs(val) {
        exports.ctl === null || exports.ctl === void 0 ? void 0 : exports.ctl.writeSSize('arenas.muzzy_decay_ms', val);
    },
    getArenaStats(arenaIndex) {
        if (!exports.ctl) {
            throw new Error('jemalloc is not loaded');
        }
        const statsPrefix = `stats.arenas.${arenaIndex}`;
        return {
            pactive: exports.ctl.readSize(`${statsPrefix}.pactive`),
            pdirty: exports.ctl.readSize(`${statsPrefix}.pdirty`),
            pmuzzy: exports.ctl.readSize(`${statsPrefix}.pmuzzy`),
            mapped: exports.ctl.readSize(`${statsPrefix}.mapped`),
            retained: exports.ctl.readSize(`${statsPrefix}.retained`),
            base: exports.ctl.readSize(`${statsPrefix}.base`),
            internal: exports.ctl.readSize(`${statsPrefix}.internal`),
            resident: exports.ctl.readSize(`${statsPrefix}.resident`),
            dirtyNpurge: exports.ctl.readU64(`${statsPrefix}.dirty_npurge`),
            dirtyNmadvise: exports.ctl.readU64(`${statsPrefix}.dirty_nmadvise`),
            dirtyPurged: exports.ctl.readU64(`${statsPrefix}.dirty_purged`),
            muzzyNpurge: exports.ctl.readU64(`${statsPrefix}.muzzy_npurge`),
            muzzyNmadvise: exports.ctl.readU64(`${statsPrefix}.muzzy_nmadvise`),
            muzzyPurged: exports.ctl.readU64(`${statsPrefix}.muzzy_purged`),
            nthreads: exports.ctl.readUnsigned(`${statsPrefix}.nthreads`),
            uptime: exports.ctl.readU64(`${statsPrefix}.uptime`),
            extentAvail: exports.ctl.readSize(`${statsPrefix}.extent_avail`),
            smallAllocated: exports.ctl.readSize(`${statsPrefix}.small.allocated`),
            largeAllocated: exports.ctl.readSize(`${statsPrefix}.large.allocated`),
            lageNmalloc: exports.ctl.readU64(`${statsPrefix}.large.nmalloc`),
            largeNdalloc: exports.ctl.readU64(`${statsPrefix}.large.ndalloc`),
            largeNrequests: exports.ctl.readU64(`${statsPrefix}.large.nrequests`),
            largeNfills: exports.ctl.readU64(`${statsPrefix}.large.nfills`),
            largeNflushes: exports.ctl.readU64(`${statsPrefix}.large.nflushes`),
            // Other stats can be implemented as needed
        };
    },
};
function flushThreadCache() {
    if (!exports.ctl) {
        throw new Error('jemalloc is not loaded');
    }
    exports.ctl.command('thread.tcache.flush');
}
exports.flushThreadCache = flushThreadCache;
function getHeapUsage() {
    if (!exports.ctl) {
        throw new Error('jemalloc is not loaded');
    }
    exports.ctl.writeU64('epoch', (Date.now() / 1000) | 0);
    const allocated = exports.stats.allocated;
    const mapped = exports.stats.mapped;
    const retained = exports.stats.retained;
    /*
      see https://github.com/jemalloc/jemalloc/issues/1882#issuecomment-662745494
      - allocated is bytes used by application
      - active is similar but includes the whole pages, and is multiple of page size
      - "Mapped is the sum of regions of virtual address space currently dedicated (internally)
      to serving some live allocation. Some of those regions have pages we are reasonably confident
      have not been demand-paged in yet; these count towards mapped, but not resident.
      Some pages have been touched by user code and then freed, but not yet returned to the OS
      (we're keeping them around under the hope that we'll be able to serve another allocation out of
      them soon). These pages don't hold any allocations on them, so they don't count towards mapped;
      they do however count towards resident."
      - retained: Total number of bytes in virtual memory mappings that were retained rather
      than being returned to the operating system via e.g. munmap(2) or similar. Retained virtual
      memory is typically untouched, decommitted, or purged, so it has no strongly associated
      physical memory (see extent hooks for details). Retained memory is excluded from mapped
      memory statistics
      - mapped > active > allocated
    */
    return {
        used: allocated,
        total: mapped + retained,
    };
}
exports.getHeapUsage = getHeapUsage;
