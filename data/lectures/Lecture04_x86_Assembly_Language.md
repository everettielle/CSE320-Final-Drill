# CSE320 System Fundamentals II — x86 Assembly Language

**Instructor:** YoungMin Kwon

---

## Generating an Assembly File from C

```bash
gcc –S –c –O0 –fverbose-asm hello.c
```

- `-S`: generate an assembly file (`hello.s`)
- `-c`: compile only (do not link)
- `-O0`: no optimization
- `–fverbose-asm`: add verbose comments

---

## Example: hello.c → hello.s

### hello.c

```c
#include <stdio.h>
static int g = 1;
int main() {
    int a = 2;
    printf("hello world %d, %d\n",
           g, a);
    return 0;
}
```

### hello.s

```asm
        .data
g:
        .long   1
        .section .rodata
.LC0:
        .string "hello world %d, %d\n"
        .text
        .globl  main
main:
        pushq   %rbp
        movq    %rsp, %rbp
        subq    $16, %rsp
    # hello.c:4:    int a = 2;
        movl    $2, -4(%rbp)
    # hello.c:5:    printf("hello world %d, %d\n",
    #                      g, a);
        movl    g(%rip), %eax
        movl    -4(%rbp), %edx
        movl    %eax, %esi
        leaq    .LC0(%rip), %rdi
        movl    $0, %eax
        call    printf@PLT
    # hello.c:6:    return 0;
        movl    $0, %eax
    # hello.c:7: }
        leave
        ret
```

---

## x86 Assembly — Two Different Syntaxes

### Intel Syntax: `op dst, src`

```asm
movl eax, 1         # eax = 1
addl eax, ebx       # eax = eax + ebx
```

### AT&T (GAS) Syntax: `op src, dst`

```asm
movl $1, %eax       # eax = 1
addl %eax, %ebx     # ebx = ebx + eax
```

---

## Assembler Directives for Sections

| Directive | Description |
|-----------|-------------|
| `.text` | Instruction codes are defined here |
| `.data` | Initialized read/write data are defined here |
| `.section .rodata` | Initialized read-only data are defined here |
| `.comm`, `.bss` | Uninitialized data are allocated in the bss section |
| `.local name` | Makes a name a local symbol |
| `.lcomm` | `.local` + `.comm` |

---

## More Assembler Directives

| Directive | Description |
|-----------|-------------|
| `.string "string"` | Defines a null-terminated string |
| `.ascii "string"` | Defines a string **without** the null-terminator |
| `.byte`, `.int`, `.long`, `.quad` | Define integer numbers |
| `.zero x` | Allocate x bytes |
| `.double`, `.float` | Define floating point numbers |
| `.align` | Pad the location counter to a particular storage boundary |

---

## AT&T Assembly Format

### General Format

- **Instruction, source, destination**
- e.g. `movb $0x05, %al`

### Operation Suffixes

Instructions are suffixed with:

| Suffix | Meaning |
|--------|---------|
| `b` | byte (1 byte) |
| `s` | short (2-byte int or 4-byte float) |
| `w` | word (2 bytes) |
| `l` | long (4-byte int or 8-byte float) |
| `q` | quad (8 bytes) |
| `t` | ten byte (10-byte float) |

### Prefixes

- `%` for registers
- `$` for constant numbers

---

## Three Categories of Instructions

1. **Data transfer** — Constants, registers, memory
2. **Data processing** — Arithmetic and logical operators
3. **Control flow** — Flags, jump and call operators

---

## Literals

### Integers

- decimal: `24`
- binary: `0b1010`
- hexadecimal: `0x4a`
- octal: `074`

### Floating point numbers

- `0.1`, `1.2e3`

### Strings

- `"abc\n"`

### Characters

- `'a'`, `'\n'`

---

## Registers

| Size | Registers |
|------|-----------|
| 8 bit | AH, AL, BH, BL, CH, CL, DH, DL, R8B, …, R15B |
| 16 bit | AX, BX, CX, DX, SI, DI, SP, BP, R8W, …, R15W |
| 32 bit | EAX, EBX, ECX, EDX, ESI, EDI, ESP, EBP, R8D, …, R15D |
| 64 bit | RAX, RBX, RCX, RDX, RSI, RDI, RSP, RBP, R8, …, R15 |

