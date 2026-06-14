# CSE320 System Fundamentals II — Practice Problem Book

> 강의 1~17을 전부 커버하는 기출 스타일 문제집입니다.
> 각 강의당 2문제씩, 총 34문제 + 전체 정답/해설을 수록했습니다.
> 문제 형식은 실제 중간고사(Midterm 1·2)의 출제 방식(용어 매칭 / 코드 빈칸 채우기 / 추적·분석 / 계산)을 따랐습니다.
>
> **사용법:** 먼저 문제만 풀고, 맨 뒤의 **Answer Key**에서 답과 해설을 확인하세요.

---

# Part I. Problems

---

## Lecture 01 — Overview (System Stack)

### P1.1 [4 × 2pt] Abstraction Layers & Interfaces

Choose your answers from: **API, ABI, ISA, POSIX**

1. The interface between **hardware and software** (machine instructions): → ____________
2. The interface between the **OS and libraries**: → ____________
3. The interface between **libraries and applications**: → ____________
4. The standard for library functions that helps **code portability** across operating systems: → ____________

### P1.2 [5 × 2pt] Compilation Pipeline

The compilation of `hello.c` passes through four tools. Fill in the tool name and the resulting file for each stage, and the gcc flag.

```
hello.c --[ 1)______ ]--> hello.i --[ 2)______ ]--> hello.s --[ 3)______ ]--> hello.o --[ 4)______ ]--> hello
```

1. Tool that copies `#include` contents and expands macros: → ____________
2. Tool that converts `hello.i` to `hello.s`: → ____________
3. Tool that converts `hello.s` to `hello.o`: → ____________
4. Tool that resolves the symbol `printf` to its address and produces the executable: → ____________
5. Which gcc flag stops compilation after the assembly stage (generates `hello.s`)? → ____________

---

## Lecture 02 — C Programming: Hello World (Values, Operators, Masks)

### P2.1 [6 × 2pt] Values in C

In C, every literal is a number. State the value (or what it represents) for each expression.

1. `'a'` → ____________
2. `20L` → ____________
3. `3.14F` → ____________
4. `"hello"` → ____________
5. `main` (used as an expression) → ____________
6. Given `int a = 0xff, b = 0x05;`, what is the decimal result of `a & b`? → ____________

### P2.2 [5 × 2pt] Flags and Masks

A 32-bit `unsigned int` packs several fields. The top bit (bit 31) is **gender**. Implement the two macros below using shift and bitwise operators.

```c
#define MALE    (0)
#define FEMALE  (1)

// pack: OR the gender bit into bit 31 of data
#define SET_GENDER(data, gender)   1)________________________

// extract: bit 31, masked to 1 bit
#define GET_GENDER(data)           2)________________________
```

3. Department occupies **3 bits starting at bit 26**. Write `GET_DEPT(data)`: → ____________
4. After `a = SET_GENDER(0, FEMALE);`, what is the hexadecimal value of `a`? → ____________
5. What does `~5` print as a signed `int` (decimal)? → ____________

---

## Lecture 03 — Variables (Types, Scope, Sections)

### P3.1 [6 × 2pt] sizeof and Pointer vs Array

Assume a 64-bit Linux machine. Give the value of each `sizeof` expression.

```c
char  c;  short s;  int i;  long l;
int   a[10];
char  arr[] = "hello world";
char *str   = "hello world";
```

1. `sizeof(c)` → ____  2. `sizeof(s)` → ____  3. `sizeof(l)` → ____
4. `sizeof(a)` → ____
5. `sizeof(arr)` → ____
6. `sizeof(str)` → ____

### P3.2 [7 × 2pt] Variable Scope → Memory Section

Match each variable to the section it is allocated in.
Choose from: **.data, .bss, .rodata, stack, heap**

```c
int g_ini = 3;           // (1)
int g_uni;               // (2)
static int s_ini = 4;    // (3)
const int ec = 300;      // (4)
void foo() {
    int a_uni;                       // (5)
    static int k = 20;               // (6)
    char *p = malloc(10);  /* p itself? the block p points to? */ // (7) the malloc'd block
}
```

1. `g_ini` → ____  2. `g_uni` → ____  3. `s_ini` → ____  4. `ec` → ____
5. `a_uni` → ____  6. local `static int k` → ____  7. the block returned by `malloc` → ____

---

## Lecture 04 — x86 Assembly Language

### P4.1 [6 × 2pt] Addressing, Suffixes, and Semantics (AT&T)

1. In AT&T syntax `op src, dst`, what does `movl $1, %eax` do? → ____________
2. For `movl -5(%rbp, %rsi, 4), %eax`, write the **effective address** formula being loaded from: → ____________
3. What 1-byte operation does the suffix `b` indicate, and what does `q` indicate? → ____________
4. `leaq 8(%rbx, %rcx, 2), %rax` — does this **read memory** or just **compute an address**? → ____________
5. `pushq %rax` is equivalent to which two instructions? → ____________
6. `movzbl %al, %eax` vs `movsbl %al, %eax`: what is the difference? → ____________

