# CSE320 System Fundamentals II

**YoungMin Kwon**

---

## 1. System Stack

### Abstraction Layers

컴퓨터 시스템은 여러 추상화 계층으로 구성된다:

| Layer | Description |
|-------|-------------|
| Application | 사용자 프로그램 |
| Algorithm | 알고리즘 |
| Programming Language | 프로그래밍 언어 |
| Assembly Language | 어셈블리 언어 |
| Machine Code | 기계어 |
| Instruction Set Architecture | 명령어 집합 구조 |
| Micro Architecture | 마이크로 아키텍처 |
| Gates/Registers | 게이트/레지스터 |
| Devices (Transistors) | 소자 (트랜지스터) |
| Physics | 물리 |

**시스템 구성 요소:**

- **Software:** Application programs → Libraries/utilities → Operating system
- **Interface:** Application programming interface (API) → Application binary interface (ABI) → Instruction set architecture (ISA)
- **Hardware:** Execution hardware, System interconnect (bus), Memory translation, I/O devices and networking, Main memory

---

## 2. C Programming Language

### C Program

```c
#include <stdio.h>
#define MSG(name) "Hello " name "\n"
int main()
{
    printf(MSG("YoungMin"));
    return 0;
}
```

### Compilation

C 프로그램의 컴파일 과정:

```
hello.c → [Preprocessor (cpp)] → hello.i → [Compiler (cc1)] → hello.s → [Assembler (as)] → hello.o → [Linker (ld)] → hello
 (Source)    (Modified source)       (Assembly)        (Relocatable object)     (Executable)
```

**각 단계별 gcc 명령어:**

```bash
gcc hello.c                # 전체 컴파일 (소스 → 실행파일)
gcc -E hello.c -o hello.i  # 전처리만 수행
gcc -S hello.i             # 어셈블리 코드 생성
gcc -c hello.s             # 오브젝트 파일 생성
gcc hello.o                # 링킹하여 실행파일 생성
```

### C Program Elements

- Variables (변수)
- Flow control (흐름 제어)
- Function calls (함수 호출)
- Structures (구조체)
- Pointers (포인터)
- Dynamic memory allocation (동적 메모리 할당)
- Run-time environment (런타임 환경)

**메모리 레이아웃 (높은 주소 → 낮은 주소):**

| Segment | Description |
|---------|-------------|
| Kernel memory | Memory invisible to user code |
| User stack | Created at run time (← `%esp` stack pointer) |
| ↓ (grows down) | |
| Memory-mapped region | Shared libraries |
| ↑ (grows up) | |
| Run-time heap | Created by `malloc` (← `brk`) |
| Read/write segment | `.data`, `.bss` |
| Read-only segment | `.init`, `.text`, `.rodata` |
| `0x08048000` | Program start address |
| `0` | |

---

## 3. x86 Assembly

### C to Assembly Example

**C 코드:**

```c
#include <stdio.h>
void foo(char* msg)
{
    int a = 100;
    printf("%s %d\n", msg, a);
}

int main(int argc, char** argv)
{
    foo("Hello World");
    return 0;
}
```

**x86 어셈블리:**

```asm
        .section    .rodata
.LC0:   .string     "%s %d\n"
.LC1:   .string     "Hello World"
        .text
        .globl      foo, main

foo:
        pushq   %rbp
        movq    %rsp, %rbp
        subq    $32, %rsp
        movq    %rdi, -24(%rbp)
        movl    $100, -4(%rbp)
        movl    -4(%rbp), %edx
        movq    -24(%rbp), %rax
        movq    %rax, %rsi
        movl    $.LC0, %edi
        movl    $0, %eax
        call    printf
        leave
        ret

main:
        pushq   %rbp
        movq    %rsp, %rbp
        subq    $16, %rsp
        movl    %edi, -4(%rbp)
        movq    %rsi, -16(%rbp)
        movl    $.LC1, %edi
        call    foo
        movl    $0, %eax
        leave
        ret
```

### SPL Compiler

- **SPL** = Simple Programming Language
- SPL 프로그램을 어셈블리 프로그램으로 변환

**SPL 프로그램 예시:**