### Register Nesting (example: RAX)

```
|            %rax (64 bits)                   |
|                     |     %eax (32 bits)    |
|                     |       %ax (16 bits)   |
|                     |   %ah (8) |  %al (8)  |
```

---

## Addressing Operand

### Syntax

```
segment : displacement ( base reg , offset reg , scalar multiplier )
```

**Effective address** = `base reg + offset reg * scalar multiplier + displacement` (ignoring segment)

- Either or both of numeric parameters can be omitted
- Either of the register parameters can be omitted

### Examples

```asm
# load from memory address
movl -5(%rbp, %rsi, 4), %eax   # load [rbp + rsi * 4 - 5] to eax
movl -5(%rbp), %eax             # load [rbp - 5] to eax

# lea: load effective address
leaq 8(%rbx, %rcx, 2), %rax    # copy rbx + rcx * 2 + 8 to rax
```

---

## Move Instructions

### `mov src, dst` — Copy from src to dst

```asm
# copy 0 to eax
movl    $0, %eax

# copy the address of .LC0 to rax
leaq    .LC0(%rip), %rax

# copy byte to long, extend zero
movzbl  %al, %eax

# copy byte to long, extend the sign of al
movsbl  %al, %eax
```

---

## Stack Manipulation Instructions

### `push src` — Push src to the stack

```asm
pushq %rax       # push rax to the stack
# equivalent to
subq  $8, %rsp
movq  %rax (%rsp)
```

### `pop dst` — Pop from the stack and copy the result to dst

```asm
popq %rax        # pop from the stack to rax
# equivalent to
movq  (%rsp) %rax
addq  $8, %rsp
```

---

## Arithmetic Instructions

### Addition and Subtraction

```asm
addq $2,   %rax      # rax = rax + 2
subq %rbx, %rax      # rax = rax - rbx
```

### Multiplication and Division

```asm
mulw %bx             # bx * ax -> dx:ax
                      # (dx:ax = 2^16 * dx + ax,
                      #  dx higher 16 bits,
                      #  ax lower 16 bits)

divl %ebx            # edx:eax / ebx -> eax,
                      # edx:eax % ebx -> edx
```

### C to Assembly Example (Arithmetic)

```c
void arith(int x, int y) {
    int a;
    a = x + y;
    a = x - y;
    a = x * y;
    a = x / y;
}
```

```asm
arith:
        pushq   %rbp
        movq    %rsp, %rbp
        movl    %edi, -20(%rbp)         # x, x
        movl    %esi, -24(%rbp)         # y, y

    # a = x + y;
        movl    -20(%rbp), %edx         # x, tmp86
        movl    -24(%rbp), %eax         # y, tmp87
        addl    %edx, %eax              # tmp86, tmp85
        movl    %eax, -4(%rbp)          # tmp85, a

    # a = x - y;
        movl    -20(%rbp), %eax         # x, tmp91
        subl    -24(%rbp), %eax         # y, tmp90
        movl    %eax, -4(%rbp)          # tmp90, a

    # a = x * y;
        movl    -20(%rbp), %eax         # x, tmp93
        imull   -24(%rbp), %eax         # y, tmp92
        movl    %eax, -4(%rbp)          # tmp92, a

    # a = x / y;
        movl    -20(%rbp), %eax         # x, tmp97
        cltd                            # convert long to double
                                        # (eax -> edx:eax)
                                        # cqto (rax -> rdx:rax)
        idivl   -24(%rbp)              # y
        movl    %eax, -4(%rbp)          # tmp95, a

    # }
        nop
        popq    %rbp
        ret
```

---

## Logical Instructions

### And, Or, and Xor

```asm
andl $0xf, %eax      # eax = eax & 0xf
orl  $0xf, %eax      # eax = eax | 0xf
xorl %eax, %eax      # eax = eax ^ eax
```

### 1's Complement and 2's Complement

```asm
notq %rax             # rax = ~ rax  (1's complement)
negq %rax             # rax = - rax  (2's complement)
```

### C to Assembly Example (Logical)

```c
void logical(int x, int y) {
    int a;
    a = x & y;
    a = x | y;
    a = ~x;
}
```

