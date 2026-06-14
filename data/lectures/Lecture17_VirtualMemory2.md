# CSE320 System Fundamentals II — Virtual Memory 2

**YoungMin Kwon**

---

## Integrating Caches and VM

Whether to use **Virtual or Physical** addresses to access the **SRAM cache** (L1/L2/L3)?

- Most systems opt for **physical addresses**
- Easy for multiple processes to have blocks in the cache
- No need to deal with the memory protection

**Flow:**

```
Processor → (VA) → MMU → (PTEA) → [L1 Cache] → Memory
                         → (PA)  → [L1 Cache]
                                    PA hit → Data
                                    PA miss → Memory → Data
                         PTEA hit → PTE
                         PTEA miss → Memory → PTE
```

---

## Translation Lookaside Buffer (TLB)

- A **small cache of PTEs** in MMU
  - Use **virtual address**
  - Each line holds a block consisting of a single PTE

- If a TLB has **T = 2^t** sets:
  - **TLB Index (TLBI)** consists of the **t least significant bits** of the VPN
  - **TLB Tag (TLBT)** consists of the **remaining bits** in VPN

**Virtual Address Structure:**

```
| TLB tag (TLBT) | TLB index (TLBI) | VPO |
|  n-1      p+t  |  p+t-1         p | p-1  0 |
|<-------- VPN --------->|          |
```

---

## TLB Hit and Miss Operations

### TLB Hit

1. Processor sends VA
2. VPN sent to TLB
3. TLB returns PTE
4. PA sent to Cache/memory
5. Data returned to Processor

### TLB Miss

1. Processor sends VA
2. VPN sent to TLB (miss)
3. PTEA sent to Cache/memory
4. PTE returned to TLB
5. PA sent to Cache/memory
6. Data returned to Processor

---

## Multi-Level Page Table

### Issue

What is the size of page table for 32-bit address space, 4KB pages, 4B PTEs?

**Virtual Address Structure:**

```
| Virtual page number (VPN) | Virtual page offset (VPO) |
| n-1                     p | p-1                     0 |
```

- Page Table Base Register (PTBR) points to the page table
- The VPN acts as index into the page table
- Each entry contains: Valid bit + Physical page number (PPN)
- If valid = 0, then page not in memory → **page fault**

**Physical Address:**

```
| Physical page number (PPN) | Physical page offset (PPO) |
| m-1                      p | p-1                      0 |
```

### Calculation

- Number of VPN bits: 32 – 12 (4KB) = **20**
- Size of page table: 4B × 2^20 = **4MB**
- **4MB page table is in memory all the time**

---

### Solution: Hierarchy of Page Tables

E.g. **2-level page tables:**

- **Level 1** has a page table of 1024 PTEs (4KB)
- **Level 2** page tables have 1024 PTEs (4KB) each
- Each PTE in level 1 is responsible for **4MB chunk** of address space
- If **every page in chunk *i*** is **unallocated**, PTE *i* in level 1 table is **empty**
- If **at least 1 page in chunk *i*** is **allocated**, PTE *i* in level 1 **points to** the base of level 2 page table

---

## 2-Level Page Tables

```
Level 1           Level 2              Virtual
page table        page tables          memory
+---------+       +---------+         +----------+
| PTE 0   |------>| PTE 0   |-------->| VP 0     |  \
| PTE 1   |--+    |  ...    |         |  ...     |   } 2K allocated VM pages
|PTE 2(null)|  |  |PTE 1023 |-------->| VP 1023  |  /  for code and data
|PTE 3(null)|  +->| PTE 0   |-------->| VP 1024  |
|PTE 4(null)|     |  ...    |         |  ...     |
|PTE 5(null)|     |PTE 1023 |-------->| VP 2047  |
|PTE 6(null)|                         |          |
|PTE 7(null)|                         |   Gap    |  } 6K unallocated VM pages
| PTE 8   |------>|1023 null|         |          |
|          |      |  PTEs   |         | 1023     |
| (1K-9)   |      |PTE 1023 |-------->|unallocated} 1023 unallocated pages
|null PTEs |                          | pages    |
+---------+                           | VP 9215  |  } 1 allocated VM page
                                      |  ...     |    for the stack
```

