# CSE320 System Fundamentals II — Cache Memories

**YoungMin Kwon**

---

## Cache Memories

- **L1 cache**
  - Cache memory below registers, access time: ~4 cycles
  - Separate d-cache and i-cache

- **L2 cache**
  - Cache memory below L1 cache, access time: ~10 cycles
  - Unified cache: data and instructions

- **L3 cache**
  - Cache memory below L2 cache, access time: ~50 cycles
  - Shared by all cores

**Architecture overview (Intel Core i7 cache hierarchy):**

```
Core 0                          Core 3
┌──────────────────┐    ┌──────────────────┐
│      Regs        │    │      Regs        │
│  ┌─────┬─────┐   │    │  ┌─────┬─────┐   │
│  │ L1  │ L1  │   │ .. │  │ L1  │ L1  │   │
│  │d-cac│i-cac│   │    │  │d-cac│i-cac│   │
│  └─────┴─────┘   │    │  └─────┴─────┘   │
│  L2 unified cache│    │  L2 unified cache│
└──────────────────┘    └──────────────────┘
         L3 unified cache (shared by all cores)
─────────────────────────────────────────────
                Main memory
```

**CPU chip data path:**

```
CPU chip
┌────────────────────┐
│   Register file     │
│   Cache memories ⇔ ALU │
│         ↕           │
│   Bus interface     │
└────────┬───────────┘
     System bus    Memory bus
         ↕           ↕
      I/O bridge ⇔ Main memory
```

---

## Generic Cache Memory Organization

- **S**: (= 2^s), number of cache sets
- **E**: number of lines in a cache set
- **B**: (= 2^b), number of bytes in a line
- **m**: memory address bits
- **Valid bit**: whether the line contains valid data
- **t**: (= m − (b + s)), number of bits in a tag
- **C**: (= B × E × S), cache size (data bytes only)

**Cache structure:**

```
                1 valid bit  t tag bits   B = 2^b bytes per cache block
                per line     per line
              ┌───────┬──────┬───┬───┬───┬─────┐
Set 0:        │ Valid  │ Tag  │ 0 │ 1 │...│ B−1 │  ⎤
              ├───────┼──────┼───┼───┼───┼─────┤  ⎥ E lines
              │ Valid  │ Tag  │ 0 │ 1 │...│ B−1 │  ⎦ per set
              ├───────┼──────┼───┼───┼───┼─────┤
Set 1:        │ Valid  │ Tag  │ 0 │ 1 │...│ B−1 │
              │ Valid  │ Tag  │ 0 │ 1 │...│ B−1 │
              │        ...                      │
              ├───────┼──────┼───┼───┼───┼─────┤
Set S−1:      │ Valid  │ Tag  │ 0 │ 1 │...│ B−1 │
              │ Valid  │ Tag  │ 0 │ 1 │...│ B−1 │
              └───────┴──────┴───┴───┴───┴─────┘

Cache size: C = B × E × S data bytes
```

**Address format:**

```
  m−1                                        0
  ┌──────────┬──────────┬──────────┐
  │  t bits  │  s bits  │  b bits  │
  │   Tag    │Set index │Block off.│
  └──────────┴──────────┴──────────┘
```

---

## Caches

**Classes of caches by E (number of lines per set):**

- **E = 1**: direct-mapped cache (1 line per set)
- **1 < E < C/B**: set-associative cache
- **E = C/B**: fully-associative cache (1 set)

**Accessing the requested word from cache:**

1. Set selection
2. Line matching
3. Word extraction

---

## Direct-Mapped Cache

### Set Selection

Select the set using the **set index** as an index.

```
                          Set 0:  │ Valid │ Tag │ Cache block │
       Selected set ──►   Set 1:  │ Valid │ Tag │ Cache block │
              │                      ...
  t bits   s bits   b bits  Set S−1: │ Valid │ Tag │ Cache block │
┌────────┬────────┬────────┐
│  Tag   │ 00001  │  b bits│
└────────┴────────┴────────┘
  Tag    Set index  Block offset
```

### Line Matching

A word is contained in the line **if and only if**:
1. The **valid bit** is set (= 1), **AND**
2. The **tag** of the line matches the tag of the address

### Word Extraction

Find the word in the line indexed by the **block offset**.

```
  = 1?  (1) The valid bit must be set.
                 0   1   2   3   4   5   6   7
Selected set (i): │ 1 │ 0110 │   │   │   │   │ w0│ w1│ w2│ w3│

  (2) The tag bits in the       (3) If (1) and (2), then
  cache line must match             cache hit, and block
  the tag bits in the address.      offset selects starting byte.

  t bits    s bits    b bits
  0110        i        100
  Tag     Set index  Block offset
```

---

## Direct-Mapped Cache (Action)