```asm
logical:
        pushq   %rbp
        movq    %rsp, %rbp
        movl    %edi, -20(%rbp)         # x, x
        movl    %esi, -24(%rbp)         # y, y

    # a = x & y;
        movl    -20(%rbp), %eax         # x, tmp85
        andl    -24(%rbp), %eax         # y, tmp84
        movl    %eax, -4(%rbp)          # tmp84, a

    # a = x | y;
        movl    -20(%rbp), %eax         # x, tmp89
        orl     -24(%rbp), %eax         # y, tmp88
        movl    %eax, -4(%rbp)          # tmp88, a

    # a = ~x;
        movl    -20(%rbp), %eax         # x, tmp93
        notl    %eax                    # tmp92
        movl    %eax, -4(%rbp)          # tmp92, a

    # }
        nop
        popq    %rbp
        ret
```

---

## Flags

### Flags Register

The flags register represents the current state of the CPU and contains condition codes after arithmetic or logical operations.

| Flag | Name | Description |
|------|------|-------------|
| ZF | Zero Flag | Set if the result is 0 |
| SF | Sign Flag | Set if the MSB of the result is 1 |
| OF | Overflow Flag | Set when overflow occurred (e.g. 8 + 8 → 16 in 4-bit). Change sign after adding the same signed numbers or subtracting oppositely signed numbers: P + P → N, N + N → P, P - N → N, N - P → P |

---

## Compare Instructions

### `cmp arg1, arg2`

Compare arg2 and arg1 using **subtraction** without updating arg2.

```asm
compq $2, %rax
# ZF = 1 iff %rax - 2 == 0
# SF = 1 iff MSB of %rax - 2 == 1
# OF = 1 iff overflow occurred
```

### `test arg1, arg2`

Compare arg2 and arg1 using **bitwise and** without updating arg2.

```asm
testq $5, %rax
# ZF = 1 iff %rax & 5 == 0
# SF = 1 iff MSB of %rax & 5 == 1
```

### C to Assembly Example (Compare)

```c
void comp(int x, int y) {
    int a;
    a = x == y;
    a = x != y;
    a = x >  y;
    a = x >= y;
    //a = x <  y;
    //a = x <= y;
}
```

```asm
comp:
        pushq   %rbp
        movq    %rsp, %rbp
        movl    %edi, -20(%rbp)         # x, x
        movl    %esi, -24(%rbp)         # y, y

    # a = x == y;
        movl    -20(%rbp), %eax         # x, tmp88
        cmpl    -24(%rbp), %eax         # y, tmp88
        sete    %al                     # copy Z flag to %al
        movzbl  %al, %eax              # move from byte to long
        movl    %eax, -4(%rbp)          # tmp89, a

    # a = x != y;
        movl    -20(%rbp), %eax         # x, tmp90
        cmpl    -24(%rbp), %eax         # y, tmp90
        setne   %al
        movzbl  %al, %eax
        movl    %eax, -4(%rbp)          # tmp91, a

    # a = x > y;
        movl    -20(%rbp), %eax         # x, tmp92
        cmpl    -24(%rbp), %eax         # y, tmp92
        setg    %al
        movzbl  %al, %eax
        movl    %eax, -4(%rbp)          # tmp93, a

    # a = x >= y;
        movl    -20(%rbp), %eax         # x, tmp94
        cmpl    -24(%rbp), %eax         # y, tmp94
        setge   %al
        movzbl  %al, %eax
        movl    %eax, -4(%rbp)          # tmp95, a

    # }
        nop
        popq    %rbp
        ret
```

---

## Branch Instructions

### CPU Instruction Cycle

CPU fetches the next instruction from `rip` (the instruction pointer register).

### Unconditional Jump

`JMP label` — Jump to label unconditionally. Equivalent to copying the address of label to the `rip` register.

```asm
jmp foo
# equivalent to
movq    foo, %rip
```

### Conditional Jump Instructions

| Instruction | Description |
|-------------|-------------|
| `JE`, `JZ` | Jump if equal (ZF == 1) |
| `JNE`, `JNZ` | Jump if not equal (ZF != 1) |
| `JG` (`JGE`) | Jump if greater than (or equal to) |
| `JL` (`JLE`) | Jump if less than (or equal to) |

```asm
jne label
# jump to label if ZF != 0

jg label
# jump to label if SF == OF and ZF == 0
#   - if overflow did not occur: SF == 0 and OF == 0
#   - if overflow did occur:     SF == 1 and OF == 1
```