- If PTE in level 1 table is NULL, **no need to have a level 2 table in memory**
- **Only the level 1 table** needs to be in memory at all times

---

## k-Level Page Tables

**Virtual Address:**

```
| VPN 1 | VPN 2 | ... | VPN k | VPO   |
| n-1                         | p-1  0 |
```

- VPN 1 → indexes into **Level 1 page table** → points to Level 2 page table
- VPN 2 → indexes into **Level 2 page table** → points to next level
- ...
- VPN k → indexes into **Level k page table** → gives **PPN**

**Physical Address:**

```
| PPN                   | PPO   |
| m-1                   | p-1  0|
```

---

## Intel Core i7 Memory System

**Virtual Address (VA): 48 bits**

```
| VPN (36 bits) | VPO (12 bits) |
```

**VPN breakdown for TLB:**

```
| TLBT (32 bits) | TLBI (4 bits) |
```

**L1 TLB:** 16 sets, 4 entries/set

**4-Level Page Tables:**

```
| VPN1 (9) | VPN2 (9) | VPN3 (9) | VPN4 (9) |
```

- **CR3** register (PTBR) points to the level 1 page table
- Each VPN field indexes into the corresponding level page table

**Physical Address (PA): 52 bits**

```
| PPN (40 bits) | PPO (12 bits) |
```

**L1 d-cache:** 64 sets, 8 lines/set

```
| CT (40 bits) | CI (6 bits) | CO (6 bits) |
```

**PTE fields:**

- **R/W** bit — read, write permission
- **U/S** — user, super user
- **XD** — execute disable

---

## Linux Virtual Memory System

### Shared Kernel Virtual Memory

- Kernel's code, global data structure
- Virtual pages mapped **directly** to physical pages
- **Identical for each process**

### Private Kernel Virtual Memory

- Page tables, kernel stacks, task structs, mm structs, …
- **Different for each process**

**Process Virtual Memory Layout (low to high):**

```
0x08048000 (32) / 0x40000000 (64)
+---------------------------+
| Program text (.text)      |
| Initialized data (.data)  |
| Uninitialized data (.bss) |
+---------------------------+
| Run-time heap (via malloc)|  ← brk
+---------------------------+
|          ↑                |
|                           |
| Memory mapped region      |
| for shared libraries      |
|                           |
|          ↓                |
+---------------------------+
| User stack                |  ← %esp
+---------------------------+
| Kernel code and data      |  ← Identical for each process
| Physical memory           |
| Process-specific data     |  ← Different for each process
| (page tables, task and    |
|  mm structs, kernel stack)|
+---------------------------+
```

---

## Linux Virtual Memory Areas

### Area

- A **contiguous chunk** of existing (allocated) virtual memory whose pages are related
- E.g., code area, data area, heap, shared library area, user stack
- Each **existing virtual page** is contained **in some area**
- Any **virtual page not** contained **in an area** does **not exist** and cannot be referenced

---

## Linux Virtual Memory Area (Data Structures)

### task_struct (for each task)

- PID, program counter, mm, …

### mm_struct (for virtual memory)

- **pgd** (PTBR) — loaded into **CR3** register
- **mmap** — pointing to `vm_area_struct` list

### vm_area_struct (linked list)

Each node contains:

- `vm_end` — end address of the area
- `vm_start` — start address of the area
- `vm_prot` — r/w permission
- `vm_flags` — shared/private, …
- `vm_next` — pointer to next area struct

**Structure diagram:**

```
task_struct → mm_struct → vm_area_struct list
              |              |
              | pgd          | vm_end, vm_start   → Shared libraries
              | mmap ------->| vm_prot, vm_flags
                             | vm_next
                             |
                             | vm_end, vm_start   → Data
                             | vm_prot (r/w)
                             | vm_flags
                             | vm_next
                             |
                             | vm_end, vm_start   → Text
                             | vm_prot, vm_flags
                             | vm_next
```

---

## Linux Page Fault Exception

Suppose that MMU triggers a **page fault** while translating a **virtual address A**. The kernel page fault handler does:

### 1. Is virtual address A legal?

