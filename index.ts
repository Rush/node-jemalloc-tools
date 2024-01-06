export const { ctl } = require('./build/Release/malloc_tools_native') as {
  ctl?: {
    /** All readXXX() / writeXXX() functions map to the mallctl() interface of jemalloc,
     * in read / write mode, for the corresponding type
     */
    readSize: (name: string) => number;
    readSSize: (name: string) => number;
    readString: (name: string) => string;
    writeString: (name: string, value: string) => string;
    writeBool: (name: string, val: boolean) => string;
    readBool: (name: string) => boolean;
    readU32: (name: string) => number;
    readU64: (name: string) => number;
    writeU64: (name: string, val: number) => void;
    readUnsigned: (name: string) => number;
    writeSize: (name: string, val: number) => void;
    writeSSize: (name: string, val: number) => void;
    writeUnsigned: (name: string, val: number) => void;
    command: (name: string) => void;
  }
};

export const version = ctl?.readString('version');

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

export const tuning = {
  get backgroundThread() {
    return ctl?.readBool('background_thread') || false;
  },
  set backgroundThread(val: boolean) {
    ctl?.writeBool('background_thread', val);
  },
  get dirtyDecayMs() {
    return ctl?.readSSize('arenas.dirty_decay_ms') || 0;
  },
  set dirtyDecayMs(val: number) {
    ctl?.writeSSize('arenas.dirty_decay_ms', val);
  },
  get muzzyDecayMs() {
    return ctl?.readSSize('arenas.muzzy_decay_ms') || 0;
  },
  set muzzyDecayMs(val: number) {
    ctl?.writeSSize('arenas.muzzy_decay_ms', val);
  },
};

let _prefix: string;
export const prof = {
  get enabled() {
    return ctl?.readBool('opt.prof');
  },
  get active() {
    return ctl?.readBool('prof.active') || false;
  },
  set active(status: boolean) {
    ctl?.writeBool('prof.active', status);
  },
  dump(filename?: string) {
    if (!ctl) {
      throw new Error('jemalloc is not loaded');
    }
    if (filename) {
      ctl.writeString('prof.dump', filename);
    } else {
      ctl.command('prof.dump');
    }
  },
  get prefix() { 
    return _prefix || ctl?.readString('opt.prof_prefix') || '';
  },
  set prefix(prefix: string) {
    if (ctl) {
      ctl.writeString('prof.prefix', prefix);
      _prefix = prefix; // there is no getter for this in jemalloc
    }
  },
  get gdump() {
    return ctl?.readBool('prof.gdump') || false;
  },
  set gdump(enabled: boolean) {
    ctl?.writeBool('prof.gdump', enabled);
  },

  reset(sampleRate?: number) {
    if (!ctl) {
      throw new Error('jemalloc is not loaded');
    }
    if (sampleRate !== undefined) {
      ctl.writeSize('prof.reset', sampleRate);
    } else {
      ctl.command('prof.reset');
    }
  },
  get lgSample() {
    return ctl?.readSize('prof.lg_sample') || 0;
  },
  get interval() {
    return ctl?.readU64('prof.interval') || 0;
  },
};

export const stats = {
  get allocated() {
    return ctl?.readSize('stats.allocated') || 0;
  },
  get active() {
    return ctl?.readSize('stats.active') || 0;
  },
  get resident() {
    return ctl?.readSize('stats.resident') || 0;
  },
  get mapped() {
    return ctl?.readSize('stats.mapped') || 0;
  },
  get retained() {
    return ctl?.readSize('stats.retained') || 0;
  },
  get metadata() {
    return ctl?.readSize('stats.metadata') || 0;
  },
  get backgroundThread() {
    return {
      numThreads: ctl?.readSize('stats.background_thread.num_threads'),
      numRuns: ctl?.readU64('stats.background_thread.num_runs'),
      runInterval: ctl?.readU64('stats.background_thread.run_interval')
    };
  },
};

export const arenas = {
  get narenas() {
    return ctl?.readUnsigned('arenas.narenas');
  },
  get quantum() {
    return ctl?.readSize('arenas.quantum');
  },
  get page() {
    return ctl?.readSize('arenas.page');
  },
  get tcacheMax() {
    return ctl?.readSize('arenas.tcache_max');
  },
  get nbins() {
    return ctl?.readUnsigned('arenas.nbins');
  },
  get nhbins() {
    return ctl?.readUnsigned('arenas.nhbins');
  },
  getArenaStats(arenaIndex: number) {
    if (!ctl) {
      throw new Error('jemalloc is not loaded');
    }

    const statsPrefix = `stats.arenas.${arenaIndex}`;
    return {
      pactive: ctl.readSize(`${statsPrefix}.pactive`),
      pdirty: ctl.readSize(`${statsPrefix}.pdirty`),
      pmuzzy: ctl.readSize(`${statsPrefix}.pmuzzy`),
      mapped: ctl.readSize(`${statsPrefix}.mapped`),
      retained: ctl.readSize(`${statsPrefix}.retained`),
      base: ctl.readSize(`${statsPrefix}.base`),
      internal: ctl.readSize(`${statsPrefix}.internal`),
      resident: ctl.readSize(`${statsPrefix}.resident`),
      dirtyNpurge: ctl.readU64(`${statsPrefix}.dirty_npurge`),
      dirtyNmadvise: ctl.readU64(`${statsPrefix}.dirty_nmadvise`),
      dirtyPurged: ctl.readU64(`${statsPrefix}.dirty_purged`),
      muzzyNpurge: ctl.readU64(`${statsPrefix}.muzzy_npurge`),
      muzzyNmadvise: ctl.readU64(`${statsPrefix}.muzzy_nmadvise`),
      muzzyPurged: ctl.readU64(`${statsPrefix}.muzzy_purged`),
      nthreads: ctl.readUnsigned(`${statsPrefix}.nthreads`),
      uptime: ctl.readU64(`${statsPrefix}.uptime`),
      extentAvail: ctl.readSize(`${statsPrefix}.extent_avail`),
      smallAllocated: ctl.readSize(`${statsPrefix}.small.allocated`),
      largeAllocated: ctl.readSize(`${statsPrefix}.large.allocated`),
      lageNmalloc: ctl.readU64(`${statsPrefix}.large.nmalloc`),
      largeNdalloc: ctl.readU64(`${statsPrefix}.large.ndalloc`),
      largeNrequests: ctl.readU64(`${statsPrefix}.large.nrequests`),
      largeNfills: ctl.readU64(`${statsPrefix}.large.nfills`),
      largeNflushes: ctl.readU64(`${statsPrefix}.large.nflushes`),
      // Other stats can be implemented as needed
    };
  },
};

export function flushThreadCache() {
  if (!ctl) {
    throw new Error('jemalloc is not loaded');
  }
  ctl.command('thread.tcache.flush');
}

export function progressEpoch() {
  if (!ctl) {
    throw new Error('jemalloc is not loaded');
  }
  ctl.writeU64('epoch', (Date.now() / 1000) | 0);
}

export function getHeapUsage() {
  if (!ctl) {
    throw new Error('jemalloc is not loaded');
  }
  progressEpoch();
  const allocated = stats.allocated;
  const mapped = stats.mapped
  const retained = stats.retained;

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