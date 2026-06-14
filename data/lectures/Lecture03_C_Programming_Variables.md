# CSE320 System Fundamentals II — Variables

**YoungMin Kwon**

---

## Contents

- **Types**
  - Basic, array, pointer, composite types
- **Variable Scopes**
  - auto, static, extern
  - local, global

---

## Basic Types

- Basic types:
  - `char`, `short`, `int`, `long`, `long long`, …
  - `float`, `double`, `long double`, …

- `sizeof` operator to get the size of a type in bytes

```c
#include <stdio.h>
int main() {
    int i = 10;
    printf("sizeof(int): %ld\n", sizeof(int));
    printf("sizeof(i): %ld\n", sizeof(i));
    printf("sizeof(10): %ld\n", sizeof(10));
    return 0;
}
```

---

## Basic Types & Literals

```c
#include <stdio.h>
int main() {
    //see stdint.h for the size of primitive types
    char      c  = 'a';
    short     s  = (short)0;    //equivalent to short int
    int       i  = 0;
    long      l  = 0L;          //equivalent to long int
    long long ll = 0LL;         //equivalent to long long int
                                //(at least as large as long)
    float       f  = 0.0f;
    double      d  = 0.0;
    long double ld = 0.0L;
    …
    return 0;
}
```

### Sizes of Basic Types & Literals

```c
printf("     size of char: %2d, %2d\n", sizeof(c),  sizeof((char)'a'));
printf("    size of short: %2d, %2d\n", sizeof(s),  sizeof((short)0));
printf("      size of int: %2d, %2d\n", sizeof(i),  sizeof(0));
printf("     size of long: %2d, %2d\n", sizeof(l),  sizeof(0L));
printf("size of long long: %2d, %2d\n", sizeof(ll), sizeof(0LL));
printf("    size of float: %2d, %2d\n", sizeof(f),  sizeof(0.0f));
printf("   size of double: %2d, %2d\n", sizeof(d),  sizeof(0.0));
printf("size of long double: %2d, %2d\n", sizeof(ld), sizeof(0.0L));
```

**Output:**

```
     size of char:  1,  1
    size of short:  2,  2
      size of int:  4,  4
     size of long:  8,  8
size of long long:  8,  8
    size of float:  4,  4
   size of double:  8,  8
size of long double: 16, 16
```

### Basic Types in Assembly (var_types.c)

| C Code | Assembly |
|--------|----------|
| `char _char = 1;` | `_char: .byte 1` |
| `short _short = 1;` | `_short: .value 1` |
| `int _int = 1;` | `_int: .long 1` |
| `long _long = 1L;` | `_long: .quad 1` |
| `long long _long_long = 1LL;` | `_long_long: .quad 1` |
| `float _float = 3.14F;` | `_float: .long 1078523331` |
| `double _double = 3.14;` | `_double: .long 1374389535` / `.long 1074339512` |
| `long double _long_double = 3.14L;` | `_long_double: .long 1546188227` / `.long -923417969` / `.long 16384` / `.long 0` |

All placed in the `.data` section.

---

## Array Types

- Array of other types. E.g. `int a[10];`
- **Array name** is a **constant** pointing to the address of the first array element
- `sizeof(a)` returns the **total bytes** allocated to the array

```c
#include <stdio.h>
int main() {
    int a[10];
    printf("a:      %p\n", a);
    printf("&a[0]:  %p\n", &a[0]);
    printf("sizeof(a):              %ld\n", sizeof(a));
    printf("sizeof(a)/sizeof(int):  %ld\n", sizeof(a)/sizeof(int));
    return 0;
}
```

**Output:**

```
a:      0x7fffe5346530
&a[0]:  0x7fffe5346530
sizeof(a):              40
sizeof(a)/sizeof(int):  10
```

### String Literals as Arrays

```c
printf("\"hello world\":      %p\n", "hello world");
printf("&\"hello world\"[0]: %p\n", &"hello world"[0]);
printf("sizeof(\"hello world\"): %ld\n", sizeof("hello world"));

char arr[] = "hello world";
//char arr[12] = {'h', 'e', ..., 'l', 'd', '\0'};
printf("arr:      %p\n", arr);
printf("&arr:     %p\n", &arr);
printf("&arr[0]:  %p\n", &arr[0]);
printf("sizeof(arr): %ld\n", sizeof(arr));
```

