# CSE320 System Fundamentals II — Hello World

**YoungMin Kwon**  
**SUNY Korea**

---

## Some UNIX Commands

### Directory

- `ls`: list directory contents.  
  e.g. `ls –al`
- `mkdir`: make a directory.  
  e.g. `mkdir abc`
- `cd`: change directory.  
  e.g. `cd abc`, `cd ..`
- `rmdir`: remove a directory.  
  e.g. `rmdir abc`
- `pwd`: print working directory.  
  e.g. `pwd`

### File

- `cp`: copy files.  
  e.g. `cp * abc/`, `cp a.txt b.txt`
- `mv`: move files.  
  e.g. `mv abc/* bcd/*`, `mv a.txt b.txt`
- `cat`: print the contents of a file.  
  e.g. `cat a.txt`
- `grep`: looking for a pattern.  
  e.g. `grep hello *`

### man (manual page)

- Section number 2 is for **system calls**, 3 is for **library routines**
- `man 3 printf`
- `man 2 fork`
- `man sin`

---

## Hello.c

```c
// #include tells the compiler to copy the contents of
// the include file to this file.
// The line below will copy the contents of stdio.h to hello.i
//      try run  gcc -E hello.c -o hello.i
#include <stdio.h>

// #define creates a macro
#define HELLO "Hello world\n"

// main is the function that starts the program
int main() {
    // printf prints out the macro string to the screen
    printf(HELLO);

    // returning 0 from main indicates a normal completion.
    // returning non-zero means abnormal termination.
    return 0;
}
```

### exit_code.sh

```bash
#!/bin/bash
#
# exit_code.sh
#
if ./a.out
then
    echo Success
else
    echo Fail
fi
```

---

## Compiling Hello.c

- To compile hello.c:  
  `gcc hello.c`
  - It will make `a.out`.
  - To make `hello` instead of `a.out` run:  
    `gcc –o hello hello.c`

- To run a.out:  
  `./a.out`

- It will print out:  
  `Hello world`

### Compilation Pipeline

```
hello.c → [Pre-processor (cpp)] → hello.i → [Compiler (cc1)] → hello.s → [Assembler (as)] → hello.o → [Linker (ld)] → hello
Source      Modified source          Assembly              Relocatable object      Executable object
program     program (text)           program (text)        programs (binary)       program (binary)
(text)                                                          ↑
                                                            printf.o
```

- `gcc -E hello.c -o hello.i` — preprocessor only
- `gcc -S hello.i` — compile to assembly

---

## Values in C

In C, literal values are **numbers**:

- `'a'`: ASCII code **97**
- `20`: integer value 20
- `20L`: long value of 20
- `3.14`: double value of 3.14
- `3.14F`: floating point value of 3.14
- `"hello"`: the **address** of the string "hello"
- `main`: the **address** of the function main

---

## printf

```c
int main() {
    printf("char:       %c, %d\n", 'a', 'a');
    printf("int:        %c, %d\n", 97,  97);
    printf("hex number: %x\n", 97);
    printf("float:      %f\n", 3.14f);
    printf("double:     %lf\n", 3.14);
    printf("string:     %p, %s\n", "hello", "hello");
    printf("function:   %p\n", main);
}
```

**Output:**

```
char:       a, 97
int:        a, 97
hex number: 61
float:      3.140000
double:     3.140000
string:     0x5590f1808061, hello
function:   0x5590f1807139
```

---

## More on printf

### String Literals and Addresses

```c
// the value of string literals are their addresses
printf("string:    %ld, %s\n", (long)"hello", "hello");

// more about strings
printf("%p, %c, %c, %c, %c, %c\n", "hello", "hello"[0],
       "hello"[1], "hello"[2], "hello"[3], "hello"[4]);

char *str = "hello"; // str points to the address of "hello"
printf("%p, %c, %c, %c, %c, %c\n", str, str[0], str[1],
       str[2], str[3], str[4]);

long adr = (long)"hello"; // cast an address to long
printf("%ld, %c, %c, %c, %c, %c\n", adr, ((char*)adr)[0],
       ((char*)adr)[1], ((char*)adr)[2],
       ((char*)adr)[3], ((char*)adr)[4]);
```

**Output:**

```
string:    94836899717217, hello
0x5640efb82061, h, e, l, l, o
0x5640efb82061, h, e, l, l, o
94836899717217, h, e, l, l, o
```

### Function Pointers

```c
// function pointers
printf("main:   %p\n", main);
printf("printf: %ld\n", (long)printf);
```

**Output:**

```
main:   0x5640efb81139
printf: 139928006843920
```