- Is A in some `vm_area_struct`?
- If **not** → **Segmentation fault** (accessing a non-existing page)

### 2. Is attempted access legal?

- Does the access type match `vm_prot`? (e.g., writing to a read-only page)
- If **not** → **Protection exception** (e.g., violating permission by writing to a read-only page)

### 3. Otherwise

- **Normal page fault**
- → **Swap out/in** the page and **restart** the faulting instruction

---

## Memory Mapping

**Memory mapping** — Initialize the contents of virtual memory area by associating it with an **object on disk**.

### Regular File (in the Linux file system)

- File section is divided into page-size pieces
- **Demand paging** ⇒ pages are loaded only when they are used

### Anonymous File

- A file, created by the kernel, that contains **all binary zeros**
- No data are actually transferred between disks and memory

### Swap File

- Once a virtual page is initialized, it is swapped back and forth between a special **swap file**

---

## Memory Mapping API

```c
#include <sys/mman.h>

// Creates a mapping in the virtual address space (start)
void *mmap(void *start, size_t length, int prot, int flags,
           int fd, off_t offset);
```

**prot:**

- `PROT_EXEC` — pages may be executed
- `PROT_READ` — pages may be read
- `PROT_WRITE` — pages may be written

**flags:**

- `MAP_SHARED` — share this mapping (changes visible to others)
- `MAP_PRIVATE` — create a private copy-on-write mapping
- `MAP_ANONYMOUS` — not backed by any file
- `MAP_FILE` — backed by a file

```c
// Deletes the mapping
int munmap(void *start, size_t length);
```

**Diagram:**

```
Disk file (fd)              Process virtual memory
+-------------+             +-------------------+
|             |             |                   |
|  offset     |             |     start         |
|  (bytes)    |             |  (or address      |
|  +-------+  |             |  chosen by the    |
|  |       |  |  -------->  |  kernel)          |
|  |length |  |             |  +-------------+  |
|  |(bytes)|  |             |  | length      |  |
|  +-------+  |             |  | (bytes)     |  |
|             |             |  +-------------+  |
+-------------+             +-------------------+
 0                           0
```

---

## mmap/munmap Example

```c
// mmap/munmap example
//
int main() {
    // create a file and delete it
    int fd = open("buffer.txt", O_RDWR|O_CREAT|O_TRUNC, S_IRUSR|S_IWUSR);
    ON_FALSE_EXIT(fd >=0, "error: open");
    ON_FALSE_EXIT(unlink("buffer.txt") == 0, "error: unlink");

    // make the file 100 byte in size
    ON_FALSE_EXIT(lseek(fd, 100, SEEK_SET) >= 0, "error: lseek");
    ON_FALSE_EXIT(write(fd, "", 1) == 1, "error: write");

    if (fork() == 0) {
        // map the file to memory
        char *ptr = mmap(NULL, 100, PROT_READ|PROT_WRITE, MAP_SHARED, fd, 0);
        ON_FALSE_EXIT(ptr != (void*)-1, "error: mmap");
        // OK to close the file after mmap
        ON_FALSE_EXIT(close(fd) == 0, "error: close");

        // string copy to shared memory
        strcpy(ptr, "Hello world");

        // unmap the memory
        ON_FALSE_EXIT(munmap(ptr, 100) == 0, "error: munmap");
    }
    else {
        // map the file to memory
        char *ptr = mmap(NULL, 100, PROT_READ|PROT_WRITE, MAP_SHARED, fd, 0);
        ON_FALSE_EXIT(ptr != (void*)-1, "error: mmap");
        // OK to close the file after mmap
        ON_FALSE_EXIT(close(fd) == 0, "error: close");

        // read the shared memory after 1 sec
        sleep(1);
        printf("%s\n", ptr);

        // unmap the memory
        ON_FALSE_EXIT(munmap(ptr, 100) == 0, "error: munmap");
    }
}
```

**What this example does:**

1. Creates and immediately unlinks a temporary file (`buffer.txt`)
2. Makes the file 100 bytes in size
3. Forks the process
4. **Child process:** maps the file into memory with `MAP_SHARED`, writes "Hello world" to shared memory, then unmaps
5. **Parent process:** maps the same file into memory, waits 1 second, reads and prints the shared memory content, then unmaps

