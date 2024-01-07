# jemalloc-tools

`jemalloc-tools` is a Node.JS module providing a comprehensive interface to control and monitor memory allocation behavior in applications using `jemalloc`, a scalable concurrent malloc implementation. This module wraps the `mallctl` interface of `jemalloc`, offering a variety of functionalities including tuning, profiling, and retrieving detailed memory usage statistics.

See also this awesome [use case on heap profiling](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Heap-Profiling).

## Why you should use jemalloc with Node.JS?

- Prevent issued with memory fragmentation. In my case, my long running server processes would crash due to OOM. After adopting `jemalloc` the memory usage stabilized.
- Heap profiling / native memory leak detection. Use the `prof` feature of `jemalloc` and use `jeprof` tools to analyze dumps.


## Features of this module

- **Profiling Controls**: Manage profiling of memory allocations, including enabling/disabling profiling, dumping profiles, and adjusting profiling parameters.
- **Memory Allocation Statistics**: Track various memory allocation metrics.
- **Tuning Parameters**: Adjust `jemalloc` parameters for optimal performance based on application needs.
- **Cache Management**: Flush thread-specific caches.
- **Heap Usage Information**: Provides an overview of the heap usage by the application.

## Installation

You first you need to have your Node app set up to use `jemalloc`.

### Installing jemalloc on Ubuntu

To install `jemalloc` on Ubuntu, you can use the package manager:

```bash
sudo apt-get update
sudo apt-get install libjemalloc-dev
```

### Loading jemalloc with LD_PRELOAD

To use `jemalloc` in your application, you can preload it using the `LD_PRELOAD` environment variable. This can be done by setting the variable before running your application:

```bash
LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2 your_application
```

Replace `/usr/lib/x86_64-linux-gnu/libjemalloc.so.2` with the actual path to the `jemalloc` shared library on your system.

### Node.js Module Installation

Install the `jemalloc-tools` module using npm or yarn:

```bash
npm install jemalloc-tools
# or
yarn add jemalloc-tools
```

## Usage

```typescript
import { ctl, version, tuning, prof, decay, stats, arenas, flushThreadCache, getHeapUsage } from 'jemalloc-tools';

// Most functionity will either throw or return undefined/0 if jemalloc is not present.
const hasJemalloc = !!version; 

// Retrieve the jemalloc version
console.log(`jemalloc version: ${version}`);

// Tuning example (can also be done via MALLOC_CONF and retrieved here)
tuning.backgroundThread = true; // collect free'd memory in background threads
tuning.dirtyDecayMs = 30000; // set higher to save CPU usage
tuning.muzzyDecayMs = 30000;


if (prof.enabled) { // it's useful to start the app with prof:true:prof_enabled:false
  // Profiling example
  prof.active = true;
  prof.prefix = `my_node_app`;
  prof.dump(); // will dump using the prefix above, or the default pefix
  prof.dump('/tmp/profile_output'); // will dump a prof to this specified file
  prof.gdump = true;
  prof.reset();
}

// Get simple heap usage statistics
const heapUsage = getHeapUsage();
console.log(`Heap used: ${heapUsage.used}, Total: ${heapUsage.total}`);

// Flush thread cache (could be used along with process.gc() perhaps)
flushThreadCache();

// Get arena statistics
const arenaStats = arenas.getArenaStats(0);
console.log(`Arena 0 stats:`, arenaStats);
```

Look at Typescipt bindings and [jemalloc mallctl docs](https://jemalloc.net/jemalloc.3.html#mallctl_namespace).

## API

### `version`
Retrieves the current version of `jemalloc` and can be used to check if it's being used as the current allocator.

### `ctl`
Direct mapping to the `mallctl` interface of `jemalloc`. It can be used to implement any missing functionality from this module by hand. Of couse Pull Requests are welcome.

### `tuning`
Adjustable parameters for tuning `jemalloc` behavior, including `background_thread`, `dirty_decay_ms`, and `muzzy_decay_ms`.

### `prof`
Controls for memory allocation profiling, including enabling/disabling profiling, managing dump files, and resetting profiling statistics.

### `stats`
Access various statistics such as the amount of memory allocated, active, resident, and more.

### `arenas`
Interface for working with `jemalloc` arenas, including retrieving arena statistics.

### `flushThreadCache()`
Flushes the thread-specific cache.

### `getHeapUsage()`
Progesses epoch & returns an object containing information about the heap usage.

### `progressEpoch()`
Progresses epoch, a pre-requisite to get fresh stats.

## Contributing

Contributions to `jemalloc-tools` are welcome. Please submit a MR.

## License

This module is based on https://github.com/alxvasilev/malloc-tools

The license is BSD