### P4.2 [6 × 2pt] C → Assembly (for loop) Analysis

Below is `sum()` compiled to assembly.

```asm
sum:
        pushq   %rbp
        movq    %rsp, %rbp
        movl    $0, -8(%rbp)        # line A
        movl    $0, -4(%rbp)        # line B
        jmp     .L9
.L10:
        movl    -4(%rbp), %eax
        addl    %eax, -8(%rbp)      # line C
        addl    $1, -4(%rbp)        # line D
.L9:
        cmpl    $9, -4(%rbp)        # line E
        jle     .L10
        movl    -8(%rbp), %eax
        popq    %rbp
        ret
```

1. Which stack slot holds the loop variable `i`? → ____________
2. Which stack slot holds the accumulator `s`? → ____________
3. Line C (`addl %eax, -8(%rbp)`) corresponds to which C statement? → ____________
4. Lines E + `jle` correspond to which part of the C `for` loop? → ____________
5. `jle .L10` jumps when which flag condition holds (in terms of SF, OF, ZF)? → ____________
6. Why does the comparison use `$9` instead of `$10`? → ____________

---

## Lecture 05 — Function Call & Runtime Environment

### P5.1 [6 × 2pt] Calling Convention

1. List the first **6 integer-argument registers** in order (the GCC x86-64 convention): → ____________
2. Where is the **7th and later** argument passed? → ____________
3. Which register holds the function's **return value**? → ____________
4. Which register is the **stack frame pointer** and which is the **stack top pointer**? → ____________
5. The `call` instruction does two things — what are they? → ____________
6. `leave` is equivalent to which two instructions? → ____________

### P5.2 [5 × 2pt] Caller / Callee Responsibilities

Mark each task as performed by the **CALLER** or the **CALLEE**.

1. Push the actual parameters (beyond 6) onto the stack: → ____________
2. Save the caller's stack frame pointer (`pushq %rbp`): → ____________
3. Set up the new stack frame pointer (`movq %rsp, %rbp`): → ____________
4. Allocate space for local variables (`subq $N, %rsp`): → ____________
5. Push the return address and jump to the function: → ____________

---

## Lecture 06 — Dynamic Memory Allocation I

### P6.1 [6 × 2pt] 2D Matrix Allocation and Free

Fill in the blanks to allocate and deallocate a 10 × 10 `float` matrix.

```c
#include <stdlib.h>
void test_matrix() {
    float **mat;
    mat = 1)________________________;            // array of 10 row pointers
    for (int i = 0; i < 10; i++)
        mat[i] = 2)________________________;     // each row: 10 floats

    // ... use mat ...

    for (int i = 0; i < 10; i++)
        3)________________________;              // free each row
    4)________________________;                  // free the row-pointer array
}
```

5. In `FreeWords`, why must each `words[i]` be freed **before** `free(words)`? → ____________
6. What does `strdup(s)` do internally (in terms of `malloc`)? → ____________

### P6.2 [6 × 2pt] offsetof / containerof & Common Mistakes

Given the embedded-list pattern:

```c
typedef struct Person {
    char *name;
    long  id;
    struct List list;   // embedded node
} Person;
```

1. Complete `offsetof`: `#define offsetof(st, m)  ((size_t) 1)____________ )` → ____________
2. Complete `containerof`: `#define containerof(ptr, st, m) ((st*)(((char*)(ptr)) - 2)____________ ))` → ____________
3. Given a `struct List *pos`, write the expression that recovers the enclosing `Person*`: → ____________

Mark each as a **bug** (B) or **OK** (O):

4. `free(ptr); printf("%s", ptr->name);` → ____________
5. `ptr = malloc(100); ptr = malloc(200);` (then later free once) → ____________
6. `for(i=0;i<n;i++) free(words[i]); free(words);` → ____________

---

## Lecture 07 — Dynamic Memory Allocation II (Allocator Internals)

### P7.1 [7 × 2pt] Allocator Macros

Complete the standard implicit-free-list macros (`WSIZE = 4`, `DSIZE = 8`). `bp` always points to the **payload**.

```c
#define PACK(size, alloc)   1)________________________   // combine size + alloc bit
#define GET(p)              (*(unsigned int *)(p))
#define GET_SIZE(p)         2)________________________   // mask off low 3 bits
#define GET_ALLOC(p)        3)________________________   // low 1 bit
#define HDRP(bp)            4)________________________   // header address from bp
#define FTRP(bp)            ((char*)(bp) + GET_SIZE(HDRP(bp)) - DSIZE)
#define NEXT_BLKP(bp)       5)________________________   // next block's payload
#define PREV_BLKP(bp)       6)________________________   // previous block's payload
```

7. Why is the **footer (boundary tag)** needed in addition to the header? → ____________

### P7.2 [6 × 2pt] Fragmentation, Placement, Coalescing, GC