**Output:**

```
"hello world":      0x55ffacda8088
&"hello world"[0]:  0x55ffacda8088
sizeof("hello world"): 12

arr:      0x7ffd67db146c
&arr:     0x7ffd67db146c
&arr[0]:  0x7ffd67db146c
sizeof(arr): 12
```

> Note: The string literal `"hello world"` resides in the **read-only segment** (low address), while the array `arr` is on the **stack** (high address).

### Array Types in Assembly (var_types.c)

```c
// array types
char _arr_char[4] = {0, 1, 2, 3};
int  _arr_int[4]  = {0, 1, 2, 3};
```

```asm
_arr_char:
        .string ""
        .ascii "\001\002\003"
_arr_int:
        .long 0
        .long 1
        .long 2
        .long 3
```

---

## Pointer Types

- Variables holding the **address** of other elements:

```c
int *p, q;  //*p: p is an int pointer type variable
p = &a;     //p has the address of a
q = *p;     //q has the value of a
```

- `*` at a variable definition: **pointer definition**
- `&` operator returns the **address** of a variable
- `*` operator returns the **value** stored at the address

### Pointer vs Array with Strings

```c
printf("\"hello world\":      %p\n", "hello world");
printf("&\"hello world\"[0]: %p\n", &"hello world"[0]);
printf("sizeof(\"hello world\"): %ld\n", sizeof("hello world"));

char *str = "hello world";
printf("str:      %p\n", str);
printf("&str:     %p\n", &str);
printf("&str[0]:  %p\n", &str[0]);
printf("sizeof(str): %ld\n", sizeof(str));
```

**Output:**

```
"hello world":      0x55ffacda8088
&"hello world"[0]:  0x55ffacda8088
sizeof("hello world"): 12

str:      0x55ffacda8088
&str:     0x7ffd67db1438
&str[0]:  0x55ffacda8088
sizeof(str): 8
```

> Key difference: `sizeof(str)` is **8** (size of a pointer on 64-bit), NOT 12.  
> The pointer variable `str` itself lives on the **stack**, but it **points to** the string literal in the **read-only segment**.

### Pointer Types in Assembly (var_types.c)

```c
// pointer types
char *_ptr_char            = _arr_char;
int  *_ptr_int             = _arr_int;
int **_ptr_ptr_int         = &_ptr_int;
int (*_ptr_fun)(int)       = (void*)0;
```

```asm
_ptr_char:
        .quad _arr_char
_ptr_int:
        .quad _arr_int
_ptr_ptr_int:
        .quad _ptr_int
_ptr_fun:
        .zero 8
```

---

## Pointer Arithmetic

- A **type** is associated with a pointer variable
- `+`, `-` operators on pointers add or subtract the **size of the associated type**
  - `p++`, `p--`, `p += 2`, …
  - `p - q` is the **number of elements** between `p` and `q`
  - `p + q`, `p * 2`, `p / 2`, … are **invalid** operations
- **Casting**: `(type) expr` — changes the type of `expr` to `type`

### Example: Pointer Arithmetic in Action

```c
#include <stdio.h>

void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

void getbuf(int** p, int n) {
    static int next = 0;
    static int buf[100] = { 0, 1, 2, 3, };
    // TODO: boundary check
    *p = buf + next;
    next += n;
}

int main() {
    int *a, *b;

    getbuf(&a, 4);
    swap(a+0, a+3);
    swap(a+2, a+1);
    printf("a:[0..3]: %d, %d, %d, %d\n",
           a[0], a[1], a[2], a[3]);

    getbuf(&b, 4);
    printf("a + 1: %ld, %ld, %ld\n",
           (long)a,
           (long)(a + 1),
           ((long)a) + 1);
    printf("b - a: %ld, %ld\n",
           b - a,
           (long)b - (long)a);
}
```

**Output:**

```
a:[0..3]: 3, 2, 1, 0
a + 1: 93978374623264, 93978374623268, 93978374623265
b - a: 4, 16
```