### Memory Layout

```
┌─────────────────────────┐
│     Kernel memory       │
├─────────────────────────┤
│     User stack          │
│  (created at run time)  │
│          ↓              │
│                         │
│          ↑              │
│  Memory-mapped region   │
│  for shared libraries   │
│                         │
│          ↑              │
│    Run-time heap        │
│  (created by malloc)    │
├─────────────────────────┤
│  Read/write segment     │
│    (.data, .bss)        │
├─────────────────────────┤
│  Read-only segment      │
│ (.init, .text, .rodata) │
└─────────────────────────┘
```

---

## Constants

```c
// const.c
//
char str0[]          = "foo";  // array of readable/writable string
const char str1[]    = "foo";  // array of read only string
char *str2           = "foo";  // pointer to a read only string
const char *str3     = "foo";  // pointer to a read only string
char* const str4     = "foo";  // constant pointer to a read only string

int main() {
    //str0 = "bar";       // error: str0 is an array type (constant)
    str0[0] = 'F';

    //str1 = "bar";       // error: str1 is an array type (constant)
    //str1[0] = 'F';      // error: this "foo" is a read only string

    str2 = "bar";         // str2 can point to another string
    //str2[0] = 'F';      // segmentation fault: this "foo" is read only

    str3 = "bar";
    //str3[0] = 'F';      // error: this "foo" is a read only string

    //str4 = "bar";       // error: str4 is a constant pointer
    //str4[0] = 'F';      // segmentation fault: this "foo" is read only

    return 0;
}
```

### Assembly Output (`gcc –S const.c → const.s`)

```asm
    .data
str0:
    .string "foo"           # readable/writable → .data section

    .section    .rodata
str1:
    .string "foo"           # read only array → .rodata section
.LC0:
    .string "foo"           # string literal → .rodata section

    .section .data.rel.local,"aw"
str2:
    .quad   .LC0            # pointer (writable) → .data.rel.local
str3:
    .quad   .LC0            # pointer (writable) → .data.rel.local

    .section .data.rel.ro.local,"aw"
str4:
    .quad   .LC0            # constant pointer → .data.rel.ro.local

    .section    .rodata
.LC1:
    .string "bar"
    .text
main:
```

---

## C: Call by Value

### Parameter Passing Modes

- **Call by value**: values of the parameters are passed
- **Call by reference**: addresses of the parameters are passed
- **Call by name**: parameters are passed as literal substitution (lazy evaluation, e.g. lambda calculus)
- **Call by need**: call by name + memoization

### In C, to change the caller's variables from callee:

- Pass the **address** of the variables
- Callee needs to change the **content** of the address

---

## scanf: to read user's input

```c
#include <stdio.h>

int main() {
    // read a string
    char name[100];
    printf("Enter your name: ");
    scanf("%99s", name);       // name: address of the array
    printf("hello %s.\n", name);

    // read an integer number
    int num;
    printf("Enter a number: ");
    scanf("%d", &num);         // &num is the address of num
    printf("read %d.\n", num);

    return 0;
}
```

**Output:**

```
Enter your name: youngmin
hello youngmin.
Enter a number: 1
read 1.
```

---

## More about scanf

```c
#include <stdio.h>
#include <math.h>

int main() {
    // read a floating point number
    float fnum;
    printf("Enter a floating point number: ");
    scanf("%f", &fnum);
    printf("read %f.\n", fnum);
    printf("sin(%f) = %f.\n", fnum, sin(fnum));

    return 0;
}
```

### How to compile:

```
$ gcc scan.c
/tmp/ccNDavtQ.o:scan.c:function main: error: undefined reference to 'sin'
collect2: ld returned 1 exit status
```

`-lm` option will fix the error (link math library):

```
$ gcc scan.c -lm
```

**Output:**

```
Enter a floating point number: 0.21
read 0.210000.
sin(0.210000) = 0.208460.
```

---

## Arithmetic Operators

```c
#include <stdio.h>

int main() {
    int a = 0xff, b = 0x05, c = 0x50;
    printf("a: %5d, b: %5d, a + b: %5d\n", a, b, a + b);
    printf("a: %5d, b: %5d, a - b: %5d\n", a, b, a - b);
    printf("a: %5d, b: %5d, a * b: %5d\n", a, b, a * b);
    printf("a: %5d, b: %5d, a / b: %5d\n", a, b, a / b);
    printf("a: %5d, b: %5d, a %% b: %5d\n", a, b, a % b);
    return 0;
}
```

**Output:**