1. Internal fragmentation is caused mainly by two things — name them: → ____________
2. **External** fragmentation is: → ____________
3. Name the three classic placement policies: → ____________
4. In the 4 coalescing cases, which case requires merging the **previous + current + next** blocks? → ____________
5. In Mark & Sweep GC, what happens in the **Sweep** phase? → ____________
6. A pointer is "garbage" when: → ____________

---

## Lecture 08 — System APIs (Unix I/O)

### P8.1 [7 × 2pt] Unix I/O Functions

Choose from: **open, close, read, write, dup2, pipe, stat, lseek**

1. Adds a new entry to the descriptor table and returns a file descriptor: → ____________
2. Decreases the reference count in the open file table: → ____________
3. Creates a pair of connected read/write descriptors through a kernel queue: → ____________
4. Copies one descriptor-table entry onto another entry: → ____________
5. Copies n bytes from a file into memory: → ____________
6. Changes the file position in the open file table: → ____________
7. Obtains a file's metadata (size, permissions, inode, …): → ____________

### P8.2 [6 × 2pt] pipe + dup2 (`ls | wc`) & File Sharing

Fill in the blanks so the child runs `ls` and the parent runs `wc`, connected by a pipe (STDIN=0, STDOUT=1).

```c
void test_pipe() {
    int fd[2];
    1)________________________;                 // create pipe
    if (fork() == 0) {                          // child: ls
        close(fd[0]);
        2)________________________;             // stdout -> pipe write end
        char *p[] = {"/bin/ls","-al",NULL};
        execvp(p[0], p);
    } else {                                    // parent: wc
        close(fd[1]);
        3)________________________;             // stdin  <- pipe read end
        char *p[] = {"/usr/bin/wc",NULL};
        execvp(p[0], p);
    }
}
```

4. Name the three kernel data structures involved in file sharing: → ____________
5. After `open()`-then-`fork()`, do parent and child **share** the file position or have **separate** positions? → ____________
6. After `fork()`-then-`open()` (each opens the same file independently), share or separate? → ____________

---

## Lecture 09 — Exceptional Control Flow (ECF)

### P9.1 [4 × 2pt + 1] Exception Types & Process Context

Match each description (Interrupt / Trap / Fault / Abort):

1. Caused by an I/O device signal; **asynchronous**; always returns to the next instruction: → ____________
2. Intentional exception caused by a `syscall` instruction; returns to the next instruction: → ____________
3. Potentially recoverable error; returns to the **current** instruction or aborts: → ____________
4. Unrecoverable error; terminates the program: → ____________
5. In x86-64, which register holds the **syscall number**? → ____________

### P9.2 [6 × 2pt] fork() Tracing

```c
#include <stdio.h>
#include <unistd.h>
int main() {
    int x = 1;
    pid_t pid = fork();
    if (pid == 0) {
        x = x + 1;
        printf("child x = %d\n", x);
    } else {
        x = x + 3;
        printf("parent x = %d\n", x);
    }
    printf("x = %d\n", x);
    return 0;
}
```

1. What does the **child** print for `child x`? → ____________
2. What does the **parent** print for `parent x`? → ____________
3. After `fork()`, are the two `x` variables the **same memory** or **separate copies**? → ____________
4. What value does `fork()` return in the **child**? In the **parent**? → ____________
5. A process that has terminated but has not been reaped by its parent is called a: → ____________
6. Which call lets the parent reap a terminated child: → ____________

---

## Lecture 10 — Signals

### P10.1 [5 × 2pt] Signal Functions

Choose from: **signal, kill, alarm, sigprocmask, sigsuspend, pause**

1. Registers a signal handler for a given signal: → ____________
2. Sends a signal to another process: → ____________
3. Blocks/unblocks a set of signals (changes the blocked set): → ____________
4. Schedules `SIGALRM` to be sent to the calling process after N seconds: → ____________
5. Atomically unblocks signals, pauses, then restores the mask: → ____________

### P10.2 [6 × 2pt] SIGINT Handler & "Signals Are Not Queued"

Fill in the blanks (functions shown: `sigfillset`, `sigprocmask`, `signal`, `sigsuspend`).

```c
void handler(int sig) { /* ... */ }
void test_signal() {
    sigset_t mask, prev;
    1)________________________;                    // mask = all signals
    2)________________________;                    // block them (save old in prev)
    3)________________________;                    // register handler for SIGINT
    while (/* not done */) {
        4)________________________;                // wait atomically for a signal
    }
    sigprocmask(SIG_SETMASK, &prev, NULL);         // restore
}
```

5. Because signals are **not queued**, a single `SIGCHLD` handler invocation may reap only one child even if many died. What loop fixes this inside the handler? → ____________
6. Why must a handler save and restore `errno`? → ____________

---

## Lecture 11 — Network Programming

### P11.1 [7 × 2pt] Networking Terms

Choose from: **adapter, hub, bridge, router, MAC, frame, packet, IP address, port number, TCP, UDP**

