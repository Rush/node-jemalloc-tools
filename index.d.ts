export declare const ctl: {
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
} | undefined;
export declare const version: string | undefined;
export declare const tuning: {
    backgroundThread: boolean;
    dirtyDecayMs: number;
    muzzyDecayMs: number;
};
export declare const prof: {
    readonly enabled: boolean | undefined;
    active: boolean;
    dump(filename?: string): void;
    prefix: string;
    gdump: boolean;
    reset(sampleRate?: number): void;
    readonly lgSample: number;
    readonly interval: number;
};
export declare const decay: {
    dirty: number;
    muzzy: number;
};
export declare const stats: {
    readonly allocated: number;
    readonly active: number;
    readonly resident: number;
    readonly mapped: number;
    readonly retained: number;
    readonly metadata: number;
    readonly backgroundThread: {
        numThreads: number | undefined;
        numRuns: number | undefined;
        runInterval: number | undefined;
    };
};
export declare const arenas: {
    readonly narenas: number | undefined;
    readonly quantum: number | undefined;
    readonly page: number | undefined;
    readonly tcacheMax: number | undefined;
    readonly nbins: number | undefined;
    readonly nhbins: number | undefined;
    dirtyDecayMs: number;
    muzzyDecayMs: number;
    getArenaStats(arenaIndex: number): {
        pactive: number;
        pdirty: number;
        pmuzzy: number;
        mapped: number;
        retained: number;
        base: number;
        internal: number;
        resident: number;
        dirtyNpurge: number;
        dirtyNmadvise: number;
        dirtyPurged: number;
        muzzyNpurge: number;
        muzzyNmadvise: number;
        muzzyPurged: number;
        nthreads: number;
        uptime: number;
        extentAvail: number;
        smallAllocated: number;
        largeAllocated: number;
        lageNmalloc: number;
        largeNdalloc: number;
        largeNrequests: number;
        largeNfills: number;
        largeNflushes: number;
    };
};
export declare function flushThreadCache(): void;
export declare function getHeapUsage(): {
    used: number;
    total: number;
};