### C to Assembly Example (if-else)

```c
int max(int x, int y) {
    int a;
    if(x > y)
        a = x;
    else
        a = y;
    return a;
}
```

```asm
max:
        pushq   %rbp
        movq    %rsp, %rbp
        movl    %edi, -20(%rbp)         # x, x
        movl    %esi, -24(%rbp)         # y, y

    # if(x > y)
        movl    -20(%rbp), %eax         # x, tmp84
        cmpl    -24(%rbp), %eax         # y, tmp84
        jle     .L5

    # a = x;
        movl    -20(%rbp), %eax         # x, tmp85
        movl    %eax, -4(%rbp)          # tmp85, a
        jmp     .L6

.L5:
    # a = y;
        movl    -24(%rbp), %eax         # y, tmp86
        movl    %eax, -4(%rbp)          # tmp86, a

.L6:
    # return a;
        movl    -4(%rbp), %eax          # a, _6

    # }
        popq    %rbp
        ret
```

### C to Assembly Example (for loop)

```c
int sum() {
    int i, s;
    s = 0;
    for(i = 0; i < 10; i++)
        s = s + i;
    return s;
}
```

```asm
sum:
        pushq   %rbp
        movq    %rsp, %rbp

    # s = 0;
        movl    $0, -8(%rbp)            #, s

    # for(i = 0; i < 10; i++)
        movl    $0, -4(%rbp)            #, i
        jmp     .L9

.L10:
    # s = s + i;
        movl    -4(%rbp), %eax          # i, tmp84
        addl    %eax, -8(%rbp)          # tmp84, s

    # for(i = 0; i < 10; i++)
        addl    $1, -4(%rbp)            #, i

.L9:
    # for(i = 0; i < 10; i++)
        cmpl    $9, -4(%rbp)            #, i
        jle     .L10

    # return s;
        movl    -8(%rbp), %eax          # s, _5

    # }
        popq    %rbp
        ret
```

---

## Call Instructions

### `call label`

Call the function with the label:
1. Push `rip` (address of the next instruction) to the stack
2. Jump to the function label

```asm
call foo
# equivalent to
pushq   %rip
movq    foo, %rip
```

### `ret`

Return from the function: Pop the next instruction address from the stack and store it at the `%rip` register.

```asm
ret
# equivalent to
popq    %rip
```

### `leave`

Deallocate memory for the callee and restore the caller's stack frame.

```asm
leave
# equivalent to
movq    %rbp, %rsp
popq    %rbp
```

### Function Prologue & Epilogue Pattern

```asm
main:
    pushq   %rbp            # Save the caller's stack frame
    movq    %rsp, %rbp      # New stack frame for callee
    subq    $16, %rsp       # Allocate mem for local vars
    ...
    leave                   # Deallocate mem & restore caller's stack frame
    ret
```

### C to Assembly Example (Function Call)

```c
int main() {
    int a;
    a = max(10, 20);
    return 0;
}
```

```asm
main:
        pushq   %rbp
        movq    %rsp, %rbp
        subq    $16, %rsp

    # a = max(10, 20);
        movl    $20, %esi
        movl    $10, %edi
        call    max
        movl    %eax, -4(%rbp)          # tmp84, a

    # return 0;
        movl    $0, %eax

    # }
        leave
        ret
```

---

## Compile with make

### Basic Makefile

Write a `Makefile` and run `make`. Use `make <target>` (e.g. `make cmplx.cmo`) to build a specific target.

```makefile
cmplx_app.exe: cmplx.cmi cmplx.cmo cmplx_app.cmo
	ocamlc -o cmplx_app.exe cmplx.cmo cmplx_app.cmo

cmplx.cmi: cmplx.mli
	ocamlc -c cmplx.mli

cmplx.cmo: cmplx.ml
	ocamlc -c cmplx.ml

cmplx_app.cmo: cmplx_app.ml
	ocamlc -c cmplx_app.ml
```

> **Note:** Use **tab characters**, not spaces, before the commands.

### Makefile with Suffix Rules

