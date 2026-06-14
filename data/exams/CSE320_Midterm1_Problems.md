# CSE320 System Fundamentals II — Midterm Exam 1

**Date:** 4/8/2026, 2:00pm – 3:20pm  
**Total:** 130 pt

---

## P1. [4 × 2pt] System Stack

This problem is about System stack.  
Choose your answers from: **ABI, API, ISA, POSIX**

1. What is the interface between hardware and software?
2. What is the interface between OS and Libraries?
3. What is the interface between Libraries and Applications?
4. What is the standard for the library functions that helps the code portability across operating systems?

---

## P2. [4 × 2pt] Compilation Tools

Find the tools for the following explanations.  
Choose your answers from: **assembler, compiler, linker, pre-processor**

```c
// hello.c
1. #include <stdio.h>
2. #define MSG "Hello World\n"
3. int main() {
4.     printf(MSG);
5. }
```

1. Which tool converts MSG in line 4 to the string "Hello World\n"?
2. Which tool converts hello.c to hello.s?
3. Which tool converts hello.s to hello.o?
4. Which tool converts the symbol printf to its address?
5. Which tool generates a.out (executable) from hello.o?

---

## P3. [8 × 2pt] C-Language Constant Expressions

Write the constant C-language expressions for the following:

1. Integer 20
2. Long integer 30
3. Short integer 40
4. Floating point number 3.14
5. Double precision number 3.14
6. Address of a string hello
7. Ascii code for the character Z
8. Address of a function `int foo(int a)`

---

## P4. [16 × 1pt + 7 × 1pt] Valid Statements

Decide whether the following statements are valid or not. Mark **O** if it is a valid statement; otherwise mark **X**.

```c
char str0[] = "foo";
const char str1[] = "foo";
char *str2 = "foo";
const char *str3 = "foo";
char* const str4 = "foo";
const char const str5[] = "foo";

int main() {
    char *str6 = "foo";
    char str7[] = "foo";

    str0 = "bar";        //1. ___
    str0[0] = 'a';       //2. ___
    str1 = "bar";        //3. ___
    str1[0] = 'a';       //4. ___
    str2 = "bar";        //5. ___
    str2[0] = 'a';       //6. ___
    str3 = "bar";        //7. ___
    str3[0] = 'a';       //8. ___
    str4 = "bar";        //9. ___
    str4[0] = 'a';       //10. ___
    str5 = "bar";        //11. ___
    str5[0] = 'a';       //12. ___
    str6 = "bar";        //13. ___
    str6[0] = 'a';       //14. ___
    str7 = "bar";        //15. ___
    str7[0] = 'a';       //16. ___
    return 0;
}
```

Below is an assembly code translated from the valid parts of the C code above. Write the labels in the blanks. When multiple labels are possible, write them one by one in the next blanks in the order they appear in the C code.

```asm
        .section    .rodata
.LC0:
        .string "foo"
.LC1:
        .string "bar"

# 1. ___________:
        .string "foo"

# 2. ___________:
        .string "foo"

# 3. ___________:
        .quad   .LC0

        .data

# 4. ___________:
        .string "foo"

# 5. ___________:
        .quad   .LC0

# 6. ___________:
        .quad   .LC0

        .text

# 7. ___________:
        pushq   %rbp
        movq    %rsp, %rbp
        subq    $32, %rsp
# ...
```

---

## P5. [23 × 1pt] Memory Sections

Find the areas in the maps file above to which the following address expressions are pointing.  
Choose your answers from: **heap, shared libraries, stack, .bss, .data, .rodata, .text**

```c
char a[100];
char b[100] = "hello";
const char c[100] = "hello";
char *d = "hello";
char* const e = "hello";
void foo(int f) {
    static int g = 10;
    static int h;
    char i[] = "hello";
    char *j  = "hello";
    char *k  = malloc(10);
    extern int printf(const char *fmt, ...);
    int (*l)(const char *fmt, ...) = printf;
}
```

| #   | Expression | Section |
| --- | ---------- | ------- |
| 1   | a          | ___     |
| 2   | b          | ___     |
| 3   | c          | ___     |
| 4   | d          | ___     |
| 5   | &d         | ___     |
| 6   | e          | ___     |
| 7   | &e         | ___     |
| 8   | foo        | ___     |
| 9   | &f         | ___     |
| 10  | &g         | ___     |
| 11  | &h         | ___     |
| 12  | i          | ___     |
| 13  | j          | ___     |
| 14  | k          | ___     |
| 15  | &k         | ___     |
| 16  | printf     | ___     |
| 17  | l          | ___     |
| 18  | &l         | ___     |

Below is a part of `/proc/pid/maps` file, captured while a.out was running. Find the section names for the mapped areas below.  
Choose your answers from: **heap, shared libraries, stack, .bss, .data, .rodata, .text**