1. Physical interface that copies data between host and network: → ____________
2. Device that copies data from one port to **all** other ports (broadcast): → ____________
3. The 48-bit globally unique address on each Ethernet adapter: → ____________
4. Unit of data transferred between hosts on one Ethernet segment: → ____________
5. Device that connects **multiple incompatible LANs**: → ____________
6. A reliable, full-duplex, point-to-point connection between processes: → ____________
7. A connection in which packets may be lost or duplicated: → ____________

### P11.2 [7 × 2pt] Socket Server/Client Skeleton

Fill in the correct calls.

```c
// SERVER
sfd = 1)________________________;                          // create stream socket
bind(sfd, (struct sockaddr*)&saddr, sizeof(saddr));
2)________________________;                                 // mark as listening (backlog 1024)
cfd = 3)________________________;                           // accept a connection
// ... read/write on cfd ...

// CLIENT
sfd = socket(AF_INET, SOCK_STREAM, 0);
4)________________________;                                 // connect to server
```

5. Convert a host **short** (port) to network byte order: function name? → ____________
6. What byte order does the network always use? → ____________
7. What is the difference between the **listening descriptor** and the **connected descriptor**? → ____________

---

## Lecture 12 — Threads

### P12.1 [6 × 2pt] Pthreads & Thread Memory Model

1. Function that creates a new thread: → ____________
2. Function that blocks until a specific thread terminates and reaps it: → ____________
3. List the items that belong to each thread's **private context**: → ____________
4. Of {registers, stack, heap, global variables, code}, which are **shared** across threads? → ____________
5. `sem_wait(&s)` implements which semaphore operation, P or V? → ____________
6. A binary semaphore used for mutual exclusion is called a: → ____________

### P12.2 [6 × 2pt] Producer–Consumer Bounded Buffer

The bounded buffer uses three semaphores: `mutex` (init 1), `slots` (init n), `items` (init 0). Fill in the `sbuf_insert` / `sbuf_remove` order.

```c
void sbuf_insert(sbuf_t *sp, int item) {
    1)________________________;     // wait if buffer is full
    sem_wait(&sp->mutex);
    /* ... add item ... */
    sem_post(&sp->mutex);
    2)________________________;     // signal an available item
}
int sbuf_remove(sbuf_t *sp) {
    3)________________________;     // wait if buffer is empty
    sem_wait(&sp->mutex);
    /* ... take item ... */
    sem_post(&sp->mutex);
    4)________________________;     // signal an available slot
    return item;
}
```

5. In the buggy "Hello from thread %d" example, all threads share `&i`. What is the race, and how is it fixed? → ____________
6. Why is accumulating into a thread-local `sum` faster than `sem_wait/post` on every `gsum += i`? → ____________

---

## Lecture 13 — Synchronization Issues

### P13.1 [6 × 2pt] Thread-Unsafe Classes & Deadlock Conditions

1. List the **four necessary conditions** for deadlock: → ____________
2. A function that returns a pointer to a `static` local buffer (e.g., `ftos`) is which thread-unsafe class? → ____________
3. `rand()` keeps state in `next_seed` across calls — which thread-unsafe class? → ____________
4. A function that references **no shared data** (all args by value, all data local) is called: → ____________
5. Is every reentrant function thread-safe? Is every thread-safe function reentrant? → ____________
6. Why can't a Class-2 (state-across-calls) function be fixed merely by adding a mutex? → ____________

### P13.2 [6 × 2pt] Dining Philosophers & Lock Ordering

1. In Dining Philosophers, what bad outcome occurs if **every** philosopher grabs the **right** chopstick first? → ____________
2. Which of the four deadlock conditions does **ordered locking** (smallest-id first) break? → ____________
3. Fill in the fix — each philosopher acquires the chopstick with the **smaller id** first:

```c
if (p->left->id < p->right->id) {
    sem_wait(&p->left->lock);  sem_wait(&p->right->lock);
} else {
    1)________________________;  2)________________________;
}
```

4. Why is acquiring a mutex **inside a signal handler** dangerous when the main flow holds the same mutex? → ____________
5. What is the standard remedy for #4? → ____________
6. On a single-semaphore progress graph, what is the "forbidden region"? → ____________

---

## Lecture 14 — The Memory Hierarchy

### P14.1 [6 × 2pt] SRAM/DRAM & Locality

1. SRAM stores each bit with a 6-transistor flip-flop; DRAM stores each bit as charge on a ____________.
2. Which is faster and which is denser/cheaper, SRAM or DRAM? → ____________
3. Why must DRAM be **refreshed** periodically? → ____________
4. Order these by access time, fastest first: **disk, registers, main memory (DRAM), cache (SRAM)** → ____________
5. In `for(i=0;i<n;i++) s += items[i];`, which variable has **temporal** locality and which has **spatial** locality? → ____________
6. Row-major traversal of a 2D array has good ____________ locality; column-major has poor ____________ locality.

### P14.2 [6 × 2pt] Disk Capacity & Access Time

