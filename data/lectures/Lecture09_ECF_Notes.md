# Exceptional Control Flow (ECF)
> CSE320 System Fundamentals II — Lecture 09 정리

---

## 1. Exceptional Control Flow란?

일반적인 프로그램 실행은 명령어를 순서대로 처리하는 **제어 흐름(Control Flow)** 을 따른다. 그런데 다음과 같은 상황에서는 이 흐름이 갑자기 바뀌는데, 이를 **Exceptional Control Flow(ECF)** 라고 한다.

| 유형 | 설명 |
|------|------|
| **Exception** | 인터럽트, 트랩, 폴트, 어보트 등 하드웨어/소프트웨어 이벤트 |
| **Context Switch** | OS가 현재 프로세스에서 다른 프로세스로 제어권을 이전 |
| **Signal** | 한 프로세스가 다른 프로세스에게 신호를 보냄 (다음 강의 주제) |

---

## 2. Exceptions (예외)

Exception이란 **프로세서의 상태 변화(이벤트)로 인해 제어 흐름이 바뀌는 것**이다.

- 이벤트 예시: 가상 메모리 페이지 폴트, 0으로 나누기, I/O 완료 등

Exception 처리 후 결과는 세 가지다.

- `I_curr`로 돌아간다 (현재 명령어 재실행)
- `I_next`로 돌아간다 (다음 명령어로 진행)
- 프로그램을 강제 종료한다

### Exception Handling 동작 과정

1. 이벤트 발생 시, 유저 모드에서 발생한 경우 **커널 모드로 전환**한다.
2. 리턴 주소(현재 또는 다음 명령어)와 `EFLAGS` 레지스터가 **커널 스택에 push**된다.
3. **Exception Table**에서 해당 번호의 핸들러를 찾아 실행한다.
4. 핸들러 처리가 끝나면 필요에 따라 **유저 모드로 복귀**한다.

#### Exception Table

- 시스템 부팅 시 OS가 초기화하는 점프 테이블
- 이벤트 번호 `k`가 발생하면 테이블의 `k`번째 핸들러로 분기

---

## 3. Exception의 4가지 종류

| 종류 | 원인 | 동기/비동기 | 리턴 동작 |
|------|------|------------|-----------|
| **Interrupt** | I/O 디바이스 신호 | 비동기 | 항상 다음 명령어로 |
| **Trap** | 의도적 예외 (시스템 콜) | 동기 | 항상 다음 명령어로 |
| **Fault** | 복구 가능한 에러 | 동기 | 현재 명령어로 돌아가거나 Abort |
| **Abort** | 복구 불가능한 에러 | 동기 | 프로그램 종료 |

### 각 종류 설명

**Interrupt**
- I/O 핀이 현재 명령어 실행 중에 high가 됨 → 현재 명령어 완료 후 핸들러 실행 → 다음 명령어로 복귀

**Trap**
- 애플리케이션이 `syscall` 명령어를 실행해서 의도적으로 발생 → 핸들러 실행 → `syscall` 다음 명령어로 복귀

**Fault**
- 현재 명령어에서 에러가 발생 → 핸들러가 에러를 복구하면 현재 명령어 재실행, 실패하면 Abort

**Abort**
- 하드웨어 치명적 에러 (예: 메모리 ECC 오류) → 핸들러 실행 후 abort 루틴으로 이동

---

## 4. System Call

유저 프로그램은 직접 하드웨어를 건드릴 수 없다. 대신 **시스템 콜(System Call)** 을 통해 커널에 요청한다.

### 하드웨어/소프트웨어 구조

```
Application programs
    ↓ API (symbol → address)
Libraries / utilities
    ↓ ABI (syscall # → %rax)
Operating System
    ↓ ISA (Instruction Set Architecture)
Execution Hardware
```

### syscall 규약 (x86-64)

- `syscall` 번호는 **`%rax`** 레지스터에 저장
- 인자는 최대 6개: `%rdi`, `%rsi`, `%rdx`, `%r10`, `%r8`, `%r9`
- 반환값은 **`%rax`**에 저장되며, `%rcx`와 `%r11`은 파괴됨

### 주요 syscall 번호 (Linux x86-64)

| 번호 | 이름 | 설명 |
|------|------|------|
| 0 | `read` | 파일 읽기 |
| 1 | `write` | 파일 쓰기 |
| 2 | `open` | 파일 열기 |
| 3 | `close` | 파일 닫기 |
| 39 | `getpid` | 프로세스 ID 획득 |
| 57 | `fork` | 프로세스 생성 |
| 59 | `execve` | 프로그램 실행 |
| 60 | `_exit` | 프로세스 종료 |
| 61 | `wait4` | 자식 프로세스 대기 |
| 62 | `kill` | 프로세스에 시그널 전송 |