```makefile
TGT  = cmplx_app.exe
CMIS = cmplx.cmi
CMOS = cmplx.cmo cmplx_app.cmo

RM   = del   # rm in Linux, del in Windows
TRUE = cd .  # true in Linux, cd . in Windows

.SUFFIXES:                          # reset all suffixes
.SUFFIXES: .cmi .cmo .mli .ml      # suffixes to consider

.mli.cmi:; ocamlc -c $< -o $@      # how to convert .mli to .cmi
.ml.cmo:;  ocamlc -c $< -o $@      # $< : input file name,
                                    # $@ : target file name

$(TGT): $(CMIS) $(CMOS)
	ocamlc -o $@ $(CMOS)

clean:
	$(RM) *.cmi | $(TRUE)
	$(RM) *.cmo | $(TRUE)
```

---

## Assignment 3

### Overview

- Download `compiler_base.zip` and implement all **TODOs**
- To compile: `make` → generates `spl`
- `spl` should print out an assembly code for the given program

### Workflow

```bash
./spl test_gcd.txt                  # run the compiler
./spl test_gcd.txt > test_gcd.s     # save assembly output
gcc test_gcd.s                      # compile with gcc
./a.out                             # run the program
```

- **Due date:** TBD
- Upload the changed files to Brightspace in a single zip file

---

### Assignment 3 — Makefile

```makefile
TGT  = spl
HSRC = common.h expr.h expr_opr.h list.h parser.h refobj.h scanner.h
HSRC += stmt.h varstore.h
OBJS = app.o common.o list.o parser.o refobj.o scanner.o varstore.o
OBJS += expr_arith.o expr_comp.o expr_num.o expr_opr.o expr_var.o
OBJS += stmt_assignment.o stmt_compound.o stmt_if.o stmt_read.o
OBJS += stmt_while.o stmt_write.o
LIBS =   # libregex.a  #none for Linux, libregex.a for Windows

RM   = rm    # rm in Linux, del in Windows
TRUE = true  # true in Linux, cd . in Windows

.SUFFIXES:            # reset all suffixes
.SUFFIXES: .c .o      # suffixes to consider

# convert .c to .o
.c.o:; gcc -c $< -o $@

$(TGT): $(HSRC) $(OBJS)
	gcc -o $@ $(OBJS) $(LIBS)

clean:
	$(RM) *.o | $(TRUE)
	$(RM) *.s | $(TRUE)

test:
	./$(TGT) test_arith.txt > arith.s; gcc arith.s; echo "2\n3" | ./a.out
	./$(TGT) test_comp.txt  > comp.s;  gcc comp.s;  echo "2\n3" | ./a.out
	./$(TGT) test_gcd.txt   > gcd.s;   gcc gcd.s;   echo "9\n6" | ./a.out
	./$(TGT) test_sum.txt   > sum.s;   gcc sum.s;   echo "10"   | ./a.out
```

---

### Assignment 3 — SPL Language

#### Expression vs Statement

- **Expression**: Evaluates to a value. In SPL, the result is pushed on top of the stack.
  - Examples: `0`, `1`, `x`, `y`, `z`, `+`, `-`, `*`, `/`, `==`, `!=`, `>=`, `>`, …
- **Statement**: Actions or commands to make side effects.
  - Examples: Assignment, Read, Write, While, If…

```
{
    i := 0                  // orange terms are expressions
    s := 0                  // blue terms are statements
    while (i <= 10) {
        s := s + i
        i := i + 1
    }
    write s
}
```

---

### Assignment 3 — Syntax of SPL

#### Statements

```
program       -> stmt EOF

stmt          -> stmt_assignment
              |  stmt_read
              |  stmt_write
              |  stmt_compound
              |  stmt_if
              |  stmt_while

stmt_assignment -> ID := expr

stmt_read       -> READ ID

stmt_write      -> WRITE expr

stmt_compound   -> { stmt_list }

stmt_list       -> stmt
              |  stmt_list stmt

stmt_if         -> IF ( expr ) stmt ELSE stmt

stmt_while      -> WHILE ( expr ) stmt
```

#### Expressions

```
expr          -> expr_comp

expr_comp     -> expr_add
              |  expr_add EQ expr_add
              |  expr_add NE expr_add
              |  expr_add LE expr_add
              |  expr_add <  expr_add
              |  expr_add GE expr_add
              |  expr_add >  expr_add

expr_add      -> expr_mul
              |  expr_add + expr_mul
              |  expr_add – expr_mul

expr_mul      -> expr_factor
              |  expr_mul * expr_factor
              |  expr_mul / expr_factor

expr_factor   -> NUM
              |  ID
              |  ( expr )
```