```
//sum: SPL program
var a
fun sum(n) {
    i := 0
    s := 0
    while( i <= n ) {
        s := s + i
        i := i + 1
    }
    return s
}

fun main() {
    a := sum(10)
    write a
}
```

**변환된 어셈블리 (main 함수 부분):**

```asm
# fun main()
main:
        pushq   %rbp
        movq    %rsp, %rbp
        subq    $0, %rsp

        # 10
        pushq   $10

        # sum(10)
        call    sum
        addq    $8, %rsp
        push    %rax

        # a := sum(10)
        popq    %rax
        movq    %rax, (VAR + 0)(%rip)

        # a
        movq    (VAR + 0)(%rip), %rax
        pushq   %rax

        # write a
        call    write_fun
        addq    $8, %rsp

        # exit main
        leave
        ret
```

---

## 4. OS Services: System Calls

- User mode 코드는 리소스에 직접 접근할 수 없다
- OS에 요청하여 처리하도록 해야 한다
- 주요 시스템 콜: `read`, `write`, `fork`, `execv`, `_exit`, ...

**Context Switch 과정:**

```
Time →

Process A                    Process B
─────────────────────────────────────────
User code
  ↓ read (system call)
Kernel code ─────────────→  Context Switch
                             User code
  ↓ Disk interrupt                ↓
Kernel code ←────────────   Context Switch
  ↓ Return from read
User code
```

---

## 5. OS Services: Networks

- **Client-Server Model**
- **Socket programming**

**네트워크 구조:**

```
Internet client host              Internet server host
┌─────────────────┐              ┌─────────────────┐
│  Client          │ User code   │  Server          │
├─────────────────┤              ├─────────────────┤
│  TCP/IP          │ Kernel code │  TCP/IP          │  ← Sockets interface (system calls)
├─────────────────┤              ├─────────────────┤
│  Network adapter │ Hardware    │  Network adapter │  ← Hardware interface (interrupts)
└────────┬────────┘              └────────┬────────┘
         └──────── Global IP Internet ────┘
```

---

## 6. OS Services: Threads and Locks

두 프로세스가 동기화(coordination) 없이 동시에 출력하면 출력 내용이 뒤섞인다.

**웹 서버 스레드 모델:**

- Acceptor Threads → Connection Queue → Request Processing Threads (Thread Pool)

---

## 7. OS Internals: Memory

### Memory Hierarchy

| Level | Storage | Description |
|-------|---------|-------------|
| L0 | Registers | CPU registers hold words retrieved from cache memory |
| L1 | L1 cache (SRAM) | L1 cache holds cache lines retrieved from L2 cache |
| L2 | L2 cache (SRAM) | L2 cache holds cache lines retrieved from L3 cache |
| L3 | L3 cache (SRAM) | L3 cache holds cache lines retrieved from memory |
| L4 | Main memory (DRAM) | Main memory holds disk blocks retrieved from local disks |
| L5 | Local secondary storage | Local disks hold files retrieved from remote network servers |
| L6 | Remote secondary storage | Distributed file systems, Web servers |

- **위로 갈수록:** Smaller, faster, costlier (per byte)
- **아래로 갈수록:** Larger, slower, cheaper (per byte)

### Magic?

> "I bought a PC with 8GB of memory, but I got 100 processes running each with 4GB of memory."
>
> → Virtual Memory의 마법!

---

## 8. Memory Mapping & Linking

**컴파일 및 링킹 과정:**

```
hello.c → [Preprocessor (cpp)] → hello.i → [Compiler (cc1)] → hello.s → [Assembler (as)] → hello.o ─┐
                                                                                   printf.o ─┤
                                                                                              ↓
                                                                                    [Linker (ld)]
                                                                                         ↓
                                                                                       hello
                                                                               (Executable object program)
```

**다중 소스 파일 링킹:**

```
main.c                          swap.c          ← Source files
  ↓                               ↓
[Translators (cpp, cc1, as)]    [Translators (cpp, cc1, as)]
  ↓                               ↓
main.o                          swap.o          ← Relocatable object files
  └──────────┬──────────────────┘
             ↓
       [Linker (ld)]
             ↓
             p                                  ← Fully linked executable object file
```

---

## Questions?