> - `(long)(a + 1)` adds **4 bytes** (size of `int`) → ends in `...268`
> - `((long)a) + 1` adds **1 byte** (plain integer addition) → ends in `...265`
> - `b - a` = **4** (elements), but `(long)b - (long)a` = **16** (bytes)

---

## Composite Types

### struct and union

```c
struct spair {char a; int b;};
union  upair {char a; int b;};
```

- **struct** type: Each element has its **own space**
- **union** type: All elements **share the same space**
- `.` : to access the elements of a composite data
- `->` : to access the elements of a composite data from a pointer

```c
struct spair s  = {.a = 1, .b = 2},
             *ps = &s;
ps->a = ps->b;  //equiv. to (*ps).a = (*ps).b;
```

### struct vs union Example

```c
int main() {
    struct spair {long a; long b;};
    union  upair {long a; long b;};

    struct spair s = {.a = 1, .b = 2}, *ps = &s;
    union  upair u = {.b = 2},         *pu = &u;

    printf("sizeof(s): %ld, &s.a: %p, &s.b: %p\n", sizeof(s), &s.a, &s.b);
    printf("sizeof(u): %ld, &u.a: %p, &u.b: %p\n", sizeof(u), &u.a, &u.b);

    ps->b = 3;  //equiv. to (*ps).b = 3;
    pu->b = 3;  //equiv. to (*pu).b = 3;

    printf("s.a: %ld, s.b: %ld\n", s.a, s.b);
    printf("u.a: %ld, u.b: %ld\n", u.a, u.b);

    return 0;
}
```

**Output:**

```
sizeof(s): 16, &s.a: 0x7ffd2a88f000, &s.b: 0x7ffd2a88f008
sizeof(u):  8, &u.a: 0x7ffd2a88efe8, &u.b: 0x7ffd2a88efe8
s.a: 1, s.b: 3
u.a: 3, u.b: 3
```

> - In `struct`, `a` and `b` have **different addresses** (offset by 8 bytes).
> - In `union`, `a` and `b` share the **same address**, so modifying one changes the other.

### Composite Types in Assembly (var_types.c)

```c
// struct type
struct {
    char c;
    int  i;
} _struct = { .c = 1, .i = 2 };

// union type
union {
    char c;
    int  i;
} _union = { .i = 2 };
```

```asm
_struct:
        .byte 1
        .zero 3       ; padding for alignment
        .long 2
_union:
        .long 2
```

### Byte Order (Endianness)

```c
//byteorder.c
#include <stdio.h>

union byte_order {
    unsigned long  i;
    unsigned char  a[8];
};

int main() {
    union byte_order u;
    u.i = 0x0123456789abcdef;

    printf("%lx\n", u.i);
    printf("%02x, ", u.a[0]);
    printf("%02x, ", u.a[1]);
    printf("%02x, ", u.a[2]);
    printf("%02x, ", u.a[3]);
    printf("%02x, ", u.a[4]);
    printf("%02x, ", u.a[5]);
    printf("%02x, ", u.a[6]);
    printf("%02x\n", u.a[7]);

    return 0;
}
```

**Output:**

```
123456789abcdef
ef, cd, ab, 89, 67, 45, 23, 01
```

> This demonstrates **little-endian** byte order: the least significant byte (`0xef`) is stored at the lowest address (`a[0]`).

---

## Typedef

- Users can define their own types using `typedef`
- Syntax is like variable definitions except that they begin with `typedef` keyword

```c
typedef char* string;
typedef int myint;
typedef float vector[3];

typedef struct person {
    char name[10];
    long id;
} person;

typedef int (*binop)(int, int);  // function pointer
```

### Typedef Example: OOP-style in C

```c
#include <stdio.h>

typedef struct vector3 vector3;

struct vector3 {
    double x, y, z;
    void (*add)(vector3* self, vector3* a);
    void (*sub)(vector3* self, vector3* a);
    void (*print)(vector3* self);
};

void add(vector3* self, vector3* a) {
    self->x += a->x;
    self->y += a->y;
    self->z += a->z;
}

void sub(vector3* self, vector3* a) {
    self->x -= a->x;
    self->y -= a->y;
    self->z -= a->z;
}

void print(vector3* self) {
    printf("[%lf, %lf, %lf]\n",
           self->x, self->y, self->z);
}

void init(vector3* self,
          double x, double y, double z)
{
    self->x = x;
    self->y = y;
    self->z = z;
    self->add   = add;
    self->sub   = sub;
    self->print = print;
}

int main() {
    vector3 a, b;
    init(&a, 1, 2, 3);
    init(&b, 2, 3, 4);
    a.add(&a, &b);
    a.print(&a);
    return 0;
}
```