A disk has: 5 platters, 512 bytes/sector, average 300 sectors/track, 20,000 tracks/surface, 2 surfaces/platter. Rotational rate 7200 RPM, average seek time 9 ms, average 400 sectors/track (for the timing part).

1. Write the **disk capacity formula** (the five factors): → ____________
2. Compute the capacity (GB): → ____________
3. Compute the **average rotational latency** (ms): → ____________
4. Compute the **average transfer time** for one sector (ms), using 400 sectors/track: → ____________
5. Compute total **average access time** (ms): → ____________
6. Roughly how many times slower is a disk access than a DRAM access (order of magnitude)? → ____________

---

## Lecture 15 — Cache Memories

### P15.1 [6 × 2pt] Cache Organization & Address Breakdown

For a cache: **m = 16** address bits, **S = 64 sets**, **B = 64 bytes/block**, **E = 8 lines/set**.

1. How many **block-offset (b)** bits? → ____________
2. How many **set-index (s)** bits? → ____________
3. How many **tag (t)** bits? → ____________
4. What is the cache data size **C = B × E × S** (in KB)? → ____________
5. When `E = 1`, the cache is called ____________; when there is only one set (`E = C/B`), it is ____________.
6. Name the three steps to access a word from the cache: → ____________

### P15.2 [6 × 2pt] Direct-Mapped Trace & Stride

A tiny direct-mapped cache has `(S, E, B, m) = (4, 1, 2, 4)` (so b=1, s=2, t=1). Addresses are read in order: **0, 1, 13, 8, 0**.

1. For each access mark hit (h) or miss (m): 0→__, 1→__, 13→__, 8→__, 0→__
2. Why is the second read of address 0 a **miss**? (name the miss type) → ____________
3. For `sumvec` (stride-1, 4-byte words, 16-byte blocks), what is the miss rate? → ____________
4. For column-major access of a 2D `int` array (`sumarraycols`), what is the miss rate, and why? → ____________
5. **Write-through** vs **write-back** — which defers the write to the lower level until eviction? → ____________
6. Why are the **middle** address bits (not the high bits) used as the set index? → ____________

---

## Lecture 16 — Virtual Memory

### P16.1 [6 × 2pt] VM Concepts & Page Table Entries

1. Name the three main benefits of virtual memory: → ____________
2. The hardware unit that translates a virtual address to a physical address is the ____________.
3. A PTE with **valid = 1** stores what? With **valid = 0 and address ≠ 0**? With **valid = 0 and address = 0**? → ____________
4. A virtual address splits into ____________ (VPN) and ____________ (VPO).
5. A physical address is the concatenation of ____________ (PPN) and the same ____________ (VPO).
6. When the valid bit is 0, the MMU triggers a ____________, handled by the kernel.

### P16.2 [6 × 2pt] Address Translation Calculation

A 32-bit virtual address space, **4 KB pages**, **4-byte PTEs**, single-level page table.

1. How many bits are in the **VPO**? → ____________
2. How many bits are in the **VPN**? → ____________
3. How many entries does the (single-level) page table have? → ____________
4. What is the **total size** of this page table? → ____________
5. List, in order, the page-fault handler's steps (victim selection onward): → ____________
6. Which register points to the base of the current page table? → ____________

---

## Lecture 17 — Virtual Memory II (TLB, Multi-level, mmap, COW)

### P17.1 [6 × 2pt] TLB & Multi-Level Page Tables

1. The TLB is a small cache of ____________, indexed by the (virtual / physical?) address.
2. With **T = 2^t** TLB sets, the **TLBI** is the ____________ bits of the VPN and the **TLBT** is the ____________ bits.
3. What problem do **multi-level page tables** solve compared to a single flat page table? → ____________
4. In a 2-level scheme, when a level-1 PTE is **null**, what is true about its level-2 table? → ____________
5. Which page table must **always** reside in memory? → ____________
6. In the Intel i7 (48-bit VA), how many levels of page table are used, and which register is the PTBR? → ____________

### P17.2 [6 × 2pt] Linux VM Areas, mmap, Copy-on-Write

1. A contiguous chunk of allocated virtual memory with related pages is a Linux ____________; it is described by a ____________ struct.
2. On a page fault, the handler asks two questions before swapping. What are the two illegal outcomes? → ____________
3. `mmap` with **MAP_SHARED** vs **MAP_PRIVATE** — which makes writes visible to other processes and updates the backing file? → ____________
4. After `fork()`, both processes' pages are flagged ____________ and the area structs are flagged ____________.
5. In copy-on-write, what triggers the actual page copy, and what fault type is it? → ____________
6. During `execve`, the `.bss` area is mapped to what kind of file (demand-zero)? → ____________

---
---

# Part II. Answer Key

---

## Lecture 01

**P1.1** 1) **ISA** 2) **ABI** 3) **API** 4) **POSIX**
> The system stack: Applications —(API)— Libraries —(ABI)— OS —(ISA)— Hardware. POSIX is the portability standard for library functions.

**P1.2** 1) **Pre-processor (cpp)** 2) **Compiler (cc1)** 3) **Assembler (as)** 4) **Linker (ld)** 5) **`-S`**
> `gcc -E` = preprocess only, `gcc -S` = compile to assembly, `gcc -c` = assemble to object, `gcc` (no flag) = link.

---

## Lecture 02

**P2.1**
1) ASCII code **97**
2) **long** integer value 20
3) **float** value 3.14 (single precision)
4) the **address** of the string literal "hello"
5) the **address** of the function `main`
6) `0xff & 0x05` = `0x05` = **5**

**P2.2**
1) `((data) | (gender) << 31)`
2) `((data) >> 31 & 1)`
3) `((data) >> 26 & 7)` (3-bit field → mask `7`)
4) `FEMALE(=1) << 31` = `0x80000000`
5) `~5` = **-6** (one's complement; bit pattern `0xfffffffa`)

---

## Lecture 03

**P3.1** 1) **1** 2) **2** 3) **8** 4) **40** (10 ints × 4) 5) **12** (11 chars + `\0`) 6) **8** (pointer size on 64-bit)
> Key trap: `sizeof(arr)` = 12 (whole array) but `sizeof(str)` = 8 (just the pointer). The string literal lives in `.rodata`; `arr` is a writable copy on the stack.

**P3.2** 1) **.data** 2) **.bss** 3) **.data** 4) **.rodata** 5) **stack** 6) **.data** 7) **heap**
> Initialized globals/statics → `.data`; uninitialized → `.bss`; `const` initialized → `.rodata`; auto locals → stack; local `static` keeps global lifetime so it goes to `.data`; `malloc`'d block → heap. (The pointer variable `p` itself would be on the stack.)

---

## Lecture 04

**P4.1**
1) Copies the constant 1 into `%eax` (i.e., `eax = 1`). `l` = 4-byte (long) operation.
2) `%rbp + %rsi*4 - 5` (base + index×scale + displacement).
3) `b` = byte (1 byte); `q` = quad (8 bytes).
4) **Just computes an address** — `lea` loads the *effective address*, it does **not** dereference memory.
5) `subq $8, %rsp` then `movq %rax, (%rsp)`.
6) `movzbl` zero-extends `%al` into `%eax`; `movsbl` sign-extends (replicates the sign bit of `%al`).

**P4.2**
1) `-4(%rbp)` holds `i`.
2) `-8(%rbp)` holds `s`.
3) `s = s + i;`
4) The loop **condition test** `i < 10` (continue looping while `i <= 9`).
5) `jle` jumps when `(SF == OF) and ZF == 1` is allowed too — i.e. "less than or equal": taken when `SF != OF` **or** `ZF == 1`. (Equivalently: signed `≤`.)
6) Because the C condition `i < 10` is implemented as "loop again while `i <= 9`," so it compares against 9 with `jle`.

---

## Lecture 05

**P5.1**
1) `%rdi, %rsi, %rdx, %rcx, %r8, %r9` (in that order).
2) On the **stack** (pushed by the caller).
3) `%rax`.
4) `%rbp` = stack frame pointer; `%rsp` = stack top pointer.
5) Pushes `%rip` (return address) onto the stack **and** jumps to the function label.
6) `movq %rbp, %rsp` then `popq %rbp`.

**P5.2** 1) **CALLER** 2) **CALLEE** 3) **CALLEE** 4) **CALLEE** 5) **CALLER**
> Caller pushes args + does `call` (which pushes return address). Callee sets up/tears down its own stack frame.

---

## Lecture 06

**P6.1**
1) `(float**)malloc(10 * sizeof(float*))`
2) `(float*)malloc(10 * sizeof(float))`
3) `free(mat[i])`
4) `free(mat)`
5) If you `free(words)` first, you lose the addresses of all `words[i]` → memory leak / dangling pointers. Always free **inner → outer**.
6) `strdup(s)` = `malloc(strlen(s)+1)` then `strcpy(copy, s)` — allocates a heap copy of the string.

**P6.2**
1) `&(((st*)0)->m)` → full macro: `((size_t) &(((st *)0)->m))`
2) `offsetof(st, m)` → full macro: `((st*)(((char*)(ptr)) - offsetof(st, m)))`
3) `containerof(pos, struct Person, list)`
4) **B** (use-after-free)
5) **B** (memory leak — first block's address is lost before it can be freed)
6) **O** (correct order: free inner strings first, then the array)

---

## Lecture 07

**P7.1**
1) `((size) | (alloc))`
2) `(GET(p) & ~0x7)`
3) `(GET(p) & 0x1)`
4) `((char*)(bp) - WSIZE)`
5) `((char*)(bp) + GET_SIZE((char*)(bp) - WSIZE))`
6) `((char*)(bp) - GET_SIZE((char*)(bp) - DSIZE))`
7) The footer (boundary tag, a copy of the header) lets you find the **previous** block's size in O(1), enabling backward coalescing without scanning the whole list.

