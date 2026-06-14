# CSE320 System Fundamentals II
## The Memory Hierarchy

**YoungMin Kwon**

---

## Memory System

### A Memory System

A **hierarchy** of storage devices with different **capacities**, **costs**, and **access times**.

Examples:

- **Registers** (0 cycles)
- **Cache memories** (4 ~ 75 cycles)
- **Main memory** (hundreds of cycles)
- **Disks** (millions of cycles)

### Locality

Well-written programs tend to access the **same set of data** items over and over again.

```c
int sum(int *items, int nr_item) {
    int i, s = 0;

    for(i = 0; i < nr_item; i++)
        s += items[i];

    return s;
}
```

**Memory hierarchy** works because such programs tend to **access a particular level more frequently** than the next lower level.

---

## SRAM: Static Random Access Memory

- Each memory cell is a **flip-flop** implemented with a **6-transistor** circuit
- Flip-flops make **bistable** memory cells
  - Stable left / Unstable / Stable right
- Memory cells **retain their values** as long as they are powered
- **Robust** against disturbances

---

## DRAM: Dynamic RAM

- Each bit is stored as charge on a **capacitor**
- **Sensitive** to any disturbances
  - Exposure to light will cause the capacitor voltage change
  - Image sensors in digital cameras are essentially arrays of DRAM cells
- **Leakage current** causes a DRAM cell to lose its charge within **10 to 100 milliseconds**
  - Memory system must periodically **refresh** every bit of memory (read and rewrite it)

### SRAM vs DRAM Comparison

| | Transistors per bit | Relative access time | Persistent? | Sensitive? | Relative cost | Applications |
|---|---|---|---|---|---|---|
| **SRAM** | 6 | 1× | Yes | No | 100× | Cache memory |
| **DRAM** | 1 | 10× | No | Yes | 1× | Main mem, frame buffers |

---

## DRAM (Supercells)

- The cells in a **d × w** DRAM chip are partitioned into **d supercells**, each consisting of **w** DRAM cells (**d · w** bits of information)
- Supercells are organized as a rectangular array with **r rows** and **c columns**, where **r · c = d**

Example: High-level view of a 128-bit 16 × 8 DRAM chip

- 4 rows × 4 columns of supercells
- Each supercell stores 8 bits (1 byte)
- Memory controller communicates via 2-bit addr and 8-bit data lines
- Internal row buffer holds the selected row

### Reading a Supercell

To read the contents of **supercell (i, j)**:

- The memory controller sends the **row address i** (**RAS**: Row Access Strobe), followed by the **column address j** (**CAS**: Column Access Strobe)

Example: Reading supercell (2, 1)

1. Send **RAS = 2** → Row 2 is copied into the internal row buffer
2. Send **CAS = 1** → Supercell (2, 1) data is sent back via the data pins

---

## DRAM (Memory Modules)

- DRAM chips are packaged in **memory modules**
- Example: **64 MB** using **eight 8M × 8** DRAM chips (64-Mbit)
  - Each supercell stores **1 byte**
  - Each **64-bit word** is represented by **8 supercells** whose address is **(i, j)**
  - Bits 0–7 from DRAM chip 0, bits 8–15 from DRAM chip 1, ... bits 56–63 from DRAM chip 7
  - All 8 chips supply their byte simultaneously to form the full 64-bit doubleword

---

## Accessing Main Memory: BUS

### BUS

- A shorthand for the Latin **omnibus**, also called **data highway**
- A collection of **parallel wires** that carry **address**, **data**, and **control**
- Data flows back and forth between the processor and the main memory over **shared electrical conduits** called **buses**

### Bus Structure

- **Address and data** can share the same set of wires
- **Control wires** signal:
  - Main memory or I/O devices
  - Address or data
  - Read or write

### System Architecture

```
CPU chip
┌─────────────────┐
│  Register file   │
│       ↕     ALU  │
│  Bus interface   │
└────────┬────────┘
         │ System bus
    ┌────┴────┐
    │  I/O    │
    │ bridge  │
    └────┬────┘
         │ Memory bus
    ┌────┴────┐
    │  Main   │
    │ memory  │
    └─────────┘
```

---

## Memory Read

**Instruction:** `movl A, %eax`

**Step (a):** CPU places address **A** on the memory bus.

**Step (b):** Main memory reads **A** from the bus, retrieves word **x**, and places it on the bus.

**Step (c):** CPU reads word **x** from the bus, and copies it into register **%eax**.

