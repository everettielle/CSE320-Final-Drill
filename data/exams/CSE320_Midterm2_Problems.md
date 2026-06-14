# CSE320 System Fundamentals II, Midterm Exam 2

- **Date:** 5/18/2026, 2:00pm ~ 3:20pm
- **Total:** [182 pt]
- **Name:** Everett Lee
- **Student ID:** 114183006

---

## P1. [52 pt] This problem is about dynamic memory allocation

### a. [2pt]
In which section of memory, does `malloc` function allocate memory?

> ____________________

### b. [4 x 2pt]
The following code allocates and deallocates memory for a 10x10 float matrix. Implement the blanks in the following code.

```c
#include <stdlib.h>
void test_malloc() {
    //allocate mat for 10 x 10 float matrix
    float **mat;
    mat = 1)________________________;
    for(int i = 0; i < 10; i++) {

        mat[i] = 2)________________________;
    }
    //deallocate mat
    for(int i = 0; i < 10; i++) {

        3)________________________;
    }
    4)________________________;
}
```

### c. [21 x 2pt]
Below are subfunctions to implement malloc and free. Implement the blanks.

```c
typedef unsigned int word;
// make a header: the least 3 significant bits are flags, the rest are size
word header_pack(word size, word alloc) {

    return 1)________________________;
}

// get the block size from the header
//   - least 3 significant bits are for flags
word header_size(word *phdr) {

    return 2)________________________;   // 1111 1000 -> 0000 0111
}

// get the allocation flag from the header
//   - least significant bit is the allocation bit
word header_alloc(word *phdr) {

    return 3)________________________;
}

// get the header pointer from the block pointer
word *block_header(char *pblk) {

    return 4)________________________;
}

// get the block size from the block pointer
word block_size(char *pblk) {

    return 5)________________________;
}

// get the allocation flag from the block pointer
word block_alloc(char *pblk) {

    return 6)________________________;
}

// get the footer pointer from the block pointer
word *block_footer(char *pblk) {

    return 7)________________________;
}

// get the next block pointer of the block pointer
char *block_next(char *pblk) {

    return 8)________________________;
}
//  [HDR | BLK ......... | FTR | HDR | BLK ...] ...

// get the previous block pointer of the block pointer
char *block_prev(char *pblk) {

    return 9)________________________;
}
//  [HDR | BLK ......... | FTR | HDR | BLK ...]

// implement the coalesce function
void *coalesce(char *pblk) {

    word size       = 10)________________________;

    char *pblk_prev = 11)________________________;

    char *pblk_next = 12)________________________;

    word prev_alloc = 13)________________________;

    word next_alloc = 14)________________________;

    if (!prev_alloc && !next_alloc) {
        return pblk;
    }
    else if (prev_alloc && !next_alloc) {

        size += 15)________________________;
    }
    else if (!prev_alloc && next_alloc) {

        size += 16)________________________;

        pblk = 17)________________________;
    }
    else /*!prev_alloc && !next_alloc*/ {

        size += 18)________________________;

        pblk = 19)________________________;
    }
    // update block header and footer
    20)________________________;

    21)________________________;

    return pblk;
}
```

---

## P2. [50 pt] This problem is about System APIs

### a. [2 x 8pt]
This problem is about Unix I/O. Find the functions for the following explanations.
Choose your answers from: **alarm, close, dup2, fork, execve, exit, kill, open, pipe, read, seek, signal, stat, wait, write**

1. A new entry in the descriptor table is added by this function. → ____________
2. The reference count in the open file table is decreased by this function. → ____________
3. This function makes a pair of read and write file descriptors connected through a queue. → ____________
4. This function copies an entry in the descriptor table to another entry in the table. → ____________
5. This function copies n bytes from a file to memory. → ____________
6. This function copies n bytes from memory to a file. → ____________
7. The file position in the open file table can be changed by this function. → ____________
8. The metadata of a file can be obtained using this function. → ____________

### b. [4 x 3pt]
This problem is about file related data structures. In left side figures, the first (top) file is "A.c" and the second (bottom) file is "B.c". Write the sequence of operations that can make the left-hand side diagram. The choices of operations are:

```
dup2(fda, fdb), fork(), open("A.c", O_RDONLY, 0), open("B.c", O_RDONLY, 0)
```

**1.** Descriptor table → File A (refcnt=1) and File B (refcnt=1), two separate open-file-table entries.

> ________________________________________

**2.** Descriptor table → two descriptors share File A (refcnt=1) open-file entry, plus File B (refcnt=1).

> ________________________________________

**3.** Parent's table & Child's table → both share File A (refcnt=2) and File B (refcnt=2).

> ________________________________________

**4.** Descriptor table → File A (refcnt=0), File B (refcnt=2).

> ________________________________________

### c. [11 x 2pt]
The function performs `ls -al | wc` command. Implement the blanks.

```c
#include <unistd.h>
int close(int fd);
int dup2(int oldfd, int newfd);
int execvp(const char *file, char *const argv[]);
pid_t fork(void);
int pipe(int pipefd[2]);

// suppose: #define STDIN = 0, #define STDOUT = 1
void test_pipe() {
    int fd[2];
    // open pipe
    1)________________________;
    // make a child process
    pid_t pid = 2)________________________;

    if( 3)________________________ ) { // if child
        // close unnecessary fd
        4)________________________;
        // connect pipe to stdout
        5)________________________;
        // prepare parameters for ls -al
        6)________________________;
        // load ls -al
        7)________________________;
    }
    else { // if parent
        // close unnecessary fd
        8)________________________;
        // connect pipe to stdin
        9)________________________;
        // prepare parameters for wc
        10)________________________;
        // run wc
        11)________________________;
    }
}
```