```
a:   255, b:     5, a + b:   260
a:   255, b:     5, a - b:   250
a:   255, b:     5, a * b:  1275
a:   255, b:     5, a / b:    51
a:   255, b:     5, a % b:     0
```

---

## Bitwise Operators

```c
printf("a: %5d, b: %5d, a & b: %5d\n", a, b, a & b);  // and
printf("c: %5d, b: %5d, c | b: %5d\n", c, b, c | b);  // or
printf("a: %5d, b: %5d, a ^ b: %5d\n", a, b, a ^ b);  // xor
```

**Output:**

```
a:   255, b:     5, a & b:     5
c:    80, b:     5, c | b:    85
a:   255, b:     5, a ^ b:   250
```

### One's Complement vs Two's Complement

```c
printf("b: %5d, ~b: %5d (%x)\n", b, ~b, ~b);           // one's complement
printf("-1: %x, -2: %x, -3: %x\n", -1, -2, -3);        // two's complement
```

**Output:**

```
b:     5, ~b:    -6 (fffffffa)
-1: ffffffff, -2: fffffffe, -3: fffffffd
```

### Shift Operators

```c
printf("b: %5d, b << 1: %5d\n", b, b << 1);  // shift left
printf("b: %5d, b >> 1: %5d\n", b, b >> 1);  // shift right
```

**Output:**

```
b:     5, b << 1:    10
b:     5, b >> 1:     2
```

---

## Flags and Masks

```c
#include <stdio.h>

// gender
#define MALE    (0)
#define FEMALE  (1)
#define SET_GENDER(data, gender)  ((data) | (gender) << 31)
#define GET_GENDER(data)          ((data) >> 31 & 1)

// role
#define STUDENT  (0)
#define STAFF    (1)
#define FACULTY  (2)
#define SET_ROLE(data, role)  ((data) | (role) << 29)
#define GET_ROLE(data)        ((data) >> 29 & 3)

// department
#define AMS  (0)
#define BS   (1)
#define CS   (2)
#define TSM  (3)
#define ECE  (4)
#define MEC  (5)
#define SET_DEPT(data, dept)  ((data) | (dept) << 26)
#define GET_DEPT(data)        ((data) >> 26 & 7)

// id (20bit, upper 6 bits are reserved)
#define SET_ID(data, id)  ((data) | (id))
#define GET_ID(data)      ((data) & 0xfffff)

int main() {
    char* str_gndr[] = {"male", "female"};
    char* str_role[] = {"student", "staff", "faculty"};
    char* str_dept[] = {"AMS", "BS", "CS", "TSM", "ECE", "MEC"};

    unsigned int a = 0;
    a = SET_GENDER(a, FEMALE);
    a = SET_ROLE(a, STUDENT);
    a = SET_DEPT(a, CS);
    a = SET_ID(a, 30);

    printf("gender:     %s\n", str_gndr[GET_GENDER(a)]);
    printf("role:       %s\n", str_role[GET_ROLE(a)]);
    printf("department: %s\n", str_dept[GET_DEPT(a)]);
    printf("id:         %d\n", GET_ID(a));
}
```

**Output:**

```
gender:     female
role:       student
department: CS
id:         30
```

---

## Logical Operators

### Comparison Operators

```c
printf("a: %5d, b: %5d, a == b: %5d\n", a, b, a == b);
printf("a: %5d, b: %5d, a != b: %5d\n", a, b, a != b);
printf("a: %5d, b: %5d, a >  b: %5d\n", a, b, a > b);
printf("a: %5d, b: %5d, a >= b: %5d\n", a, b, a >= b);
printf("a: %5d, b: %5d, a <  b: %5d\n", a, b, a < b);
printf("a: %5d, b: %5d, a <= b: %5d\n", a, b, a <= b);
```

**Output:**

```
a:   255, b:     5, a == b:     0
a:   255, b:     5, a != b:     1
a:   255, b:     5, a >  b:     1
a:   255, b:     5, a >= b:     1
a:   255, b:     5, a <  b:     0
a:   255, b:     5, a <= b:     0
```

### Logical AND, OR, NOT

```c
printf("a: %5d, b: %5d, a && b: %5d\n", a, b, a && b);
printf("a: %5d, b: %5d, a || b: %5d\n", a, b, a || b);
printf("a: %5d, !a: %4d, !!a: %5d\n", a, !a, !!a);
```

**Output:**

```
a:   255, b:     5, a && b:     1
a:   255, b:     5, a || b:     1
a:   255, !a:    0, !!a:        1
```

---

## Side Effects from a Compiler Optimization

### Short-Circuit Evaluation