---

## Memory Write

**Instruction:** `movl %eax, A`

**Step (a):** CPU places address **A** on the memory bus. Main memory reads it and waits for the data word.

**Step (b):** CPU places data word **y** on the bus.

**Step (c):** Main memory reads data word **y** from the bus and stores it at address **A**.

---

## Disk Storage

### Disk Structure

- Disks have **platters**
- Each platter consists of two **surfaces**
- Each surface consists of a collection of rings called **tracks**
- Each track is partitioned into **sectors**
- Each sector contains equal number of data bits (**512 bytes**)
- Sectors are separated by **gaps**

### Multi-Platter Structure

- Multiple platters stacked on a **spindle**
- Each platter has 2 surfaces (e.g., 3 platters = 6 surfaces)
- A **cylinder** is formed by tracks at the same position across all surfaces

---

## Disk Capacity

**Formula:**

```
Disk capacity = (# bytes / sector) × (average # sectors / track) × (# tracks / surface)
              × (# surfaces / platter) × (# platters / disk)
```

**Example:** A disk with **5 platters**, **512 bytes per sector**, **20,000 tracks per surface**, an average of **300 sectors per track**:

```
Disk capacity = 512 bytes/sector × 300 sectors/track × 20,000 tracks/surface
              × 2 surfaces/platter × 5 platters/disk
             = 30,720,000,000 bytes
             = 30.72 GB
```

---

## Disk Operation

- The disk surface spins at a **fixed rotational rate**
- The **read/write head** is attached to the end of the **arm** and flies over the disk surface on a thin cushion of air
- By moving **radially**, the arm can position the read/write head over any track

### Access Time

**Seek time:**
- The time required to move the arm to the track
- Average: **3 ~ 9 msec**, Max: **~20 msec**

**Rotational latency:**
- The time for the sector to move under the head
- **1/2 × 1/RPM × 60 sec/1 min**