### System Call 예제

```c
#include <unistd.h>
int main() {
    write(1, "hello, world\n", 13);  // fd=1 이 stdout
    _exit(0);
}
```

어셈블리 수준에서는 이렇게 동작한다:

```asm
movl $13, %edx       # 3번째 인자: 길이
leaq .LC0(%rip), %rsi # 2번째 인자: 문자열 주소
movl $1, %edi         # 1번째 인자: stdout fd
movq $1, %rax         # write syscall = 1
syscall

movl $0, %edi         # 1번째 인자: status
movq $60, %rax        # _exit syscall = 60
syscall
```

---

## 5. Processes (프로세스)

**Process**는 실행 중인 프로그램의 인스턴스다. 모든 프로그램은 프로세스의 **컨텍스트(context)** 위에서 실행된다.

컨텍스트에 포함되는 것들:
- 프로그램 코드
- 메모리의 데이터, 스택, 레지스터
- 열려 있는 파일 디스크립터

### Private Address Space (사설 주소 공간)

각 프로세스는 고유한 **가상 주소 공간**을 가진다. 주소 공간의 구조는 모든 프로세스에서 동일하게 배치된다:

```
[ 커널 가상 메모리 ]  ← 유저 코드에서 접근 불가
[ 유저 스택        ]  ← 런타임에 생성 (%rsp가 이 위치)
[ 공유 라이브러리  ]  ← mmap 영역
[ 런타임 힙        ]  ← malloc()으로 생성
[ .data / .bss     ]  ← 읽기/쓰기 세그먼트
[ .text / .rodata  ]  ← 읽기 전용 (실행 파일에서 로드)
```

---

## 6. Logical Control Flow & Concurrent Flows

프로세스는 CPU를 독점하는 것처럼 **환상(illusion)** 을 제공한다. 실제로는 여러 프로세스가 번갈아 실행되지만, 각 프로세스는 자신만의 논리적 흐름(Logical Control Flow)이 있는 것처럼 동작한다.

### Concurrent Flow (동시 흐름)

두 흐름의 실행 시간이 **겹치면** 동시에 실행된다고 한다.

- 프로세스 A와 B가 동시 실행 중 → **Concurrent**
- 프로세스 A와 C가 동시 실행 중 → **Concurrent**
- B와 C는 겹치지 않음 → **Not concurrent**

### Parallel Flow (병렬 흐름)

두 흐름이 **서로 다른 CPU 코어나 컴퓨터**에서 동시에 실행되면 병렬(Parallel) 흐름이라고 한다.

---

## 7. Context Switches (컨텍스트 스위치)

커널은 각 프로세스의 **컨텍스트(context)** 를 유지하며, 이를 통해 프로세스 간 전환을 수행한다.

컨텍스트에 포함되는 것:
- 레지스터 전체
- PC (Program Counter, `%rip`)
- 유저 스택
- 커널 스택
- 커널 데이터 구조 (페이지 테이블, 프로세스 테이블, 파일 테이블)

### Context Switch 과정

1. 현재 프로세스의 컨텍스트를 **저장(save)**
2. 이전에 선점된 프로세스의 컨텍스트를 **복원(restore)**
3. 복원된 프로세스로 **제어권 이전**

> 커널의 스케줄러(Scheduler)가 다음 실행할 프로세스를 결정하고, `context_switch()`를 통해 전환한다.

---

## 8. User Mode vs Kernel Mode

프로세서는 **mode bit**로 현재 실행 모드를 구분한다.

| 구분 | Mode bit | 권한 |
|------|----------|------|
| **Kernel Mode** | SET (1) | 모든 명령어 실행 가능, 모든 메모리 접근 가능 |
| **User Mode** | NOT SET (0) | 특권 명령어 실행 불가 (halt, mode bit 변경, I/O), 커널 코드/데이터 접근 불가 |

커널의 일부 데이터 구조는 유저 모드에서도 읽을 수 있도록 노출된다:
- `/proc/cpuinfo`
- `/proc/<pid>/maps` — 프로세스의 가상 주소 공간 맵

---

## 9. Process Control API

### 프로세스 생성 및 관리

```c
pid_t getpid(void);          // 현재 프로세스 ID 반환
pid_t getppid(void);         // 부모 프로세스 ID 반환
pid_t fork(void);            // 자식 프로세스 생성
void exit(int status);       // 프로세스 종료
```

