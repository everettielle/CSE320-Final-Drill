# CSE320 System Fundamentals II — Practice Problem Book

> 강의 1~17을 전부 커버하는 기출 스타일 문제집입니다.
> 각 강의당 2문제씩, 총 34문제 + 전체 정답/해설을 수록했습니다.
> 문제 형식은 실제 중간고사(Midterm 1·2)의 출제 방식(용어 매칭 / 코드 빈칸 채우기 / 추적·분석 / 계산)을 따랐습니다.
>
> **사용법:** 먼저 문제만 풀고, 맨 뒤의 **Answer Key**에서 답과 해설을 확인하세요.
>
> **시험 조건 반영:** 계산기와 치트시트 없이 풀 수 있도록 구성했습니다. 정확한 함수명·레지스터·매크로 식을 묻는 암기형 문제에는 선택지를 제공하며, 계산은 작은 2의 거듭제곱과 간단한 사칙연산 범위로 제한합니다.

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
Choose from: **cpp, cc1, as, ld, `-S`**

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

In C, every literal is a number. State the value (or what it represents) for each expression. Assume ASCII, where `'a'` is 97.

1. `'a'` → ____________
2. `20L` → ____________
3. `3.14F` → ____________
4. `"hello"` → ____________
5. `main` (used as an expression) → ____________
6. Given `int a = 0xff, b = 0x05;`, what is the decimal result of `a & b`? → ____________

### P2.2 [6 × 2pt] Reading Flags and Masks

An 8-bit value stores **gender in bit 7** and **department in bits 2–0**.

Use these provided facts:

- `0xA5` = `1010 0101₂`
- gender mask `0x80` = `1000 0000₂`
- department mask `0x07` = `0000 0111₂`
- For signed two's-complement integers, `~x = -(x + 1)`.

For expression questions, choose from:
**`(data >> 7) & 1`**, **`data & 0x07`**, **`data | 0x80`**

1. What gender bit is stored in `0xA5`? → ____________
2. Department bits in `0xA5` and their decimal value: → ____________
3. Which expression extracts the gender bit? → ____________
4. Which expression extracts the department field? → ____________
5. Starting with `data = 0x05`, which expression sets the gender bit, and what hexadecimal value results? → ____________
6. Using the provided identity, what is `~5` as a signed decimal integer? → ____________

---

## Lecture 03 — Variables (Types, Scope, Sections)

### P3.1 [6 × 2pt] sizeof and Pointer vs Array

Assume a 64-bit Linux machine where `char=1`, `short=2`, `int=4`, and `long`/pointers are 8 bytes. Give the value of each `sizeof` expression.

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
Assume the compiler places initialized file-scope `const` objects in `.rodata`.

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

For #5, choose from:
**`subq $8, %rsp; movq %rax, (%rsp)`**,
**`movq (%rsp), %rax; addq $8, %rsp`**,
**`subq $4, %rsp; movl %eax, (%rsp)`**

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
5. `jle .L10` jumps when which condition holds? Choose from **`SF != OF or ZF == 1`**, **`SF == OF and ZF == 0`**, **`ZF == 0`**. → ____________
6. Why does the comparison use `$9` instead of `$10`? → ____________

---

## Lecture 05 — Function Call & Runtime Environment

### P5.1 [6 × 2pt] Calling Convention

For register-name blanks, choose from: **`%rdi, %rsi, %rdx, %rcx, %r8, %r9, %rax, %rbp, %rsp`**
For #6, choose from: **`movq %rbp, %rsp; popq %rbp`**, **`popq %rsp; movq %rsp, %rbp`**

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
For 1–4, choose from: **`malloc(10 * sizeof(float*))`**, **`malloc(10 * sizeof(float))`**, **`free(mat[i])`**, **`free(mat)`**

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

For 1–3, choose or adapt from: **`&(((st*)0)->m)`, `offsetof(st, m)`, `containerof(pos, struct Person, list)`**

1. Complete `offsetof`: `#define offsetof(st, m)  ((size_t) 1)____________ )` → ____________
2. Complete `containerof`: `#define containerof(ptr, st, m) ((st*)(((char*)(ptr)) - 2)____________ ))` → ____________
3. Given a `struct List *pos`, write the expression that recovers the enclosing `Person*`: → ____________

Mark each as a **bug** (B) or **OK** (O):

4. `free(ptr); printf("%s", ptr->name);` → ____________
5. `ptr = malloc(100); ptr = malloc(200);` (then later free once) → ____________
6. `for(i=0;i<n;i++) free(words[i]); free(words);` → ____________

---

## Lecture 07 — Dynamic Memory Allocation II (Allocator Internals)

### P7.1 [6 × 2pt] Reading Allocator Metadata

```c
#define WSIZE 4
#define DSIZE 8
#define PACK(size, alloc)   ((size) | (alloc))
#define GET(p)              (*(unsigned int *)(p))
#define GET_SIZE(p)         (GET(p) & ~0x7)
#define GET_ALLOC(p)        (GET(p) & 0x1)
#define HDRP(bp)            ((char*)(bp) - WSIZE)
#define FTRP(bp)            ((char*)(bp) + GET_SIZE(HDRP(bp)) - DSIZE)
#define NEXT_BLKP(bp)       ((char*)(bp) + GET_SIZE(HDRP(bp)))
```

Assume a block's header contains `PACK(32, 1)` and its payload pointer `bp` has address 100.

1. What hexadecimal value does `PACK(32, 1)` produce? → ____________
2. What does `GET_SIZE(HDRP(bp))` return? → ____________
3. What does `GET_ALLOC(HDRP(bp))` return? → ____________
4. What address does `HDRP(bp)` compute? → ____________
5. What address does `NEXT_BLKP(bp)` compute? → ____________
6. Why is the **footer (boundary tag)** useful in addition to the header? → ____________

### P7.2 [6 × 2pt] Fragmentation, Placement, Coalescing, GC

For #3, choose from: **First fit, Next fit, Best fit, Random fit**

1. Internal fragmentation is caused mainly by two things — name them: → ____________
2. **External** fragmentation is: → ____________
3. Name the three classic placement policies: → ____________
4. In the 4 coalescing cases, which case requires merging the **previous + current + next** blocks? → ____________
5. In Mark & Sweep GC, what happens in the **Sweep** phase? → ____________
6. An allocated block is "garbage" when: → ____________

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
For 1–3, use: **`pipe(fd)`, `dup2(fd[1], 1)`, `dup2(fd[0], 0)`**
For #4, choose from: **descriptor table, open file table, v-node table, page table**

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
For #5, choose from: **`%rax, %rdi, %rbp, %rsp`**

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

For #5–6, choose from: **zombie, orphan, `wait`/`waitpid`, `execve`**

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

For 1–4, choose from:
**`sigfillset(&mask)`**, **`sigprocmask(SIG_BLOCK, &mask, &prev)`**,
**`signal(SIGINT, handler)`**, **`sigsuspend(&prev)`**
For #5, choose from:
**`while (waitpid(-1, NULL, 0) > 0) ;`**,
**`waitpid(-1, NULL, 0);`**

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

5. Following the lecture's handler pattern, because signals are **not queued**, a single `SIGCHLD` handler invocation may reap only one child even if many died. What loop reaps all children? → ____________
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
For 1–4, choose from:
**`socket(AF_INET, SOCK_STREAM, 0)`**, **`listen(sfd, 1024)`**,
**`accept(sfd, (struct sockaddr*)&caddr, &clen)`**,
**`connect(sfd, (struct sockaddr*)&saddr, sizeof(saddr))`**

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

For exact API/term blanks, choose from: **`pthread_create`, `pthread_join`, P, V, mutex**

1. Function that creates a new thread: → ____________
2. Function that blocks until a specific thread terminates and reaps it: → ____________
3. List the items that belong to each thread's **private execution context**: → ____________
4. Of {registers, stack region, heap, global variables, code}, which belong to the process's **shared virtual address space**? Note that each thread normally uses its own stack region, but other threads can address it. → ____________
5. `sem_wait(&s)` implements which semaphore operation, P or V? → ____________
6. A binary semaphore used for mutual exclusion is called a: → ____________

### P12.2 [6 × 2pt] Producer–Consumer Bounded Buffer

The bounded buffer uses three semaphores: `mutex` (init 1), `slots` (init n), `items` (init 0). Fill in the `sbuf_insert` / `sbuf_remove` order.
For 1–4, choose from: **`sem_wait(&sp->slots)`**, **`sem_post(&sp->items)`**, **`sem_wait(&sp->items)`**, **`sem_post(&sp->slots)`**

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

For classification terms, choose from: **Class 2, Class 3, reentrant, thread-safe**
For #1, choose four from: **Mutual exclusion, Hold and wait, No preemption, Circular wait, Starvation**

1. List the **four necessary conditions** for deadlock: → ____________
2. A function that returns a pointer to a `static` local buffer (e.g., `ftos`) is which thread-unsafe class? → ____________
3. `rand()` keeps state in `next_seed` across calls — which thread-unsafe class? → ____________
4. A function that references **no shared data** (all args by value, all data local) is called: → ____________
5. Is every reentrant function thread-safe? Is every thread-safe function reentrant? → ____________
6. Why does the lecture classify a Class-2 function as thread-unsafe even when a mutex protects each call? What kind of rewrite fixes it? → ____________

### P13.2 [6 × 2pt] Dining Philosophers & Lock Ordering

1. What bad outcome occurs if **every** philosopher simultaneously grabs and holds the **right** chopstick first? → ____________
2. Which of the four deadlock conditions does **ordered locking** (smallest-id first) break? → ____________
3. Fill in the fix — each philosopher acquires the chopstick with the **smaller id** first:
Choose from: **`sem_wait(&p->right->lock)`**, **`sem_wait(&p->left->lock)`**

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

A disk has: 2 platters, 512 bytes/sector, 128 sectors/track, 1,024 tracks/surface, 2 surfaces/platter. Rotational rate is 6,000 RPM, average seek time is 5 ms, and there are 100 sectors/track for the timing part. Assume a DRAM access takes 100 ns.
Useful facts: `512=2^9`, `128=2^7`, `1,024=2^10`, `1 MiB=2^20 bytes`, `1 minute=60,000 ms`, and `1 ms=10^6 ns`.

1. Write the **disk capacity formula** (the five factors): → ____________
2. Compute the capacity (MiB): → ____________
3. Compute the **average rotational latency** (ms): → ____________
4. Compute the **average transfer time** for one sector (ms), using 100 sectors/track: → ____________
5. Compute total **average access time** (ms): → ____________
6. Roughly how many times slower is a disk access than a DRAM access (order of magnitude)? → ____________

---

## Lecture 15 — Cache Memories

### P15.1 [6 × 2pt] Cache Organization & Address Breakdown

For a cache: **m = 12** address bits, **S = 8 sets**, **B = 16 bytes/block**, **E = 2 lines/set**.
For #5–6, choose from:
**direct-mapped, fully associative, set selection, line matching, word extraction, write-back**

1. How many **block-offset (b)** bits? → ____________
2. How many **set-index (s)** bits? → ____________
3. How many **tag (t)** bits? → ____________
4. What is the cache data size **C = B × E × S** (in bytes)? → ____________
5. When `E = 1`, the cache is called ____________; when there is only one set (`E = C/B`), it is ____________.
6. Name the three steps to access a word from the cache: → ____________

### P15.2 [6 × 2pt] Direct-Mapped Trace & Stride

A tiny direct-mapped cache has `(S, E, B, m) = (4, 1, 2, 4)` (so b=1, s=2, t=1). Decimal addresses are read in order: **0, 1, 13, 8, 0**.

1. For each access mark hit (h) or miss (m): 0→__, 1→__, 13→__, 8→__, 0→__
2. Why is the second read of address 0 a **miss**? (name the miss type) → ____________
3. For a long stride-1 `sumvec` starting with an empty cache (4-byte words, 16-byte blocks, no conflict misses), what is the miss rate? → ____________
4. In the lecture's shown column-major example, every access is a miss. What is its miss rate, and which kind of locality is lost? → ____________
5. **Write-through** vs **write-back** — which defers the write to the lower level until eviction? → ____________
6. Why are the **middle** address bits (not the high bits) used as the set index? → ____________

---

## Lecture 16 — Virtual Memory

### P16.1 [6 × 2pt] VM Concepts & Page Table Entries

For exact terms, choose from:
**MMU, VPN, VPO, PPN, page fault, physical page address, disk location, not allocated**

1. Name the three main benefits of virtual memory: → ____________
2. The hardware unit that translates a virtual address to a physical address is the ____________.
3. A PTE with **valid = 1** stores what? With **valid = 0 and address ≠ 0**? With **valid = 0 and address = 0**? → ____________
4. A virtual address splits into ____________ (VPN) and ____________ (VPO).
5. A physical address is the concatenation of ____________ (PPN) and the same ____________ (VPO).
6. When the valid bit is 0, the MMU triggers a ____________, handled by the kernel.

### P16.2 [6 × 2pt] Address Translation Calculation