**Transfer time:**
- The time for a sector to be read
- **1/RPM × 1/(avg # of sectors per track) × 60 sec/1 min**

### Access Time Calculation Example

| Parameter | Value |
|---|---|
| Rotational rate | 7200 RPM |
| T_avg seek | 9 ms |
| Average # sectors/track | 400 |

```
T_avg rotation = 1/2 × T_max rotation
               = 1/2 × (60 secs / 7200 RPM) × 1000 ms/sec
               ≈ 4 ms

T_avg transfer = 60 / 7200 RPM × 1 / 400 sectors/track × 1000 ms/sec
               ≈ 0.02 ms

T_access = T_avg seek + T_avg rotation + T_avg transfer
         = 9 ms + 4 ms + 0.02 ms
         = 13.02 ms
```

---

## Access Time Comparison

To read **512 bytes**:

| Storage | Access Time | Comparison |
|---|---|---|
| **SRAM** | 256 ns | — |
| **DRAM** | 4,000 ns | — |
| **Disk** | 10 ms | 40,000× larger than SRAM, 2,500× larger than DRAM |

---

## Logical Disk Blocks

- To hide the complexity (specifying **surface#**, **track#**, **sector#**) from the OS, modern disks provide a simpler view
  - **B** sector-size **logical blocks** are numbered: **0, 1, …, B-1**
  - **Disk controller** maintains the **mapping** between logical **block numbers** and actual **disk sectors**

---

## Connecting I/O Devices

```
                CPU
        ┌──────────────┐
        │ Register file │
        │    ↕    ALU   │
        │ Bus interface │
        └──────┬───────┘
               │ System bus      Memory bus
          ┌────┴────┐          ┌─────────┐
          │  I/O    ├──────────┤  Main   │
          │ bridge  │          │ memory  │
          └────┬────┘          └─────────┘
               │
        ═══════╪══════════════════════ I/O bus
        │      │              │         │
   ┌────┴──┐ ┌─┴───────┐ ┌───┴────┐  Expansion
   │  USB  │ │ Graphics │ │Host bus│   slots
   │ ctrl  │ │ adapter  │ │adaptor │
   └──┬──┬─┘ └────┬────┘ │SCSI/   │
   │  │  │        │      │ SATA   │
Mouse SSD Kbd  Monitor   └───┬────┘
                          ┌───┴────┐
                          │ Disk   │
                          │ ctrl   │
                          └───┬────┘
                          ┌───┴────┐
                          │ Disk   │
                          │ drive  │
                          └────────┘
```

---

## Reading a Disk Sector

### Step 1

The CPU initiates a disk read by writing a **command**, **logical block number**, and **destination memory address** to the memory-mapped address associated with the disk.

- Process is moved from **Ready Queue** to **Blocked Queue** (waiting state)

### Step 2

The **disk controller** reads the sector and performs a **DMA transfer** into main memory.

- CPU is free to execute other tasks (other processes from the Ready Queue can run)

### Step 3

When the **DMA transfer is complete**, the disk controller notifies the CPU with an **interrupt**.

- The blocked process is woken up and placed back on the **Ready Queue**

---

## Storage Technology Trend (2015 vs 1985)

| Technology | Metric | Improvement Factor |
|---|---|---|
| **SRAM** | $/MB | 116× cheaper |
| | Access (ns) | 115× faster |
| **DRAM** | $/MB | 44,000× cheaper |
| | Access (ns) | 10× faster |
| | Typical size (MB) | 62,500× larger |
| **Rotating Disk** | $/GB | 3,333,333× cheaper |
| | Seek time (ms) | 25× faster |
| | Typical Size (GB) | 300,000× larger |
| **CPU** | Effective Cycle time (ns) | 2,075× faster |

---

## Locality

### Temporal Locality

A memory location referenced once is likely to be referenced **again in the near future**.

### Spatial Locality

If a memory location is referenced, its **nearby locations** are likely to be referenced in the near future.

```c
int sum(int *items, int nr_item) {
    int i, s = 0;

    for(i = 0; i < nr_item; i++)
        s += items[i];

    return s;
}
```

- **`s`**: has temporal locality (accessed every iteration)
- **`items[i]`**: has spatial locality (sequential access through array)

### Cache

- **Main memory** as a cache for the **virtual memory**
- **L1, L2, L3 caches** as a cache for **main memory**
- **Local files** as a cache for **network contents**

### Locality Example: Row-major vs Column-major Access

**Program with good spatial locality (row-major order):**

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

| Address | 0 | 4 | 8 | 12 | 16 | 20 |
|---|---|---|---|---|---|---|
| Contents | a₀₀ | a₀₁ | a₀₂ | a₁₀ | a₁₁ | a₁₂ |
| Access order | 1 | 2 | 3 | 4 | 5 | 6 |

**Program with poor spatial locality (column-major order):**

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

| Address | 0 | 4 | 8 | 12 | 16 | 20 |
|---|---|---|---|---|---|---|
| Contents | a₀₀ | a₀₁ | a₀₂ | a₁₀ | a₁₁ | a₁₂ |
| Access order | 1 | 3 | 5 | 2 | 4 | 6 |

---

## Memory Hierarchy

```
         ▲                  ┌──────┐
         │    L0:           │ Regs │  ← CPU registers hold words
  Smaller,                  └──┬───┘    retrieved from cache memory.
  faster,           L1:  ┌────┴────┐
   and                    │L1 cache │  ← L1 cache holds cache lines
  costlier                │ (SRAM)  │    retrieved from L2 cache.
 (per byte)          L2:┌─┴────────┴─┐
  storage               │  L2 cache  │  ← L2 cache holds cache lines
  devices                │  (SRAM)    │    retrieved from L3 cache.
         │          L3:┌─┴────────────┴─┐
         │              │   L3 cache    │  ← L3 cache holds cache lines
                        │   (SRAM)      │    retrieved from memory.
  Larger,          L4:┌─┴──────────────┴──┐
  slower,              │   Main memory    │  ← Main memory holds disk
   and                 │    (DRAM)        │    blocks retrieved from
  cheaper         L5:┌─┴──────────────────┴──┐   local disks.
 (per byte)          │ Local secondary storage│  ← Local disks hold files
  storage            │    (local disks)       │    retrieved from disks on
  devices       L6:┌─┴────────────────────────┴─┐  remote network servers.
         │         │  Remote secondary storage   │
         ▼         │(distributed file systems,   │
                   │      Web servers)            │
                   └──────────────────────────────┘
```

---

## Cache

### Kinds of Cache Misses

- **Cold miss (Compulsory miss):** Initially empty cache — the first access to a block always results in a miss.
- **Conflict miss:** Cache is large enough to hold the referenced data objects, but they are **mapped to the same cache block**.

### Cache Management

| Level | Managed by |
|---|---|
| **Registers** | **Compilers** |
| **L1, L2, L3 caches** | **Hardware** logic |
| **DRAM (Virtual memory)** | **Operating System** and **hardware** |