---

## Variable Scope

### Variable Declaration vs Definition

- **Declaration**: Tell the compiler about the variable/function you are going to use **without actually allocating space**.
- **Definition**: **Allocating a space** for the variable and the machine code for the function.

### Variable Scope

- Where the variable is **visible**
- Auto, Static, Extern scopes

### Variable Lifetime

- **Global**: exists for the entire lifetime of the program
- **Local**: exists only while execution is within the block

---

## Auto Variables

- Visible from the **containing block**
- Valid while the program remains within the block (**local**)
- Allocated in **stack** area
- **Initialized every time** the program enters the block

```c
int auto_var(int p) {
    int i = 0;
    while(i < 10) {
        int j = 0;
        while(j < 10) {
            {
                int k = 2;
                k++;
            }
            if(i < j) {
                int k = 3;
                k++;
            }
            j++;
        }
        i++;
    }
}
```

### Auto Variables in Assembly

```asm
        .text
auto_var:
        pushq   %rbp
        movq    %rsp, %rbp
        …
        movl    $2, -8(%rbp)      ; int k = 2  (first block)
        addl    $1, -8(%rbp)      ; k++
        …
        movl    $3, -4(%rbp)      ; int k = 3  (if block)
        addl    $1, -4(%rbp)      ; k++
        …
```

> Both `k` variables are allocated on the **stack** (relative to `%rbp`). They occupy different stack slots despite having the same name, because they are in different scopes.

---

## Static Variables

- Visible from the **containing block** or from the **same file** when defined outside of a function
- Valid throughout the **lifetime of the program** (**global** lifetime)
- Allocated in **read-only or read/write data area**
- **Initialized only once** during the lifetime of the program

```c
static int s = 10;
static int t;       //not initialized

int static_var() {
    int i = 0;
    while(i < 10) {
        int j = 0;
        while(j < 10) {
            {
                static int k = 20;
                k++;
            }
            if(i < j) {
                static int k = 30;
                k++;
                s++;
            }
            j++;
        }
        i++;
    }
}
```

### Static Variables in Assembly

```asm
        .data
s:
        .long   10
        .local  t
        .comm   t,4,4

        .text
static_var:
        …
        movl    k.1(%rip), %eax       ; static int k = 20
        addl    $1, %eax
        movl    %eax, k.1(%rip)
        …
        movl    k.0(%rip), %eax       ; static int k = 30
        addl    $1, %eax
        movl    %eax, k.0(%rip)
        …

        .data
k.1:
        .long   20
k.0:
        .long   30
```

> - `s` and `t` are in the `.data` / `.bss` section (file-level static).
> - `k.1` and `k.0` are **compiler-generated unique names** for the two local static `k` variables — they live in `.data`, NOT on the stack.

---

## Extern Variables

- Visible from **other files**
- Valid throughout the **lifetime of the program** (**global** lifetime)
- Allocated in **read-only or read/write data area**
- **Initialized only once** during the lifetime of the program

```c
int e = 100;        //define e
int f;              //not initialized
extern int g;       //declare g

int extern_var() {
    int i;
    while(i < 10) {
        int j;
        while(j < 10) {
            {
                //declare k
                extern int k;
                k++;
            }
            if(i < j) {
                //declare k
                extern int k;
                k++;
            }
            j++;
        }
        i++;
    }
}
```

### Extern Variables in Assembly

```asm
        .globl  e
        .data
e:
        .long   100
        .globl  f
        .bss
f:
        .zero   4

        .text
extern_var:
        …
        movl    k(%rip), %eax         ; extern int k (first block)
        addl    $1, %eax
        movl    %eax, k(%rip)
        …
        movl    k(%rip), %eax         ; extern int k (if block)
        addl    $1, %eax
        movl    %eax, k(%rip)
        …
```

> - Both `extern int k` declarations refer to the **same** global `k` (defined in another file).
> - `e` is in `.data` (initialized, global). `f` is in `.bss` (uninitialized, global).

---

## Variable Allocation

### Single-file Example (var_loc.c)

```c
//var_loc.c
//gcc -c var_loc.c

#include <stdio.h>

extern int ext;
int g_ini = 3;
int g_uni;
static int s_ini = 4;
static int s_uni;

int main() {
    int a_ini = 5;
    int a_uni;
    printf("ext: %d\n", ext);
    printf("g_ini: %d, g_uni: %d\n", g_ini, g_uni);
    printf("s_ini: %d, s_uni: %d\n", s_ini, s_uni);
    printf("a_ini: %d, a_uni: %d\n", a_ini, a_uni);
}
```

### Symbol Table (readelf -s var_loc.o)

| Num | Size | Type   | Bind   | Ndx | Name   |
|-----|------|--------|--------|-----|--------|
| 5   | 4    | OBJECT | LOCAL  | 3   | s_ini  |
| 6   | 4    | OBJECT | LOCAL  | 4   | s_uni  |
| 12  | 4    | OBJECT | GLOBAL | 3   | g_ini  |
| 13  | 4    | OBJECT | GLOBAL | COM | g_uni  |
| 14  | 138  | FUNC   | GLOBAL | 1   | main   |
| 15  | 0    | NOTYPE | GLOBAL | UND | ext    |
| 17  | 0    | NOTYPE | GLOBAL | UND | printf |

- **LOCAL**: `s_ini`, `s_uni` — local to the file (static)
- **GLOBAL**: `g_ini`, `g_uni`, `main` — visible from all files
- **UND** (Undefined): `ext`, `printf` — not defined in this file

### Multi-file Example

**file1.c:**

```c
int e1 = 100;
static int s1 = 200;

int main() {
    extern int e2;
    extern void foo(int a);
    foo(e1 + e2 + s1);
    return 0;
}
```

**file2.c:**

```c
#include <stdio.h>

int e2;

void foo(int a) {
    extern int e1;
    static int s2;
    int b = 300;
    printf("e1: %d, e2: %d, s2: %d, a: %d, b: %d\n",
           e1, e2, s2, a, b);
}
```

### Symbol Tables for Multi-file Example

**file1.o:**

| Bind   | Ndx | Name |
|--------|-----|------|
| LOCAL  | 3   | s1   |
| GLOBAL | 3   | e1   |
| GLOBAL | 1   | main |
| GLOBAL | UND | e2   |
| GLOBAL | UND | foo  |

> `e2` and `foo` are **UND** (not in this file).

**file2.o:**

| Bind   | Ndx | Name    |
|--------|-----|---------|
| LOCAL  | 4   | s2.2318 |
| GLOBAL | COM | e2      |
| GLOBAL | 1   | foo     |
| GLOBAL | UND | e1      |
| GLOBAL | UND | printf  |

> `e2` is in this file (COM section). `e1` is **UND** (defined in file1).

**a.out (linked):**

| Bind   | Ndx | Name                |
|--------|-----|---------------------|
| LOCAL  | 25  | s1                  |
| LOCAL  | 26  | s2.2318             |
| GLOBAL | UND | printf@@GLIBC_2.2.5 |
| GLOBAL | 26  | e2                  |
| GLOBAL | 16  | foo                 |
| GLOBAL | 16  | main                |
| GLOBAL | 25  | e1                  |

> `printf` is still **UND** — it will be loaded at **run time** from the shared library.

### BSS vs Data Section

```c
// bss.c

#if 1
char buf[100000000]; // 100 MB — uninitialized
#else
char buf[100000000] = {1,}; // initialized
#endif

int main() {
    buf[0] = 1;
}
```

**Uninitialized** (goes to `.bss`):

```asm
        .globl  buf
        .bss
buf:
        .zero   100000000
```

**Initialized** (goes to `.data`):

```asm
        .globl  buf
        .data
buf:
        .string "\001"
        .zero   99999998
```

> The `.bss` section does **not** occupy space in the binary file — only a size notation. The `.data` version would make the binary ~100 MB.

---

## Variable Allocation in Assembler — Summary