A 16-bit virtual address space, **256-byte pages**, **2-byte PTEs**, single-level page table.
For #6, choose from: **PTBR, MMU, TLB**

1. How many bits are in the **VPO**? → ____________
2. How many bits are in the **VPN**? → ____________
3. How many entries does the (single-level) page table have? → ____________
4. What is the **total size** of this page table? → ____________
5. List, in order, the page-fault handler's steps (victim selection onward): → ____________
6. Which register points to the base of the current page table? → ____________

---

## Lecture 17 — Virtual Memory II (TLB, Multi-level, mmap, COW)

### P17.1 [6 × 2pt] TLB & Multi-Level Page Tables

For exact terms, choose from:
**PTEs, virtual, physical, least-significant, higher, level-1 (top-level)**
For #6, choose from: **4 levels + CR3**, **2 levels + MMU**, **8 levels + TLB**

1. The TLB is a small cache of ____________, indexed by the (virtual / physical?) address.
2. With **T = 2^t** TLB sets, the **TLBI** is the ____________ bits of the VPN and the **TLBT** is the ____________ bits.
3. What problem do **multi-level page tables** solve compared to a single flat page table? → ____________
4. In a 2-level scheme, when a level-1 PTE is **null**, what is true about its level-2 table? → ____________
5. Which page table must **always** reside in memory? → ____________
6. In the Intel i7 (48-bit VA), how many levels of page table are used, and which register is the PTBR? → ____________

### P17.2 [6 × 2pt] Linux VM Areas, mmap, Copy-on-Write

For exact terms, choose from:
**area, `vm_area_struct`, MAP_SHARED, MAP_PRIVATE, read-only, private COW, anonymous file**

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
1) **1** (the leftmost bit of `1010 0101₂`).
2) Department bits are **`101₂`**, which is decimal **5**.
3) **`(data >> 7) & 1`**.
4) **`data & 0x07`**.
5) Use **`data | 0x80`**; `0x05 | 0x80 = 0x85`.
6) `~5 = -(5 + 1) =` **-6**.

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
5) `jle` is taken when `SF != OF` **or** `ZF == 1` (signed less-than-or-equal).
6) Because the C condition `i < 10` is implemented as "loop again while `i <= 9`," so it compares against 9 with `jle`.

---

## Lecture 05

**P5.1**
1) `%rdi, %rsi, %rdx, %rcx, %r8, %r9` (in that order).
2) On the **stack** (pushed by the caller).
3) `%rax`.
4) `%rbp` = stack frame pointer; `%rsp` = stack top pointer.
5) Pushes the **address of the next instruction** (the return address) onto the stack and jumps to the function label.
6) `movq %rbp, %rsp` then `popq %rbp`.

**P5.2** 1) **CALLER** 2) **CALLEE** 3) **CALLEE** 4) **CALLEE** 5) **CALLER**
> Caller pushes args + does `call` (which pushes return address). Callee sets up/tears down its own stack frame.

---

## Lecture 06

**P6.1**
1) `malloc(10 * sizeof(float*))`
2) `malloc(10 * sizeof(float))`
3) `free(mat[i])`
4) `free(mat)`
5) After `free(words)`, reading `words[i]` is a use-after-free, so the inner allocations can no longer be safely reached through that array. Always free **inner → outer**.
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
1) `PACK(32, 1) = 32 | 1 =` **`0x21`**.
2) **32** (the low three metadata bits are masked off).
3) **1** (the block is allocated).
4) **96** (`100 - WSIZE`).
5) **132** (`100 + 32`).
6) The footer stores the block size at the end of a block, so the allocator can find the **previous** block and coalesce backward in O(1).

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
5) `while (waitpid(-1, NULL, 0) > 0) ;` — following the lecture pattern, repeat `waitpid` so one handler invocation reaps **all** children rather than only one.
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
3) TID, **stack**, **stack pointer**, **program counter**, general-purpose **registers**, and condition codes (flags).
4) **Stack regions, heap, global variables, and code** are all in the process's shared virtual address space. Each thread normally uses its own stack region, but it is not protected from other threads.
5) **P** (probe / lock).
6) **mutex** (binary semaphore).

**P12.2**
1) `sem_wait(&sp->slots)`
2) `sem_post(&sp->items)`
3) `sem_wait(&sp->items)`
4) `sem_post(&sp->slots)`
5) All threads dereference the same `&i`; by the time a thread reads it, `main` may have incremented `i` → wrong/duplicate ids. Fix: give each thread its **own** `id[i]` element to point at.
6) The local-accumulation version touches the shared variable only **once** at the end, avoiding synchronization, contention, and possible blocking on **every** iteration.