---

### Assignment 3 — Translating Expressions

#### expr_num (Number Literal)

```c
typedef struct expr_num {
    refobj_t ref;
    void (*eval)(struct expr *self);
    void (*print)(struct expr *self);
    int n;                              // number
} expr_num_t;

static void eval_num(expr_t *self) {
    …
    // push the number to the stack
    printf("    pushq   $%d\n", expr->n);
}
```

#### expr_var (Variable)

```c
typedef struct expr_var {
    refobj_t ref;
    void (*eval)(struct expr *self);
    void (*print)(struct expr *self);
    char *id;                           // variable
} expr_var_t;

static void eval_var(expr_t *self) {
    …
    int inx = var_store_get(expr->id);  // get the index of the variable
    …
    printf("    movq    (VAR + %d)(%%rip), %%rax\n", inx*8);
    printf("    pushq   %%rax\n");
}
```

#### expr_opr (Operators)

```c
typedef struct expr_opr {
    refobj_t ref;
    void (*eval)(struct expr *self);
    void (*print)(struct expr *self);
    void (*fp_opr)();                   // operator function
    char *str_opr;                      // operator string
    struct expr *a;                     // operand 1
    struct expr *b;                     // operand 2
} expr_opr_t;
```

**Provided: `oper_add()`**

```c
static void oper_add() {
    printf("    popq    %%rbx\n");
    printf("    popq    %%rax\n");
    printf("    addq    %%rbx, %%rax\n");
    printf("    pushq   %%rax\n");
}
```

**TODOs:**

```c
static void oper_sub() {
    //TODO: implement this function
}
static void oper_mul() {
    //TODO: implement this function
}
static void oper_div() {
    //TODO: implement this function
    //use cqto to convert rax -> rdx:rax
}
```

#### Comparison Operators (TODOs)

```c
static void oper_eq() {
    //TODO: implement this function
    //hint: use cmpq, sete, ... and movzbq to get the result to rax
}
static void oper_ne() {
    //TODO: hint: use cmpq, setne, ... and movzbq
}
static void oper_ge() {
    //TODO: hint: use cmpq, setge, ... and movzbq
}
static void oper_gt() {
    //TODO: hint: use cmpq, setg, ... and movzbq
}
static void oper_le() {
    //TODO: hint: use cmpq, setle, ... and movzbq
}
static void oper_lt() {
    //TODO: hint: use cmpq, setl, ... and movzbq
}
```

---

### Assignment 3 — Translating Statements

#### stmt_write

```c
typedef struct stmt_write {
    refobj_t ref;
    void (*exec)(struct stmt *self);
    void (*print)(struct stmt *self);
    expr_t *expr;
} stmt_write_t;

static void exec_write(stmt_t *self) {
    …
    stmt_write_t *stmt = (stmt_write_t*) self;

    // evaluate expression
    stmt->expr->eval(stmt->expr);

    // print the result
    COMMENT("write ", stmt->expr->print(stmt->expr), "");
    printf("    popq    %%rsi\n");
    printf("    leaq    ANSW(%%rip), %%rdi\n");
    printf("    movl    $0, %%eax\n");
    printf("    call    printf\n");
}
```

#### stmt_read (TODO)

```c
typedef struct stmt_read {
    …
    char *id;
} stmt_read_t;

static void exec_read(stmt_t *self) {
    …
    stmt_read_t *stmt = (stmt_read_t*) self;
    int inx = var_store_set(stmt->id);

    COMMENT(strmsg("read %s", stmt->id), , "");

    // print the enter: message
    printf("    leaq    ENTR(%%rip), %%rdi\n");
    printf("    movl    $0, %%eax\n");
    printf("    call    printf\n");

    //TODO: load the ADDRESS of the variable to %rsi
    //hint: look at eval_var function of expr_var.c
    //note: we need to pass the address of the var to scanf not the value

    // read a number
    printf("    leaq    ENTR_FMT(%%rip), %%rdi\n");
    printf("    movl    $0, %%eax\n");
    printf("    call    scanf\n");
}
```

#### stmt_assignment (TODO)