| Section | Description |
|---------|-------------|
| `.data` | Readable, writable, initialized, global variables |
| `.rodata` | Read-only, initialized, global variables |
| `.bss`, `.comm` | Uninitialized global variables |
| `.text` | Instruction codes |
| **Stack** | Local variables, parameters |
| **Heap** | Dynamic allocation (`malloc`) |
| **Shared libraries** | Library functions like `printf` |

### Comprehensive Example

```c
int ei = 100;
static int si = 200;

int eu;
static int su;

const int ec = 300;
static const int sc = 400;

void foo(int p1, int p2) {
    extern void bar(char*);
    int ai = 500;
    int au;
    bar("Hello world");
}
```

```asm
        .globl  ei
        .data
ei:
        .long   100
si:
        .long   200
        .comm   eu,4,4           # to bss (name,size,alignment)
        .local  su
        .comm   su,4,4           # equiv to .lcomm su

        .globl  ec
        .section        .rodata
ec:
        .long   300
sc:
        .long   400
.LC0:
        .string "Hello world"

        .text
        .globl  foo
foo:
        pushq   %rbp             # caller's stack frame
        movq    %rsp, %rbp       # foo's stack frame
        subq    $32, %rsp        # alloc mem in stack
        movl    %edi, -20(%rbp)  # p1
        movl    %esi, -24(%rbp)  # p2
        movl    $500, -4(%rbp)   # int ai = 500;
        …
        ret
```

---

## Map Files to Memory

```bash
$ cat /proc/self/maps
```

```
start-adrs       end-adrs         perm offset   dev   inode file-name
654a1dfd0000-654a1dfd2000 r--p 00000000 08:30 1283  /usr/bin/cat
654a1dfd2000-654a1dfd6000 r-xp 00002000 08:30 1283  /usr/bin/cat
654a1dfd6000-654a1dfd8000 r--p 00006000 08:30 1283  /usr/bin/cat
654a1dfd8000-654a1dfd9000 r--p 00007000 08:30 1283  /usr/bin/cat
654a1dfd9000-654a1dfda000 rw-p 00008000 08:30 1283  /usr/bin/cat
654a5096c000-654a5098d000 rw-p 00000000 00:00 0     [heap]
7cc353200000-7cc353228000 r--p 00000000 08:30 67095 /usr/lib/x86_64-linux-gnu/libc.so.6
7cc353228000-7cc3533bd000 r-xp 00028000 08:30 67095 /usr/lib/x86_64-linux-gnu/libc.so.6
…
7ffe28075000-7ffe28096000 rw-p 00000000 00:00 0     [stack]
```

> The memory layout maps the binary and shared libraries into different regions:
> - `r--p`: read-only (rodata)
> - `r-xp`: read + execute (text/code)
> - `rw-p`: read + write (data, bss, heap, stack)

---

## Programming Assignment 2

- This assignment is about **variable locations**
- Download `section_test.c` and `section_vars.c`
- Compile: `gcc section_test.c section_vars.c`
  - The order of the file names matters.
- Try run `a.out` — it will fail
- Replace `none` in `section_vars.c` with the section to which the pointer expression belongs.
- Submit updated `section_vars.c` to Brightspace
- Due date: TBD

### section_test.c Overview

The test program:
1. Reads `/proc/self/maps` to load the memory map of the running process.
2. Provides section-checking functions: `none`, `rodata`, `data`, `bss`, `text`, `heap`, `stack`.
3. Each function checks a pointer's address against the memory map to determine which section it belongs to.

**Section detection logic:**

| Function | Permission | inode | fname |
|----------|-----------|-------|-------|
| `rodata` | `r--p` | ≠ 0 | — |
| `data` | `rw-p` | ≠ 0 | — |
| `bss` | `rw-p` | == 0 | empty |
| `text` | `r-xp` | ≠ 0 | — |
| `heap` | `rw-p` | == 0 | `[heap]` |
| `stack` | `rw-p` | == 0 | `[stack]` |

### section_vars.c — Variables to Classify

```c
int a;                    // → which section?
int b = 1;                // → which section?
const int c = 1;          // → which section?
static int d;             // → which section?
static int e = 1;         // → which section?
static const int f = 1;   // → which section?
```

Replace `none` with the correct section function (`bss`, `data`, `rodata`, etc.) for each variable.