---

## Lecture 13

**P13.1**
1) **Mutual exclusion, Hold and wait, No preemption, Circular wait.**
2) **Class 3** (returns a pointer to a `static` variable).
3) **Class 2** (keeps state across invocations).
4) **Reentrant** function.
5) Every reentrant function **is** thread-safe; but not every thread-safe function is reentrant (reentrant ⊂ thread-safe).
6) A mutex prevents simultaneous updates, but every thread still interleaves operations on one state kept across calls, so each thread's results depend on the schedule. Under the lecture's classification it remains thread-unsafe; fix it by rewriting it as a **reentrant** function that receives explicit per-thread state.

**P13.2**
1) **Starvation caused by deadlock** — if they all acquire and hold the right chopstick together, each waits forever for the left one.
2) **Circular wait.**
3) 1) `sem_wait(&p->right->lock)`  2) `sem_wait(&p->left->lock)` (acquire smaller-id first in both branches).
4) The handler runs to completion before the main flow resumes, but the main flow holds the lock and can't release it until it resumes → both stuck (deadlock).
5) **Block/disable the relevant signal** while the normal flow accesses the shared resource, so the handler cannot interrupt while the lock is held. The handler itself should avoid locks and other non-async-signal-safe operations.
6) The region of the progress graph where **both** threads would be inside the same critical section simultaneously — trajectories must not enter it (the semaphore prevents this).

---

## Lecture 14

**P14.1**
1) a **capacitor**.
2) SRAM is **faster** (and persistent while powered, ~6 transistors/bit); DRAM is **denser/cheaper** (typically one transistor plus one capacitor per bit).
3) Capacitor charge **leaks** (within 10–100 ms); each bit must be read and rewritten to retain its value.
4) **registers → cache (SRAM) → main memory (DRAM) → disk** (fastest to slowest).
5) `s` (the sum) has **temporal** locality; `items[i]` has **spatial** locality.
6) Row-major has good **spatial** locality; column-major has poor **spatial** locality.

**P14.2**
1) `(bytes/sector) × (sectors/track) × (tracks/surface) × (surfaces/platter) × (platters/disk)`.
2) `512 × 128 × 1024 × 2 × 2 = 268,435,456 bytes = 256 MiB`.
3) One rotation at 6,000 RPM takes `10 ms`, so average rotational latency is **5 ms**.
4) One sector takes `10 ms / 100 = 0.1 ms`.
5) `T_access = 5 + 5 + 0.1 = 10.1 ms`.
6) `10 ms / 100 ns = 100,000`, so disk access is roughly **10⁵ times** slower.

---

## Lecture 15

**P15.1**
1) `b = log2(16) = 4` bits.
2) `s = log2(8) = 3` bits.
3) `t = m − (s + b) = 12 − (3 + 4) = 5` bits.
4) `C = B × E × S = 16 × 2 × 8 = 256 bytes`.
5) `E = 1` → **direct-mapped**; one set → **fully associative**.
6) **Set selection, line matching, word extraction.**

**P15.2**
1) 0→**m**, 1→**h**, 13→**m**, 8→**m**, 0→**m**.
2) **Conflict miss** — address 8 (tag 1) evicted set 0; reading 0 again (tag 0) maps to the same set 0 and misses.
3) **25%** (1 miss per 4-word block).
4) **100% miss rate**; stride-N column-major traversal loses **spatial locality** in the lecture's example.
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
1) VPO = `log2(256 B) = 8` bits.
2) VPN = `16 − 8 = 8` bits.
3) `2^8 = 256` entries.
4) `2 B × 256 = 512 bytes`.
5) Select a **victim page** (write it to disk if dirty, clear its valid bit), copy the requested virtual page into the physical frame, update the PTE, then **restart** the faulting instruction.
6) **PTBR** (Page Table Base Register; CR3 on x86).

---

## Lecture 17

**P17.1**
1) **PTEs** (page table entries), indexed by the **virtual** address (VPN).
2) TLBI = the **t least-significant** bits of the VPN; TLBT = the **remaining (higher)** bits.
3) A large flat page table must stay fully in memory; multi-level tables let unallocated regions omit their lower-level tables, so only the top-level table must always be resident.
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