**`fork()`의 특징:**
- 부모 프로세스에서 호출하면 자식의 PID를 반환
- 자식 프로세스에서는 0을 반환
- 자식은 부모의 메모리, 파일 디스크립터를 그대로 복사

```c
pid_t pid = fork();
if (pid == 0)
    printf("나는 자식: pid=%d, ppid=%d\n", getpid(), getppid());
else
    printf("나는 부모: pid=%d, child=%d\n", getpid(), pid);
```

### Zombie Process & Reaping

프로세스가 종료되어도 커널은 바로 제거하지 않는다. 부모가 **reap(수확)** 할 때까지 **좀비 프로세스(zombie)** 상태로 남아 있다.

```c
// 특정 자식 프로세스를 기다림
pid_t waitpid(pid_t pid, int *statusp, int options);

// 임의의 자식 프로세스를 기다림
pid_t wait(int *statusp);
```

### 프로세스 실행

```c
// 현재 프로세스 컨텍스트에서 새 프로그램을 로드/실행
int execve(const char *filename, const char *argv[], const char *envp[]);
```

`execve`는 **돌아오지 않는다** — 성공하면 프로세스 이미지 자체가 교체된다.

### 프로세스 대기

```c
unsigned int sleep(unsigned int sec); // sec초 동안 대기 (또는 시그널 수신 시 깨어남)
int pause(void);                       // 시그널 수신 전까지 대기
```

---

## 10. Process State (프로세스 상태)

프로세스는 다음 상태들 사이를 전이한다:

```
fork() 호출
    ↓
TASK_RUNNING (ready) ──스케줄러 선택──→ TASK_RUNNING (running)
    ↑                                        ↓             ↓
    │ 이벤트 발생해서 깨어남              선점됨        do_exit() 호출
    │                                        │             ↓
TASK_INTERRUPTIBLE / TASK_UNINTERRUPTIBLE ←──┘      TASK_TERMINATED
(waiting: 특정 이벤트 대기)
```

---

## 11. Programming Assignment 7 — Shell 구현

이 과제에서는 **리다이렉션(redirection)** 과 **파이프(pipe)** 를 지원하는 쉘 프로그램을 구현한다.

### 테스트 예시

```bash
cat < shell.c | wc
ls -al > a.txt ; cat < a.txt | wc
ps -a | wc & ps -a | wc    # 백그라운드 실행
ps -a | wc ; ps -a | wc    # 순차 실행
```

### 핵심 구조

명령어 라인은 다음과 같이 파싱된다:

```
ls -al > a.txt ; cat < a.txt | wc
└─── command group ───┘ └── command group ──┘
└──────────────── command line ──────────────┘
```

### 주요 구현 포인트

**`execute_cmd()` — 명령어 실행**
- `fork()`로 자식 프로세스 생성
- 자식: `fdin`/`fdout`이 설정되어 있으면 `dup2()`로 stdin/stdout에 연결 후 `execvp()` 실행
- 부모: `fdin`/`fdout` 닫기, 자식 PID 저장

**`set_pipe()` — 파이프 연결**
- `pipe(fd_pipe)`로 파이프 생성
- 이전 명령의 `fdout` = `fd_pipe[1]` (쓰기 쪽)
- 다음 명령의 `fdin` = `fd_pipe[0]` (읽기 쪽)

**`set_redir_out()` — 출력 리다이렉션**
- `open(fname, O_WRONLY|O_CREAT|O_TRUNC, mode)`으로 파일 열기
- 명령의 `fdout`에 해당 fd 설정

**`set_redir_in()` — 입력 리다이렉션**
- `open(fname, O_RDONLY)`으로 파일 열기
- 명령의 `fdin`에 해당 fd 설정

**백그라운드 프로세스 처리**
- `bg_proc == true`이면 자식을 기다리지 않고 PID만 출력
- 루프마다 `waitpid(-1, &status, WNOHANG)`으로 종료된 백그라운드 프로세스를 수확

---

## 요약

| 개념             | 핵심 포인트                            |
| -------------- | --------------------------------- |
| ECF            | 하드웨어/OS 수준의 제어 흐름 변경 메커니즘         |
| Exception      | Interrupt/Trap/Fault/Abort 4종류    |
| System Call    | Trap을 이용한 커널 서비스 요청, `%rax`에 번호   |
| Process        | 실행 중인 프로그램 인스턴스, 독립된 주소 공간        |
| Context Switch | 프로세스 전환 시 현재 상태 저장 후 복원           |
| fork/exec      | 새 프로세스 생성(fork) + 새 프로그램 실행(exec) |
| Zombie         | 종료됐지만 부모가 reap하지 않은 프로세스          |