---

## P3. [30 pt] This problem is about exceptional control flow

### a. [5 x 2pt]
What are the elements of a process context for the following explanations.
Choose the most specific answer from: **Program Counter, Stack Pointer, registers, page table, process table**

1. To restore the next instruction to fetch: → ____________
2. To restore the function call and return information: → ____________
3. To restore the CPU state: → ____________
4. To restore the virtual memory: → ____________
5. It holds the metadata about the process: → ____________

### b. [5 x 2pt]
This problem is about signals. Find the functions for the following explanations.
Choose your answers from: **alarm, close, exit, kill, open, read, signal, sigprocmask, sigsuspend, wait, write**

1. This function registers a signal handler → ____________
2. This function sends a signal to another process → ____________
3. This function enables/disables the handling of certain signals → ____________
4. This function sends a signal to the calling process after a certain duration of time. → ____________
5. This function is equivalent to unblocking signals, pause then blocking signals together atomically. → ____________

### c. [5 x 2pt]
Implement the blanks to handle SIGINT.

```c
#include <signal.h>
#include <stdio.h>
int sigfillset(sigset_t *set);
sighandler_t signal(int signum, sighandler_t handler);
int sigprocmask(int how, const sigset_t *set, sigset_t *oldset);
//how: one of SIG_BLOCK, SIG_UNBLOCK, SIG_SETMASK
int sigsuspend(const sigset_t *mask);

int stack[100], sp = 0;
void handler(int sig) {
    stack[sp++] = sig;
}
void test_signal() {
    sigset_t mask, prev;
    // make a bit mask for all signals
    1)________________________;

    // block signal
    2)________________________;

    // register handler for SIGINT
    3)________________________;
    do {
        // wait until signal is handled
        4)________________________;
        printf("%d\n", stack[--sp]);
    } while(sp > 0);
    // unblock signal
    5)________________________;
}
```

---

## P4. [50 pt] This problem is about network

### a. [11 x 2pt]
Find the term that matches the following explanations best.
Choose your answers from: **adapter, bridge, frame, hub, IP address, MAC, packet, port number, router, TCP, UDP**

1. A physical interface that copies data between host and network. → ____________
2. This device copies the data it receives from a port to all the other ports → ____________
3. Each adapter of Ethernet segment has this 48 bit address. → ____________
4. A unit of data transferred between hosts in the Ethernet segment → ____________
5. This device connects multiple Ethernet segments by selectively sending data from a port to another port → ____________
6. This device connects multiple incompatible LANs → ____________
7. A unit of data transferred between hosts in the IP internet → ____________
8. This number in a TCP connection identifies a process running on a host → ____________
9. This 32bit number identifies the adapter devices in the IP Internet → ____________
10. In IP Internet, this connection between processes is a reliable bidirectional connection → ____________
11. In IP Internet, packets can be lost or duplicated using this connection between processes. → ____________

### b. [14 x 2pt]
Below is a client-server program, where the server reads an integer x and returns x+1 to the client. Implement the blanks by finding the code from the choices below.
- Write a) to i) instead of the code line.
- Some code can be used multiple times.

**Choices:**

```c
a) ni  = htons(hi);                                              // host to network
b) cfd = accept(sfd, (struct sockaddr*)&caddr, &clen);
c) bind(sfd, (struct sockaddr*)&saddr, sizeof(saddr));
d) connect(sfd, (struct sockaddr*)&saddr, sizeof(saddr));
e) listen(sfd, 1024);
f) hi  = ntohs(ni);                                              // network to host
g) read(fd, &ni, sizeof(int));
h) sfd = socket(AF_INET, SOCK_STREAM, 0);
i) write(fd, &ni, sizeof(int));
```

```c
#include <arpa/inet.h>
#include <sys/socket.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>

//read an integer from the client; increase it; and write it back to the client
void inc_response(int fd) {
    int hi, ni; //host int, network int

    1)________________________

    2)________________________
    hi++;

    3)________________________

    4)________________________
}

//write hi to the server; read response from the server; return the integer
int inc_query(int fd, int hi /*host int*/) {
    int ni; //network int

    5)________________________

    6)________________________

    7)________________________

    8)________________________
    return hi;
}

void init_socket(struct sockaddr_in *saddr) {
    memset(saddr, 0, sizeof(struct sockaddr_in));
    saddr->sin_family = AF_INET;
    saddr->sin_addr.s_addr = htonl(INADDR_ANY);
    saddr->sin_port = htons(8000);
}

void test_server() {
    int sfd, cfd, clen = sizeof(caddr);
    struct sockaddr_in saddr, caddr;
    init_socket(&saddr);

    9)________________________

    10)________________________

    11)________________________

    12)________________________

    inc_response(cfd);

    close(cfd);
    close(sfd);
}

void test_client() {
    int sfd;
    struct sockaddr_in saddr;
    init_socket(&saddr);
    saddr.sin_addr.s_addr = inet_addr("127.0.0.1");

    13)________________________

    14)________________________

    int i = inc_query(sfd, 0);
    printf("%d\n", i);
    close(sfd);
}

void test_network() {
    if(fork() == 0) {
        sleep(1);
        test_client();
    }
    else {
        test_server();
    }
}
```