---

## Shared Objects

- Many processes have identical **read-only code areas**
  - Linux shell programs have identical code area
  - Standard C library such as `printf` are common
  - Wasteful if each process keeps a duplicate copy

### Shared Object (e.g. `libc.so`)

- If a process **writes to** an area mapped to a **shared object**, the change is **visible to other processes** that mapped the shared object to their virtual memory
- The **shared object on disk** is also **updated**

### Private Object

- Changes made to an area mapped to a **private object** are **not visible** to other processes
- The **original object on disk is not updated**

**Shared Objects Diagram:**

```
Before Process 2 maps:              After Process 2 maps:

Process 1    Physical    Process 2   Process 1    Physical    Process 2
VM           memory      VM          VM           memory      VM
+------+     +------+   +------+    +------+     +------+   +------+
|      |---->|      |   |      |    |      |---->|      |<--|      |
|      |---->|      |   |      |    |      |---->|      |<--|      |
|      |---->|      |   |      |    |      |---->|      |<--|      |
|      |     |      |   |      |    |      |     |      |   |      |
+------+     +------+   +------+    +------+     +------+   +------+
             Shared                              Shared
             object                              object
```

---

## Copy-on-Write

**Private objects** are mapped into virtual memory like shared objects except that:

- Page Table Entries are flagged as **read-only**
- Area struct is flagged as **private copy-on-write (cow)**

When a process tries to **write** to some private areas:

1. A **protection fault** is triggered
2. The fault handler checks that the fault is from the private cow area
3. **Creates a new copy** of the page, updates the page table entry and restores the permissions to the page

**Copy-on-Write Diagram:**

```
Before write:                        After write by Process 2:

Process 1    Physical    Process 2   Process 1    Physical    Process 2
VM           memory      VM          VM           memory      VM
+------+     +------+   +------+    +------+     +------+   +------+
|      |---->|      |<--|      |    |      |---->|      |   |      |
|      |---->|      |<--|      |    |      |---->| cow  |   |      |
|      |---->|      |<--|      |    |      |     |  copy|<--|      |
|      |     |      |   |      |    |      |---->|      |   |      |
+------+     +------+   +------+    +------+     +------+   +------+
             Private                             Private
             cow object                          cow object

                                     Process 2 writes → new copy created
                                     "Write to private copy-on-write page"
```

---

## Fork Function

When **fork** is invoked:

1. Kernel creates data structures for the new process
2. To create a virtual memory for the new process:
   - The current process' **mm_struct**, **area structs** and **page tables** are copied
   - Flag each **page** in both processes as **read-only**
   - Flag each **area struct** in both processes as **private copy-on-write**
3. Both processes have **exactly the same virtual memory**
4. As processes write, **new pages are created by the cow** mechanism

---

## Execve

### 1. Delete existing user areas

### 2. Map private areas

- Create **new area structs** for **code**, **data**, **bss**, **stack**
- All areas are flagged as **private**
- **Code** and **data** areas are mapped to `.text` and `.data`
- **Bss** area is **demand-zero**, mapped to an **anonymous file** whose size is in the executable file
- **Heap** and **stack** are **demand-zero**, of 0 length

### 3. Map shared areas

- **Shared objects** (e.g. `libc.so`) are **dynamically linked** into the program and mapped into the shared region

### 4. Set the program counter (PC)

---

## How the Loader Maps the Areas

```
+----------------------------------+
| User stack                       |  ← Private, demand-zero
|              ↓                   |
+----------------------------------+
|              ↑                   |
| Memory mapped region             |
| for shared libraries             |  ← Shared, file-backed
|   (libc.so .data, .text →)      |
+----------------------------------+
|              ↑                   |
| Run-time heap (via malloc)       |  ← Private, demand-zero
+----------------------------------+
| Uninitialized data (.bss)        |  ← Private, demand-zero
+----------------------------------+
| Initialized data (.data)         |  }
|   (a.out .data →)               |  } ← Private, file-backed
| Program text (.text)             |  }
|   (a.out .text →)               |  }
+----------------------------------+
  0
```