**P7.2**
1) Minimum block size constraint + padding for **alignment**.
2) Enough total free memory exists, but no single **contiguous** free block is large enough.
3) **First fit, Next fit, Best fit**.
4) **Case 4** (prev free **and** next free) → merge all three.
5) Sweep frees every block that was **not marked** (unreachable) in the Mark phase.
6) It is **unreachable** from any root (stack/global) variable — no path of pointers leads to it.

---

## Lecture 08

**P8.1** 1) **open** 2) **close** 3) **pipe** 4) **dup2** 5) **read** 6) **lseek** 7) **stat**

**P8.2**
1) `pipe(fd)`
2) `dup2(fd[1], 1)` (stdout → write end)
3) `dup2(fd[0], 0)` (stdin → read end)
4) **Descriptor table** (per-process), **Open file table** (file position + refcount, shared), **v-node table** (file metadata).
5) **Shared** position (they share the same open-file-table entry).
6) **Separate** positions (each open creates its own open-file-table entry).

---

## Lecture 09

**P9.1** 1) **Interrupt** 2) **Trap** 3) **Fault** 4) **Abort** 5) **`%rax`**
> Interrupt = async (I/O). Trap = intentional (syscall). Fault = recoverable (e.g., page fault). Abort = fatal.

**P9.2**
1) `child x = 2`
2) `parent x = 4`
3) **Separate copies** — `fork` duplicates the address space; each has its own `x`.
4) Child: `0`; Parent: the child's **PID** (> 0).
5) **Zombie** process.
6) `wait()` or `waitpid()`.

---

## Lecture 10

**P10.1** 1) **signal** 2) **kill** 3) **sigprocmask** 4) **alarm** 5) **sigsuspend**

**P10.2**
1) `sigfillset(&mask)`
2) `sigprocmask(SIG_BLOCK, &mask, &prev)`
3) `signal(SIGINT, handler)`
4) `sigsuspend(&prev)`
5) `while (waitpid(-1, NULL, 0) > 0) ;` — reap **all** ready children in one handler call.
6) Library functions in the main flow may have set `errno`; a handler that calls `errno`-setting functions could clobber it. Save on entry, restore before return so the interrupted code sees a consistent `errno`.

---

## Lecture 11

**P11.1** 1) **adapter** 2) **hub** 3) **MAC** 4) **frame** 5) **router** 6) **TCP** 7) **UDP**

**P11.2**
1) `socket(AF_INET, SOCK_STREAM, 0)`
2) `listen(sfd, 1024)`
3) `accept(sfd, (struct sockaddr*)&caddr, &clen)`
4) `connect(sfd, (struct sockaddr*)&saddr, sizeof(saddr))`
5) `htons` (host-to-network short).
6) **Big-endian** (network byte order).
7) The **listening descriptor** is created once and accepts connection requests; the **connected descriptor** is returned by `accept` and is used for actual I/O with one specific client.

---

## Lecture 12

**P12.1**
1) `pthread_create`
2) `pthread_join`
3) TID, **stack + stack pointer**, **program counter**, general-purpose **registers** + condition codes (flags).
4) **stack (technically per-thread but not protected), heap, global variables, code** are shared (virtual memory is shared); only **registers** are truly private. (Each thread has its own stack, but other threads can still reach it.)
5) **P** (probe / lock).
6) **mutex** (binary semaphore).

**P12.2**
1) `sem_wait(&sp->slots)`
2) `sem_post(&sp->items)`
3) `sem_wait(&sp->items)`
4) `sem_post(&sp->slots)`
5) All threads dereference the same `&i`; by the time a thread reads it, `main` may have incremented `i` → wrong/duplicate ids. Fix: give each thread its **own** `id[i]` element to point at.
6) The local-accumulation version touches the shared variable only **once** at the end, avoiding a system-call-heavy `sem_wait/sem_post` on **every** iteration (semaphores are expensive).

---

## Lecture 13

**P13.1**
1) **Mutual exclusion, Hold and wait, No preemption, Circular wait.**
2) **Class 3** (returns a pointer to a `static` variable).
3) **Class 2** (keeps state across invocations).
4) **Reentrant** function.
5) Every reentrant function **is** thread-safe; but not every thread-safe function is reentrant (reentrant ⊂ thread-safe).
6) Because the shared state persists *across* calls; a mutex only serializes access — it doesn't remove the dependency on shared state. You must **rewrite** it (e.g., pass state explicitly / make it reentrant).

**P13.2**
1) **Deadlock** — every philosopher holds one chopstick and waits forever for the other (circular wait) → starvation.
2) **Circular wait.**
3) 1) `sem_wait(&p->right->lock)`  2) `sem_wait(&p->left->lock)` (acquire smaller-id first in both branches).
4) The handler runs to completion before the main flow resumes, but the main flow holds the lock and can't release it until it resumes → both stuck (deadlock).
5) **Disable the signal/interrupt** while the main flow holds the shared resource (or don't take locks in handlers).
6) The region of the progress graph where **both** threads would be inside the same critical section simultaneously — trajectories must not enter it (the semaphore prevents this).