```c
typedef struct stmt_assignment {
    refobj_t ref;
    void (*exec)(struct stmt *self);
    void (*print)(struct stmt *self);
    char *id;
    expr_t *rhs;
} stmt_assignment_t;

static void exec_assignment(stmt_t *self) {
    …
    stmt_assignment_t *stmt = (stmt_assignment_t*) self;
    int inx = var_store_set(stmt->id);

    //eval rhs
    //TODO: evaluate stmt->rhs
    //hint: use stmt->rhs->eval

    //assignment
    COMMENT(strmsg("%s := ", stmt->id), stmt->rhs->print(stmt->rhs), "");
    //TODO: copy the result of rhs to the variable
    //hint: look at eval_var function of expr_var.c
}
```

#### stmt_if (TODO)

```c
typedef struct stmt_if {
    … expr_t *cond;
    stmt_t *then_stmt;
    stmt_t *else_stmt;
} stmt_if_t;

static void exec_if(stmt_t *self) {
    …
    int label_else = label_new();
    int label_exit = label_new();

    //evaluate condition
    //TODO: evaluate stmt->cond (use stmt->cond->eval)

    //check the condition
    //TODO: jump to label_else if the evaluation result is 0
    //hint: use label_str function

    //execute then_stmt
    //TODO: execute stmt->then_stmt and jump to label_exit

    //execute else_stmt
    //TODO: print label_else and execute stmt->else_stmt

    //label_exit
    //TODO: print label_exit
}
```

#### stmt_while (TODO)

```c
typedef struct stmt_while {
    …
    expr_t *cond;
    stmt_t *loop_stmt;
} stmt_while_t;

static void exec_while(stmt_t *self) {
    …
    //evaluate condition
    //TODO: print label_test and evaluate stmt->cond

    //jump to label_exit if false
    //TODO: jump to label_exit if the evaluation result is 0

    //execute the body
    //TODO: execute stmt->loop_stmt

    //end the while loop
    //TODO: jump to label_test

    //TODO: print the label_exit
}
```

---

### Assignment 3 — Expected Output Example

#### Input: `sum.txt`

```
{
    i := 0
    s := 0
    while (i <= 10) {
        s := s + i
        i := i + 1
    }
    write s
}
```

#### Expected Output: `sum.s`

```asm
        .global main
        .text
main:
        pushq   %rbp

    # 0
        pushq   $0
    # i := 0
        popq    %rax
        movq    %rax, (VAR + 0)(%rip)

    # 0
        pushq   $0
    # s := 0
        popq    %rax
        movq    %rax, (VAR + 8)(%rip)

label_000:
    # i
        movq    (VAR + 0)(%rip), %rax
        pushq   %rax
    # 10
        pushq   $10
    # i <= 10
        popq    %rbx
        popq    %rax
        cmpq    %rbx, %rax
        setle   %al
        movzbq  %al, %rax
        pushq   %rax

    # while ( i <= 10 )
        popq    %rax
        cmpq    $0, %rax
        je      label_001

    # s
        movq    (VAR + 8)(%rip), %rax
        pushq   %rax
    # i
        movq    (VAR + 0)(%rip), %rax
        pushq   %rax
    # s + i
        popq    %rbx
        popq    %rax
        addq    %rbx, %rax
        pushq   %rax
    # s := s + i
        popq    %rax
        movq    %rax, (VAR + 8)(%rip)

    # i
        movq    (VAR + 0)(%rip), %rax
        pushq   %rax
    # 1
        pushq   $1
    # i + 1
        popq    %rbx
        popq    %rax
        addq    %rbx, %rax
        pushq   %rax
    # i := i + 1
        popq    %rax
        movq    %rax, (VAR + 0)(%rip)

        jmp     label_000

    # end while ( i <= 10 ) ...
label_001:

    # s
        movq    (VAR + 8)(%rip), %rax
        pushq   %rax
    # write s
        popq    %rsi
        leaq    ANSW(%rip), %rdi
        movl    $0, %eax
        call    printf

        movq    $0, %rax

        popq    %rbp
        ret

        .section .rodata
ANSW:           .string "answer: %ld\n"
ENTR:           .string "enter: "
ENTR_FMT:       .string "%ld"

        .data
VAR:            .zero 16
```

#### Running Result

```bash
$ ./a.out
answer: 55
```