**Example parameters:** (S, E, B, m) = (4, 1, 2, 4)

| Address (decimal) | Tag bits (t=1) | Index bits (s=2) | Offset bits (b=1) | Block number (decimal) |
|---|---|---|---|---|
| 0 | 0 | 00 | 0 | 0 |
| 1 | 0 | 00 | 1 | 0 |
| 2 | 0 | 01 | 0 | 1 |
| 3 | 0 | 01 | 1 | 1 |
| 4 | 0 | 10 | 0 | 2 |
| 5 | 0 | 10 | 1 | 2 |
| 6 | 0 | 11 | 0 | 3 |
| 7 | 0 | 11 | 1 | 3 |
| 8 | 1 | 00 | 0 | 4 |
| 9 | 1 | 00 | 1 | 4 |
| 10 | 1 | 01 | 0 | 5 |
| 11 | 1 | 01 | 1 | 5 |
| 12 | 1 | 10 | 0 | 6 |
| 13 | 1 | 10 | 1 | 6 |
| 14 | 1 | 11 | 0 | 7 |
| 15 | 1 | 11 | 1 | 7 |

### Example Trace

**Read from address 0: cache miss**

| Set | Valid | Tag | block[0] | block[1] |
|---|---|---|---|---|
| 0 | 1 | 0 | m[0] | m[1] |
| 1 | 0 | | | |
| 2 | 0 | | | |
| 3 | 0 | | | |

**Read from address 1: cache hit** (same set 0, same tag 0, offset = 1 → hit)

**Read from address 13: cache miss** (address 13 → tag=1, set=2, offset=1)

| Set | Valid | Tag | block[0] | block[1] |
|---|---|---|---|---|
| 0 | 1 | 0 | m[0] | m[1] |
| 1 | 0 | | | |
| 2 | 1 | 1 | m[12] | m[13] |
| 3 | 0 | | | |

**Read from address 8: cache miss** (address 8 → tag=1, set=0, offset=0 → evicts block at set 0!)

| Set | Valid | Tag | block[0] | block[1] |
|---|---|---|---|---|
| 0 | 1 | 1 | m[8] | m[9] |
| 1 | 0 | | | |
| 2 | 1 | 1 | m[12] | m[13] |
| 3 | 0 | | | |

**Read from address 0: cache miss** (address 0 → tag=0, set=0 → conflict miss, evicts again!)

| Set | Valid | Tag | block[0] | block[1] |
|---|---|---|---|---|
| 0 | 1 | 0 | m[0] | m[1] |
| 1 | 0 | | | |
| 2 | 1 | 1 | m[12] | m[13] |
| 3 | 0 | | | |

---

## Why Set-Index with the Middle Bits

If the **high-order bits** are used as a set-index, then some contiguous memory blocks will be mapped to the **same cache set**.

- **High-order bit indexing**: contiguous addresses all map to the same set → poor utilization
- **Middle-order bit indexing**: contiguous addresses spread across different sets → better utilization

**Example of poor spatial locality when using high-order indexing:**

```c
// example: poor spatial locality
for (i = 0; i < n; i++)
    a[i] = a[i+1];
// a[0] = a[1]
// a[1] = a[2]
// a[2] = a[3]
// ...
```

With middle-bit indexing, consecutive memory addresses map to **different cache sets**, which avoids conflict misses for sequential access patterns.

---

## Set Associative Cache

### Set Selection

Use the **set index** to select the set (same as direct-mapped).

```
                       ┌───────┬──────┬─────────────┐
         Set 0:        │ Valid  │ Tag  │ Cache block  │
                       │ Valid  │ Tag  │ Cache block  │
                       ├───────┼──────┼─────────────┤
Selected set ──► Set 1:│ Valid  │ Tag  │ Cache block  │
                       │ Valid  │ Tag  │ Cache block  │
                       │         ...                  │
                       ├───────┼──────┼─────────────┤
         Set S−1:      │ Valid  │ Tag  │ Cache block  │
                       │ Valid  │ Tag  │ Cache block  │
                       └───────┴──────┴─────────────┘
```

### Line Selection

Within the set, find the **valid line** with the **matching tag**.

```
  = 1?  (1) The valid bit must be set.
                 0   1   2   3   4   5   6   7
Selected       │ 1 │ 1001 │   │   │   │   │   │   │   │   │
set (i):       │ 1 │ 0110 │   │   │   │   │ w0│ w1│ w2│ w3│  ← match!

  (2) The tag bits in one        (3) If (1) and (2), then
  of the cache lines must            cache hit, and block
  match the tag bits in               offset selects starting byte.
  the address.

  t bits    s bits    b bits
  0110        i        100
  Tag     Set index  Block offset
```

### Word Selection

Find the word in the line indexed by the **block offset** (same as direct-mapped).