---

## Lecture 14

**P14.1**
1) a **capacitor**.
2) SRAM is **faster** (and persistent while powered, ~6 transistors/bit); DRAM is **denser/cheaper** (1 transistor/bit).
3) Capacitor charge **leaks** (within 10–100 ms); each bit must be read and rewritten to retain its value.
4) **registers → cache (SRAM) → main memory (DRAM) → disk** (fastest to slowest).
5) `s` (the sum) has **temporal** locality; `items[i]` has **spatial** locality.
6) Row-major has good **spatial** locality; column-major has poor **spatial** locality.

**P14.2**
1) `(bytes/sector) × (sectors/track) × (tracks/surface) × (surfaces/platter) × (platters/disk)`.
2) `512 × 300 × 20000 × 2 × 5 = 30,720,000,000 bytes ≈ 30.72 GB`.
3) `T_avg rotation = ½ × (60 / 7200) s = ½ × 8.33 ms ≈ 4 ms`.
4) `T_avg transfer = (60/7200) × (1/400) s ≈ 0.02 ms`.
5) `T_access = 9 + 4 + 0.02 ≈ 13.02 ms`.
6) Roughly **~2,500×** slower than DRAM (disk ≈ 10 ms vs DRAM ≈ 4,000 ns); order of magnitude ~10³–10⁴.

---

## Lecture 15

**P15.1**
1) `b = log2(64) = 6` bits.
2) `s = log2(64) = 6` bits.
3) `t = m − (s + b) = 16 − (6 + 6) = 4` bits.
4) `C = B × E × S = 64 × 8 × 64 = 32,768 bytes = 32 KB`.
5) `E = 1` → **direct-mapped**; one set → **fully associative**.
6) **Set selection, line matching, word extraction.**

**P15.2**
1) 0→**m**, 1→**h**, 13→**m**, 8→**m**, 0→**m**.
2) **Conflict miss** — address 8 (tag 1) evicted set 0; reading 0 again (tag 0) maps to the same set 0 and misses.
3) **25%** (1 miss per 4-word block).
4) **100%** — stride-N (column) access jumps a full row each step, so every access lands in a new block → no spatial locality reuse.
5) **Write-back** defers the write until eviction (needs a dirty bit); write-through writes immediately.
6) Middle bits spread **contiguous** memory blocks across **different** sets, improving utilization; high-order indexing would map a contiguous run to the same set → conflict misses.

---

## Lecture 16

**P16.1**
1) **Efficient main-memory use** (DRAM caches disk), **simplified memory management** (uniform per-process address space), and **protection** (isolates processes).
2) **MMU** (Memory Management Unit).
3) valid=1 → a **physical page address**; valid=0 & addr≠0 → the page's **location on disk**; valid=0 & addr=0 → page **not allocated**.
4) **virtual page number (VPN)** and **virtual page offset (VPO)**.
5) **physical page number (PPN)** and the same **VPO** (= PPO).
6) **page fault** exception.

**P16.2**
1) VPO = `log2(4 KB) = 12` bits.
2) VPN = `32 − 12 = 20` bits.
3) `2^20 = 1,048,576` entries.
4) `4 B × 2^20 = 4 MB`.
5) Select a **victim page** (write it to disk if dirty, clear its valid bit), copy the requested virtual page into the physical frame, update the PTE, then **restart** the faulting instruction.
6) **PTBR** (Page Table Base Register; CR3 on x86).

---

## Lecture 17

**P17.1**
1) **PTEs** (page table entries), indexed by the **virtual** address (VPN).
2) TLBI = the **t least-significant** bits of the VPN; TLBT = the **remaining (higher)** bits.
3) A single flat page table must stay fully in memory (e.g., 4 MB always resident); multi-level tables let unallocated regions skip their level-2 tables — only the level-1 table must always be resident.
4) Its corresponding **level-2 page table need not exist in memory** at all (saves space).
5) The **level-1 (top-level)** page table.
6) **4 levels**; the PTBR is the **CR3** register.

**P17.2**
1) a Linux **area** (memory region); described by a **`vm_area_struct`**.
2) (a) Address not in any `vm_area_struct` → **segmentation fault**; (b) access type violates `vm_prot` (e.g., writing a read-only page) → **protection exception**.
3) **MAP_SHARED** makes writes visible to others and updates the backing file; MAP_PRIVATE is copy-on-write and private.
4) pages flagged **read-only**; area structs flagged **private copy-on-write (COW)**.
5) A **write** to a COW page triggers a **protection fault**; the handler makes a fresh private copy, fixes the PTE, restores write permission, and restarts.
6) An **anonymous file** (demand-zero), of the size recorded in the executable.

---

> 끝! 이 34문제로 강의 1~17이 모두 한 번씩은 짚여요.
> 헷갈리는 단원은 Answer Key의 해설(>로 표시된 줄)을 먼저 읽고 문제를 다시 풀어보면 효과적입니다.