```
$cat /proc/11059/maps
    start-adrs       end-adrs       perm offset   dev   inode file-name
a. 60f71065d000-60f71065f000  r-xp 00001000 00:43 28175 /.../a.out
b. 60f710660000-60f710661000  r--p 00003000 00:43 28175 /.../a.out
c. 60f710661000-60f710662000  rw-p 00004000 00:43 28175 /.../a.out
d. 60f710662000-60f710665000  rw-p 00000000 00:00 0
e. 60f74dbfc000-60f74dc1d000  rw-p 00000000 00:00 0     [heap]
f. 755ca5e00000-755ca5e28000  r--p 00000000 08:30 67095 /.../libc.so.6
g. 755ca5e28000-755ca5fbd000  r-xp 00028000 08:30 67095 /.../libc.so.6
h. 7ffc5ef4d000-7ffc5ef6e000  rw-p 00000000 00:00 0     [stack]
```

| # | Area | Section |
|---|------|---------|
| 1 | a | ___ |
| 2 | b | ___ |
| 3 | c | ___ |
| 4 | d | ___ |
| 5 | g | ___ |

---

## P6. [10 × 2pt] Postfix Expression Translator

Implement the blanks. `translate_postfix` function translates a postfix expression to an x86 assembly language. The numbers in the postfix expressions are all single digit numbers.

```c
void translate_postfix(char *expr) {
    for(int i=0; expr[i]; i++) {
        if('0' <= expr[i] && expr[i] <= '9') {
            // get the numeric value
            int n = ______________;  // blank 1

            // save the result to the stack
            printf(" ______________\n", n);  // blank 2
        }
        else if(expr[i] == '+' || expr[i] == '-' ||
                expr[i] == '*' || expr[i] == '/') {
            // load two operands from the stack to rax and rbx
            printf(" ______________\n");  // blank 3
            printf(" ______________\n");  // blank 4

            // perform the operation to store the result at rax
            if(expr[i] == '+') {
                printf(" ______________\n");  // blank 5
            }
            else if(expr[i] == '-') {
                printf(" ______________\n");  // blank 6
            }
            else if(expr[i] == '*') {
                printf(" ______________\n");  // blank 7  //ignore rdx
            }
            else if(expr[i] == '/') {
                printf(" ______________\n");  // blank 8  //update rdx
                printf(" ______________\n");  // blank 9
            }

            // save the result to the stack
            printf(" ______________\n");  // blank 10
        }
    }
}

int main() {
    translate_postfix("123+*4-5/");
}
```

---

## P7. [16 × 2pt] C Code and x86 Assembly Translation

Below are a C code and its translation to an x86 assembly.

**foo.c**
```c
 1  #include <stdio.h>
 2  int foo() {
 3      int i = 5;    //will be set to 0
 4      int s = 0;
 5      for(i = 0;    //for loop in 3 lines
 6          i < 10;
 7          i++) {
 8          s = s + i;
 9      }
10      printf("%d\n", s);
11      return s;
12  }
```

**foo.s**
```asm
 1          .section    .rodata
 2  .LC0:
 3          .string "%d\n"
 4          .text
 5          .globl  foo
 6  foo:
 7          pushq   %rbp
 8          movq    %rsp, %rbp
 9          subq    $16, %rsp
10          movl    $5, -8(%rbp)
11          movl    $0, -4(%rbp)
12          movl    $0, -8(%rbp)
13          jmp     .L2
14  .L3:
15          movl    -8(%rbp), %eax
16          addl    %eax, -4(%rbp)
17          addl    $1, -8(%rbp)
18  .L2:
19          cmpl    $9, -8(%rbp)
20          jle     .L3
21          movl    -4(%rbp), %eax
22          movl    %eax, %esi
23          leaq    .LC0(%rip), %rdi
24          movl    $0, %eax
25          call    printf@PLT
26          movl    -4(%rbp), %eax
27          movq    %rbp, %rsp
28          popq    %rbp
29          ret
```

1. Find the line number in foo.s that sets the callee's stack frame pointer:
2. Find the line number in foo.s that saves the caller's stack frame pointer:
3. Find the line number in foo.s that restores the caller's stack frame pointer:
4. Find the line number in foo.s that allocates the callee's stack frame:
5. Find the line number in foo.s that deallocates the callee's stack frame:
6. Find the line number in foo.s that prepares the return value of the callee:
7. Find the line number in foo.s that returns to the caller:
8. Find the line number in foo.c that corresponds to line 10 of foo.s:
9. Find the line number in foo.c that corresponds to line 11 of foo.s:
10. What is the name of the variable at address -8(%rbp)?
11. What is the name of the variable at address -4(%rbp)?
12. Find the line number in foo.c that corresponds to line 17 of foo.s:
13. Find the line number in foo.c that corresponds to line 15 ~ 16 of foo.s:
14. Find the line number in foo.c that corresponds to line 19 ~ 20 of foo.s:
15. Find the line number in foo.c that corresponds to line 21 ~ 25 of foo.s:
16. Find the line number in foo.c that corresponds to line 12 of foo.s:
