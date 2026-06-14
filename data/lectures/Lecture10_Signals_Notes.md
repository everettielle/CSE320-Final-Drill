# Signals: Software Generated Interrupts
> CSE320 System Fundamentals II — Lecture 10 정리

---

## 1. Signal이란?

Signal은 **소프트웨어로 생성되는 인터럽트**로, 프로세스에게 특정 이벤트가 발생했음을 알리는 작은 메시지다. Signal handler를 통해 이 메시지를 처리할 수 있다.

저수준 하드웨어 예외(exception)는 커널의 exception handler가 처리하고, 그 결과로 프로세스에 시그널이 전달되기도 한다.

### 주요 시그널 종류

| 시그널 | 설명 |
|--------|------|
| `SIGFPE` | 0으로 나누기 (division by zero) |
| `SIGALRM` | 등록한 타이머 시간 경과 |
| `SIGKILL` | 프로세스 강제 종료 |
| `SIGSEGV` | 잘못된 메모리 참조 |
| `SIGINT` | Ctrl-C 입력 |
| `SIGCHLD` | 자식 프로세스의 중지/종료 |
| `SIGUSR1`, `SIGUSR2` | 사용자 정의 시그널 |

---

## 2. Signal 전송 (Sending Signals)

커널이 프로세스의 **상태(state)를 업데이트**하는 방식으로 시그널을 전달한다. 시스템 이벤트 또는 `kill` 함수에 의해 발생한다.

### Process Group

각 프로세스는 하나의 **프로세스 그룹**에 속한다.

```c
pid_t getpgid(pid_t pid);            // 프로세스 그룹 ID 반환
int   setpgid(pid_t pid, pid_t pgid); // 프로세스 그룹 ID 설정
```

### kill 명령어로 시그널 전송

```bash
$ kill -9 20     # PID 20인 프로세스에 SIGKILL(9) 전송
$ kill -9 -20    # 프로세스 그룹 20의 모든 프로세스에 SIGKILL 전송
```

### kill() 함수와 alarm() 함수

```c
int kill(pid_t pid, int sig);
unsigned int alarm(unsigned int sec);
```

**`kill()` 동작:**
- `pid > 0`: 해당 PID 프로세스에 시그널 전송
- `pid = 0`: 호출자와 같은 프로세스 그룹의 모든 프로세스에 전송
- `pid < 0`: 프로세스 그룹 `|pid|`의 모든 프로세스에 전송

**`alarm()`:** 지정한 초(sec) 후에 자기 자신에게 `SIGALRM` 전송

### 시그널 전송 예제

```c
#include <stdio.h>
#include <signal.h>
#include <unistd.h>

int main() {
    pid_t pid = fork();
    if (pid == 0 /*child*/) {
        printf("before pause\n");
        pause();  // 시그널이 handled 된 후에야 리턴
        printf("after pause\n");
    } else /*parent*/ {
        sleep(1);
        printf("sending SIGCHLD to child\n");
        kill(pid, SIGCHLD);
    }
    return 0;
}
```

> **주의:** `pause()`는 시그널이 **received**가 아니라 **handled** 된 후에 리턴한다. 부모가 종료된 후 `ps -a`로 자식 프로세스 상태를 확인해볼 것.

---

## 3. Signal 수신 (Receiving Signals)

커널이 **커널 모드에서 유저 모드로 전환**할 때, 블록되지 않은 pending 시그널이 있는지 확인한다.

```
확인 대상 = pending & ~blocked
```

이 집합이 비어있지 않으면 커널은 프로세스가 해당 시그널을 수신하도록 강제한다. 시그널 처리(action)가 완료되면 다음 명령어(`I_next`)로 제어가 돌아간다.

### Default Actions (기본 동작)

시그널 수신 시 기본적으로 수행되는 동작은 네 가지다:

- 프로세스 종료 (Terminate)
- 프로세스 종료 + 코어 덤프 (Terminate and dump core)
- SIGCONT 시그널이 올 때까지 일시 중지 (Stop/Suspend)
- 시그널 무시 (Ignore)

### signal() 함수로 동작 변경

```c
typedef void (*sighandler_t)(int);
sighandler_t signal(int signum, sighandler_t handler);
```

- `handler`가 사용자 정의 함수: 해당 함수가 시그널 핸들러로 등록
- `handler`가 `SIG_IGN`: 시그널 무시
- `handler`가 `SIG_DFL`: 기본 동작으로 복원

### SIGINT 핸들러 예제

```c
// sigint.c
#include "common.h"
#include <signal.h>
#include <unistd.h>

void handler(int sig) {
    prnmsg("Caught SIGINT!\n");
}

int main() {
    ON_FALSE_EXIT(signal(SIGINT, handler) != SIG_ERR, "signal");
    printf("before pause\n");
    pause();
    printf("after pause\n");
    return 0;
}
```

### SIGFPE 핸들러 예제

```c
// sigfpe.c
void handler(int sig) {
    prnmsg("Caught division by zero!\n");
    _exit(1);
}

int main() {
    int zero = 0;
    ON_FALSE_EXIT(signal(SIGFPE, handler) != SIG_ERR, "signal");
    printf("%d\n", 1 / zero);
    return 0;
}
```

### 시그널 핸들러에서 안전한 출력 (prnmsg)

시그널 핸들러 안에서는 `printf`, `strlen` 등이 **안전하지 않다**. 대신 `write` 시스템 콜을 직접 사용하는 `prnmsg`를 사용한다:

```c
// common.c
static int msglen(char *msg) {
    int i = 0;
    while (msg[i]) i++;
    return i;
}

int prnmsg(char *msg) {
    write(1, msg, msglen(msg));
}
```

---

## 4. Blocking and Unblocking Signals (시그널 블로킹)

애플리케이션이 `sigprocmask`를 사용해서 특정 시그널을 명시적으로 **블로킹/언블로킹**할 수 있다.

```c
int sigprocmask(int how, const sigset_t *set, sigset_t *oldset);
```

**`how` 파라미터:**
- `SIG_BLOCK`: `set`에 있는 시그널을 blocked 집합에 **추가**
- `SIG_UNBLOCK`: `set`에 있는 시그널을 blocked 집합에서 **제거**
- `SIG_SETMASK`: blocked 집합을 `set`과 **동일하게** 설정

**`oldset`:** NULL이 아니면 이전의 blocked 집합이 여기에 저장됨

### 시그널 집합(sigset_t) 헬퍼 함수들

```c
int sigemptyset(sigset_t *set);                      // 빈 집합으로 초기화
int sigfillset(sigset_t *set);                       // 모든 시그널을 포함하는 집합
int sigaddset(sigset_t *set, int signum);            // 시그널 추가
int sigdelset(sigset_t *set, int signum);            // 시그널 제거
int sigismember(const sigset_t *set, int signum);    // 멤버 여부 확인
```

### 블로킹 예제

```c
// mask.c
void handler(int sig) {
    prnmsg("Caught SIGINT!\n");
}

int main() {
    ON_FALSE_EXIT(signal(SIGINT, handler) != SIG_ERR, "signal");

    sigset_t mask, oldmask;
    sigemptyset(&mask);                          // mask = {}
    sigaddset(&mask, SIGINT);                    // mask = { SIGINT }
    sigprocmask(SIG_BLOCK, &mask, &oldmask);     // SIGINT 블로킹

    printf("before sleep\n");
    sleep(3);                                     // 이 동안 Ctrl-C를 눌러도 핸들러 실행 안 됨
    printf("after sleep\n");

    sigprocmask(SIG_SETMASK, &oldmask, NULL);    // 블로킹 해제 → 여기서 핸들러 실행
    return 0;
}
```

> SIGINT를 블로킹한 상태에서 Ctrl-C를 누르면, 시그널은 **pending** 상태로 남아있다가 언블로킹되는 순간에 전달된다.

---

## 5. Safe Signal Handling (안전한 시그널 핸들링)

### 핵심 규칙들

**1. 핸들러는 최대한 단순하게**
- 핸들러에서는 글로벌 플래그만 설정하고, 메인 프로그램이 주기적으로 플래그를 확인하는 방식이 좋다.

**2. async-signal-safe 함수만 호출**
- **안전하지 않음:** `printf`, `sprintf`, `malloc`, `exit`
- **안전함:** `write`, `_exit`

**3. errno 저장/복원**
- 핸들러 진입 시 `errno`를 로컬 변수에 저장하고, 리턴 전에 복원해야 한다.

**4. 공유 전역 데이터 보호**
- 데이터 접근 중에 시그널을 임시로 블로킹한다.

**5. volatile 키워드 사용**

```c
volatile int g;
```

- 컴파일러 최적화가 변수를 레지스터에 캐시해서 메모리에서 다시 읽지 않을 수 있다.
- `volatile`이 없으면 핸들러에서의 업데이트가 무시될 수 있다.

**6. sig_atomic_t로 플래그 선언**

```c
sig_atomic_t flag;
```

- 읽기와 쓰기가 **원자적(atomic)** 으로 보장된다 (인터럽트 불가).

---

## 6. Correct Signal Handling: Signals are Not Queued

시그널은 **큐에 쌓이지 않는다.** 같은 종류의 시그널이 여러 번 pending 상태가 되어도, 하나만 기록된다.

### 잘못된 핸들러 (자식 하나만 reap)

```c
void handler(int sig) {
    int olderrno = errno;
    ON_FALSE_GOTO(waitpid(-1, NULL, 0) >= 0, done, "waitpid");
    prnmsg("Reaped a child\n");
    sleep(1);
done:
    errno = olderrno;
}
```

> 10개의 자식을 fork해도, SIGCHLD가 큐에 안 쌓이므로 핸들러 호출 한 번에 **하나의 자식만** reap된다. 나머지는 좀비로 남을 수 있다.

### 올바른 핸들러 (while 루프로 모든 자식 reap)

```c
void handler(int sig) {
    int olderrno = errno;
    while (waitpid(-1, NULL, 0) > 0)
        prnmsg("Reaped a child\n");
    sleep(1);
done:
    errno = olderrno;
}
```

> `while` 루프로 `waitpid`를 반복 호출해서, 한 번의 핸들러 실행에서 종료된 **모든 자식**을 reap한다.

---

## 7. Synchronizing Flows (흐름 동기화)

### 문제 상황

자식 프로세스의 PID를 큐에 추가하고, 자식이 종료되면 큐에서 제거하는 시나리오에서, **자식이 큐에 추가되기 전에 먼저 종료**되면 `delete_from_queue`가 존재하지 않는 항목을 삭제하려고 해서 문제가 생긴다.

### 버그가 있는 코드

```c
signal(SIGCHLD, handler);
while (1) {
    if ((pid = fork()) == 0)
        execve(argv[0], argv, NULL);

    // fork 이후에 블로킹 → 이미 자식이 종료되었을 수 있음!
    sigprocmask(SIG_BLOCK, &mask, &prev);
    add_to_queue(pid);
    sigprocmask(SIG_SETMASK, &prev, NULL);
}
```

### 올바른 코드 (fork 전에 블로킹)

```c
signal(SIGCHLD, handler);
while (1) {
    // fork 전에 모든 시그널 블로킹
    sigprocmask(SIG_BLOCK, &mask, &prev);

    if ((pid = fork()) == 0) {
        // 자식: 시그널 언블로킹 후 실행
        sigprocmask(SIG_SETMASK, &prev, NULL);
        execve(argv[0], argv, NULL);
    }

    // 부모: 큐에 추가 후 언블로킹
    add_to_queue(pid);
    sigprocmask(SIG_SETMASK, &prev, NULL);
}
```

> **핵심:** `fork()` 전에 시그널을 블로킹하면, `add_to_queue`가 완료될 때까지 SIGCHLD 핸들러가 실행되지 않으므로 레이스 컨디션을 방지할 수 있다.

---

## 8. Explicit Waiting for Signals (명시적 시그널 대기)

자식 프로세스가 종료될 때까지 기다리는 여러 방법이 있다.

### 방법 비교

```c
volatile sig_atomic_t pid;

void sigchld_handler(int sig) {
    int olderrno = errno;
    pid = waitpid(-1, NULL, 0);
    errno = olderrno;
}
```

| 방법 | 코드 | 문제점 |
|------|------|--------|
| Spin | `while(!pid) ;` | 동작하지만 CPU 낭비 |
| pause() | `while(!pid) pause();` | `!pid` 확인과 `pause()` 사이에 시그널이 올 수 있음 (레이스 컨디션) |
| sleep() | `while(!pid) sleep(1);` | 동작하지만 최대 1초 지연 |
| **sigsuspend()** | `while(!pid) sigsuspend(&prev);` | **올바르고 효율적** |

### sigsuspend — 올바른 대기 방법

```c
while (!pid)
    sigsuspend(&prev);
```

`sigsuspend(&prev)`는 다음 세 동작을 **원자적(atomic)** 으로 수행한다:

```c
// 이것과 동일하지만 원자적으로 실행됨
sigprocmask(SIG_SETMASK, &prev, &tmp);  // 임시로 시그널 언블로킹
pause();                                  // 시그널 대기
sigprocmask(SIG_SETMASK, &tmp, NULL);   // 원래 마스크 복원
```

> 시그널 언블로킹과 대기 사이에 틈이 없으므로 레이스 컨디션이 발생하지 않는다.

### 전체 예제

```c
int main() {
    char *argv[] = {"/usr/bin/cal", "-m", "12", NULL};
    sigset_t mask, prev;
    sigfillset(&mask);

    signal(SIGINT, sigint_handler);
    signal(SIGCHLD, sigchld_handler);

    while (1) {
        sigprocmask(SIG_BLOCK, &mask, &prev);

        if ((pid = fork()) == 0) {
            sigprocmask(SIG_SETMASK, &prev, NULL);
            execve(argv[0], argv, NULL);
        }

        pid = 0;
        while (!pid)
            sigsuspend(&prev);

        sigprocmask(SIG_SETMASK, &prev, NULL);
        printf("child pid: %d\n", pid);
    }
    return 0;
}
```

---

## 9. Programming Assignment 8 — TicTacToe (시그널 기반)

이 과제에서는 **두 프로세스 간 시그널을 이용한 TicTacToe 게임**을 구현한다.

### 구조 (3개의 프로세스)

```
         ┌────────── Game ──────────┐
         │  [Proxy]       [Proxy]   │
         └────┬───────────────┬─────┘
      SIGUSR1 ↕ board    board ↕ SIGUSR1
         [Player O]      [Player X]
```

**Actual Player (2개):**
- 파라미터로 마크(`O` 또는 `X`)를 받음
- stdin에서 보드를 읽고, 자기 마크를 놓은 후 stdout으로 출력

**Game (1개):**
- 두 actual player를 자식 프로세스로 로드
- proxy player를 통해 actual player와 통신
- proxy는 `pipe`로 생성한 fd를 플레이어의 stdin/stdout에 연결
- `SIGUSR1` 시그널로 게임과 플레이어 간 동기화

### Player 측 주요 TODO

**시그널 핸들러:**

```c
static volatile int my_turn = 0;
static void sig_handler(int sig) {
    // SIGUSR1이면 my_turn = 1로 설정
}
```

**play 함수에서:**

1. `sigemptyset` → `sigaddset(SIGUSR1)` → `sigprocmask(SIG_BLOCK)` 으로 SIGUSR1 블로킹
2. `signal(SIGUSR1, sig_handler)` 로 핸들러 등록
3. 게임 루프에서 `sigsuspend(&prev)` 로 턴 대기
4. stdin에서 보드 읽기 → 마크 놓기 → stdout으로 보드 쓰기

### Game 측 주요 TODO

**Proxy의 load (자식 프로세스에서 실행):**

```c
static void player_load(player_proxy_t *self) {
    // dup2로 fd[0] → stdin, fd[1] → stdout 연결
    // 불필요한 fd 닫기
    // execvp로 실제 플레이어 프로그램 실행
}
```

**Proxy의 end:**

```c
static void player_end(player_proxy_t *self) {
    // SIGKILL로 플레이어 종료
    // waitpid로 reap
    // fd 닫기, 메모리 해제
}
```

**Game의 play 함수에서:**

1. SIGUSR1 블로킹 + 핸들러 등록
2. proxy를 통해 보드 write → 플레이어에게 SIGUSR1 전송
3. `sigsuspend`로 플레이어가 마크를 놓을 때까지 대기
4. proxy를 통해 보드 read → 출력 → 턴 전환 → 반복

### 컴파일 및 실행

```bash
$ make
gcc common.c board_mgr.c game.c -o game
gcc common.c board_mgr.c player.c -o player

$ ./game ./player ./player
```

---

## 요약

| 개념 | 핵심 포인트 |
|------|------------|
| Signal | 프로세스에게 이벤트 발생을 알리는 소프트웨어 인터럽트 |
| Sending | `kill()` 함수 또는 커널 이벤트로 시그널 전송, 프로세스 그룹 단위 전송 가능 |
| Receiving | 커널→유저 모드 전환 시 `pending & ~blocked` 확인 후 핸들러 실행 |
| signal() | 시그널의 기본 동작을 사용자 정의 핸들러, `SIG_IGN`, `SIG_DFL`로 변경 |
| Blocking | `sigprocmask`로 특정 시그널 블로킹/언블로킹 |
| Safe Handling | async-signal-safe 함수만 사용, `volatile`, `sig_atomic_t`, errno 저장/복원 |
| Not Queued | 같은 시그널은 큐에 안 쌓임 → `while(waitpid(...) > 0)` 패턴 필수 |
| Synchronizing | `fork()` 전에 블로킹해서 레이스 컨디션 방지 |
| sigsuspend | 언블로킹 + 대기를 원자적으로 수행하여 안전한 시그널 대기 |