```c
a > b && printf("a > b && print\n");
a < b && printf("a < b && print\n");
a > b || printf("a > b || print\n");
a < b || printf("a < b || print\n");
```

**Output:**

```
a > b && print
a < b || print
```

### GCD Using Short-Circuit Evaluation (Euclidean Algorithm)

```c
int gcd(int a, int b)
{
    return  a > b && gcd(a - b, b) ||
            a < b && gcd(b - a, a) ||
            printf("gcd: %d\n", a);
}
```

---

## Programming Assignment 1

Using this assignment, we will learn variable locations in the memory.

### Test Steps

1. Implement `str_data.c` and `str_test.c`
2. Generate `str_data.s`: `gcc –S str_data.c`
3. Compile: `gcc str_test.c str_data.s`
4. Try run `a.out` (it will fail)
5. Modify `str_data.s` so that the test passes
6. Upload modified `str_data.s` to Brightspace

**Due date:** TBD

### str_data.c

```c
// str_data.c
//  run gcc -S str_data.c to generate str_data.s
//
// readable/writable strings
char str0[] = "bcd";
char str1[] = "cde";
char str2[] = "abc";

// read only strings
char* const str3 = "efg";
char* const str4 = "fgh";
char* const str5 = "def";
```

### str_test.c

```c
// str_test.c
//
#include <stdio.h>

#define ON_FALSE_GOTO(expr, label) {            \
    if (!(expr)) {                              \
        printf("Error in %s at line %d\n",      \
               __FILE__, __LINE__);             \
        goto label;                             \
    }                                           \
}

extern char str0[], str1[], str2[];       // readable/writable strings
extern char *str3, *str4, *str5;          // read only strings

int main() {
    // test the contents of the readable/writable strings
    ON_FALSE_GOTO(str0[0]=='b' && str0[1]=='c' && str0[2]=='d', err);
    ON_FALSE_GOTO(str1[0]=='c' && str1[1]=='d' && str1[2]=='e', err);
    ON_FALSE_GOTO(str2[0]=='a' && str2[1]=='b' && str2[2]=='c', err);

    // test if str0, str1, and str2 are writable
    str0[0] = 'B';
    str1[0] = 'C';
    str2[0] = 'A';

    // test the order of str0, str1, and str2 addresses
    ON_FALSE_GOTO(str2 < str1, err);
    ON_FALSE_GOTO(str1 < str0, err);

    // test the contents of the read only strings
    ON_FALSE_GOTO(str3[0]=='e' && str3[1]=='f' && str3[2]=='g', err);
    ON_FALSE_GOTO(str4[0]=='f' && str4[1]=='g' && str4[2]=='h', err);
    ON_FALSE_GOTO(str5[0]=='d' && str5[1]=='e' && str5[2]=='f', err);

    // test the order of string literals
    ON_FALSE_GOTO("def" < "efg", err);
    ON_FALSE_GOTO("efg" < "fgh", err);

    // test the order of the string pointer addresses
    ON_FALSE_GOTO(&str5 < &str4, err);
    ON_FALSE_GOTO(&str4 < &str3, err);

    printf("Success!\n");
    return 0;

err:
    printf("Fail!\n");
    return 0;
}
```

### str_data.s (Original — needs modification)

```asm
## str_data.s
##    move the yellow-marked blocks
##    to pass the test
##
    .file   "str_data.c"
    .text
    .globl  str0
    .data
    .type   str0, @object
    .size   str0, 4
str0:
    .string "bcd"
    .globl  str1
    .type   str1, @object
    .size   str1, 4
str1:
    .string "cde"
    .globl  str2
    .type   str2, @object
    .size   str2, 4
str2:
    .string "abc"

    .globl  str3
    .section    .rodata
.LC0:
    .string "efg"
    .section    .data.rel.ro.local,"aw"
    .align 8
    .type   str3, @object
    .size   str3, 8
str3:
    .quad   .LC0

    .globl  str4
    .section    .rodata
.LC1:
    .string "fgh"
    .section    .data.rel.ro.local
    .align 8
    .type   str4, @object
    .size   str4, 8
str4:
    .quad   .LC1

    .globl  str5
    .section    .rodata
.LC2:
    .string "def"
    .section    .data.rel.ro.local
    .align 8
    .type   str5, @object
    .size   str5, 8
str5:
    .quad   .LC2
```

> **Task:** Rearrange the highlighted blocks in the assembly file so that the address ordering tests in `str_test.c` pass (i.e., `str2 < str1 < str0` for writable strings, `"def" < "efg" < "fgh"` for string literals, and `&str5 < &str4 < &str3` for pointer addresses).