### Line Replacement on Cache Misses

- **When a line is empty**: Copy the block into the empty line
- **Otherwise**, follow the **replacement policy**:
  - Choose a line at **random**
  - Choose the **least frequently used (LFU)** line
  - Choose the **least recently used (LRU)** line

---

## Fully Associative Cache

```
              ┌───────┬──────┬─────────────┐
              │ Valid  │ Tag  │ Cache block  │
              │ Valid  │ Tag  │ Cache block  │
  Set 0:      │        ...                  │  E = C/B lines in
              │ Valid  │ Tag  │ Cache block  │  the one and only set
              └───────┴──────┴─────────────┘
```

- **No need to select a set**: there is only 1 set
- **Line matching** and **word selection** work the same way as the set associative cache

---

## Issues with Writes: After a Cache HIT

### Write-through

- **Immediately write** the word's cache block to the next lower level
- Causes **bus traffic** for every write

### Write-back

- **Defers the update** as long as possible: updates the lower level only when the data is **evicted**
- Needs a **dirty bit**
- Bus traffic is reduced at the cost of additional complexities

---

## Issues with Writes: After a Cache MISS

### Write-allocate

- **Loads the block** from the lower level and **updates the cache**
- Exploits the **spatial locality**
- Every miss results in a **block transfer** from the lower level

### No-write-allocate

- **Bypass the cache** and **write directly** to the **lower level**

---

## Issues with Writes

### Why Write-back?

- Because of the **larger transfer time**, caches at lower levels of the memory hierarchy use **write-back**
- It exploits the **locality**
- As the logic density increases, the complexity of write-back becomes less of an impediment
- **Write-back / write-allocate** is symmetric to the way read is handled

---

## Real Cache Hierarchy

- **i-cache**: a cache for **instructions**
- **d-cache**: a cache for **data**
- **unified-cache**: a cache for both **instructions and data**

### Characteristics of the Intel Core i7 Cache Hierarchy

| Cache type | Access time (cycles) | Cache size (C) | Assoc. (E) | Block size (B) | Sets (S) |
|---|---|---|---|---|---|
| L1 i-cache | 4 | 32 KB | 8 | 64 B | 64 |
| L1 d-cache | 4 | 32 KB | 8 | 64 B | 64 |
| L2 unified cache | 11 | 256 KB | 8 | 64 B | 512 |
| L3 unified cache | 30–40 | 8 MB | 16 | 64 B | 8192 |

**Question:** What are the number of bits in a tag?
- i7 processors have **52 physical address bits** and **48 virtual address bits**

---

## Cache Performance Metrics

- **Miss rate**: # of misses / # of references
- **Hit rate**: 1 − miss rate
- **Hit time**:
  - Time to deliver a word in the cache to the CPU
  - Includes the times for set identification, line identification, and word selection
- **Miss penalty**:
  - Any additional time required because of a miss

---

## Performance Impact of Cache Parameters

### Impact of Cache Size: Large cache size

- **Increases** hit rate
- **Increases** hit time because of H/W complexity

### Impact of Block Size: Large block size

- **Increases** spatial locality
- **Reduces** number of lines ⇒ **decreases** temporal locality
  - Think about two or more variables at different scopes
- Loading large blocks ⇒ **increases** the miss penalty

### Impact of Associativity: Increasing E

- **Decreases** conflict misses
- **Increases** cost and complexity ⇒ **increased hit time**
- Complexity in choosing a victim line ⇒ **increased miss penalty**

### Impact of Write Strategy

- **Write-through**: simpler to implement
  - Use write buffer
  - Read misses are less expensive
- **Write-back**: fewer transfers

---

## Cache-Friendly Code

### Average Miss Count

- **Stride-k** reference pattern (in terms of words)
- Block size is B
- **min(1, (wordsize × k) / B)** misses per loop iteration

### Example: Stride-1 Access (sumvec)

Words are 4 bytes, cache blocks are 4 words (16 bytes).

```c
int sumvec(int v[N])
{
    int i, sum = 0;

    for (i = 0; i < N; i++)
        sum += v[i];
    return sum;
}
```

| v[i] | i=0 | i=1 | i=2 | i=3 | i=4 | i=5 | i=6 | i=7 |
|---|---|---|---|---|---|---|---|---|
| Access order, [h]it or [m]iss | 1 **[m]** | 2 [h] | 3 [h] | 4 [h] | 5 **[m]** | 6 [h] | 7 [h] | 8 [h] |

→ 25% miss rate (1 miss per 4 accesses)

### Cache-Friendly Principles

- **Repeated reference to local variables are good**
  - Compiler can cache them in the **register file**
  - **Temporal locality**

- **Stride-1 reference pattern is good**
  - Caches at all levels of the memory hierarchy store data as contiguous blocks
  - **Spatial locality**

### Example: Row-major Access (good)

```c
int sumarrayrows(int a[M][N])
{
    int i, j, sum = 0;

    for (i = 0; i < M; i++)
        for (j = 0; j < N; j++)
            sum += a[i][j];
    return sum;
}
```

| a[i][j] | j=0 | j=1 | j=2 | j=3 | j=4 | j=5 | j=6 | j=7 |
|---|---|---|---|---|---|---|---|---|
| i=0 | 1 **[m]** | 2 [h] | 3 [h] | 4 [h] | 5 **[m]** | 6 [h] | 7 [h] | 8 [h] |
| i=1 | 9 **[m]** | 10 [h] | 11 [h] | 12 [h] | 13 **[m]** | 14 [h] | 15 [h] | 16 [h] |
| i=2 | 17 **[m]** | 18 [h] | 19 [h] | 20 [h] | 21 **[m]** | 22 [h] | 23 [h] | 24 [h] |
| i=3 | 25 **[m]** | 26 [h] | 27 [h] | 28 [h] | 29 **[m]** | 30 [h] | 31 [h] | 32 [h] |

→ 25% miss rate — stride-1 access follows row-major layout in memory!

### Example: Column-major Access (bad)

```c
int sumarraycols(int a[M][N])
{
    int i, j, sum = 0;

    for (j = 0; j < N; j++)
        for (i = 0; i < M; i++)
            sum += a[i][j];
    return sum;
}
```

| a[i][j] | j=0 | j=1 | j=2 | j=3 | j=4 | j=5 | j=6 | j=7 |
|---|---|---|---|---|---|---|---|---|
| i=0 | 1 **[m]** | 5 **[m]** | 9 **[m]** | 13 **[m]** | 17 **[m]** | 21 **[m]** | 25 **[m]** | 29 **[m]** |
| i=1 | 2 **[m]** | 6 **[m]** | 10 **[m]** | 14 **[m]** | 18 **[m]** | 22 **[m]** | 26 **[m]** | 30 **[m]** |
| i=2 | 3 **[m]** | 7 **[m]** | 11 **[m]** | 15 **[m]** | 19 **[m]** | 23 **[m]** | 27 **[m]** | 31 **[m]** |
| i=3 | 4 **[m]** | 8 **[m]** | 12 **[m]** | 16 **[m]** | 20 **[m]** | 24 **[m]** | 28 **[m]** | 32 **[m]** |

→ 100% miss rate — stride-N access jumps across rows, no spatial locality!

---

## The Memory Mountain

### Read Throughput (Read Bandwidth)

- The rate that a program reads data from the memory system
- Reads **n** bytes over a period of **s** seconds ⇒ throughput = **n/s**

### Key Observations

- **Smaller size of data set**
  - Results in a smaller working set
  - Better **temporal locality**

- **Smaller stride**
  - Results in better **spatial locality**

### Memory Mountain Graph

The Memory Mountain is a 3D surface plot with:
- **X-axis**: Working set size (bytes) — from 16k to 128m
- **Y-axis**: Stride (×8 bytes) — from s1 to s11
- **Z-axis**: Read throughput (MB/s)

Key regions visible on the mountain:
- **Peak (L1)**: ~14,000 MB/s — small working set, stride-1
- **L2 region**: ~4,000–6,000 MB/s
- **L3 region**: ~2,000–2,500 MB/s
- **Main memory**: ~1,000–1,500 MB/s — large working set, large stride

The **ridges** (horizontal plateaus) show **temporal locality** effects — when the working set fits in a cache level, throughput stays high regardless of stride.

The **slopes** (decreasing throughput as stride increases) show **spatial locality** effects — larger strides mean fewer cache hits within each block.

### Read Throughput vs Working Set Size (stride-1)

| Working Set Size | Throughput Region |
|---|---|
| 16k – 32k | **L1 cache** (~12,000–13,000 MB/s) |
| 64k – 256k | **L2 cache** (~4,000–5,000 MB/s) |
| 512k – 8m | **L3 cache** (~2,500 MB/s) |
| 16m – 128m | **Main memory** (~1,000–1,500 MB/s) |

### Read Throughput vs Stride (large working set)

As stride increases from s1 to s11, throughput drops from ~11,500 MB/s to ~2,000 MB/s. Beyond s8 (stride ≥ 64 bytes = one cache line), throughput flattens — every access is a new cache line, so spatial locality is fully exhausted ("one access per cache line").

---

## Exploiting Locality

- **Focus on the inner loop**

- **Try to maximize the spatial locality**
  - Reading data objects sequentially with **stride 1**

- **Try to maximize the temporal locality**
  - Use a data object **as often as possible** once it has been read from memory
