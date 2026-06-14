# Dynamic Memory Allocation
> CSE320 System Fundamentals II — Lecture 07 정리

---

## 1. 동적 메모리 할당이란?

프로그램이 실행 중에 필요한 메모리를 운영체제에게 요청하는 메커니즘이다. **Dynamic Memory Allocator**는 프로세스의 가상 메모리 중 **Heap** 영역을 관리한다.

- 커널은 각 프로세스마다 **`brk` 포인터**를 유지하며, 이 포인터가 현재 힙의 끝(top)을 가리킨다.
- 할당 방식은 두 가지로 나뉜다:
  - **Explicit Allocator**: 프로그래머가 직접 관리 (`malloc` / `free`)
  - **Implicit Allocator**: 런타임이 자동으로 관리 (Garbage Collector)

```
가상 메모리 레이아웃 (아래 → 위 방향):
┌──────────────────┐ ← 높은 주소
│    User Stack    │
│        ↓         │
│     (빈 공간)      │
│        ↑         │
│   Memory Mapped  │  (공유 라이브러리)
│        ↑         │
│       Heap       │  ← brk ptr (힙의 끝)
├──────────────────┤
│   .bss (미초기화)  │
│   .data (초기화)  │
│   .text (코드)    │
└──────────────────┘ ← 낮은 주소
```

---

## 2. 핵심 함수

| 함수 | 설명 |
|------|------|
| `void *malloc(size_t size)` | 최소 `size` 바이트를 할당하고 포인터 반환 |
| `void *calloc(size_t n, size_t size)` | `malloc`과 동일하지만, 메모리를 0으로 초기화 |
| `void free(void *ptr)` | 이전에 할당된 메모리를 해제 |
| `void *sbrk(intptr_t incr)` | `brk`를 `incr`만큼 늘리고, **이전 brk 값** 반환 |

> 💡 `sbrk`는 힙을 실제로 확장할 때 내부적으로 사용되는 시스템 콜이다.

---

## 3. Fragmentation (단편화)

메모리를 효율적으로 쓰지 못하는 현상을 **단편화**라고 한다.

### Internal Fragmentation (내부 단편화)
- 할당된 블록의 크기가 실제 사용량(payload)보다 클 때 발생
- 원인:
  - 최소 블록 크기 제약
  - **메모리 정렬(Alignment)** 을 위한 패딩

```
예시: int(2바이트)를 5개 요청 → 10바이트 필요
    → 정렬(4바이트) 때문에 12바이트 할당 → 2바이트 낭비
```

### External Fragmentation (외부 단편화)
- 전체 여유 메모리는 충분하지만, **연속된 하나의 블록**이 요청을 만족하지 못할 때 발생

```
예시: 4바이트 블록 두 개가 흩어져 있을 때
    → malloc(5) 요청은 총 8바이트가 있어도 실패!
```

---

## 4. 구현 핵심 이슈

메모리 할당기를 구현할 때 해결해야 할 4가지 핵심 문제:

| 이슈 | 핵심 질문 |
|------|----------|
| **Free Block Organization** | 빈 블록들을 어떻게 추적할 것인가? |
| **Placement** | 요청을 위해 어떤 빈 블록을 선택할 것인가? |
| **Splitting** | 빈 블록의 일부만 사용할 때, 나머지를 어떻게 처리할 것인가? |
| **Coalescing** | 방금 해제된 블록을 어떻게 처리할 것인가? |

---

## 5. Implicit Free List

모든 할당기는 블록 경계와 할당 여부를 파악하는 자료구조가 필요하다.

### 블록 헤더 구조

```
31                   3  2  1  0
┌────────────────────┬──┬──┬──┐
│     Block size     │  │  │ a│  ← Header (1 word)
└────────────────────┴──┴──┴──┘
                              └─ a=1: Allocated, a=0: Free

※ malloc은 헤더 바로 다음(payload의 시작)을 반환
※ Block size = header + payload + padding 전체 크기
```

### 힙 레이아웃

```
Start  [unused][8/1][8/1][hdr][payload][ftr]...[hdr][payload][ftr][0/1]
of heap  ↑ padding  ↑                                               ↑
       align    Prologue block                              Epilogue hdr
```

- **Prologue block**: 초기화 시 생성되는 8바이트짜리 할당된 블록 (header + footer)
- **Epilogue header**: 힙 끝을 나타내는 size=0, allocated=1 헤더
- 각 블록은 헤더의 size 필드를 통해 다음 블록으로 이동 가능

---

## 6. Placement Policy (배치 전략)

빈 블록 리스트에서 어떤 블록을 선택할지 결정하는 전략:

### First Fit
- 리스트의 **처음부터** 탐색해서 최초로 맞는 블록 선택
- 리스트 앞쪽에 작은 단편들이 쌓이고, 큰 블록들은 뒤쪽에 남는 경향

### Next Fit
- **직전 할당이 끝난 위치**부터 탐색
- 나머지 블록을 재사용할 가능성이 높음
- 하지만 메모리 utilization이 떨어질 수 있음

### Best Fit
- **가장 딱 맞는 크기**의 블록을 탐색
- 메모리 낭비가 가장 적음
- 단점: 힙 전체를 탐색해야 함 (느림)

---

## 7. Coalescing (병합)

### False Fragmentation 문제

```
[8/0][16/1][16/0][16/0][16/1][0/1]
              ↑       ↑
          각각 16바이트 → 둘 다 free지만 malloc(24) 실패!
```

인접한 두 빈 블록을 합쳐서 더 큰 블록으로 만드는 것이 **Coalescing**이다.

- **Immediate Coalescing**: `free()` 호출 즉시 인접 빈 블록 병합
- **Deferred Coalescing**: 나중에 (예: 할당 요청 실패 시) 일괄 병합

### Boundary Tags

헤더만 있을 경우 **이전 블록**과의 병합이 어렵다 (전체 리스트 탐색 필요).

**Boundary Tag** = 블록 끝에 추가하는 **Footer** (헤더와 동일한 내용)

```
┌──────────────────┐
│ Block size │ a/f │  ← Header
├──────────────────┤
│                  │
│     Payload      │
│                  │
├──────────────────┤
│  Padding(opt.)   │
├──────────────────┤
│ Block size │ a/f │  ← Footer (= Header의 복사본)
└──────────────────┘
```

Footer 덕분에 현재 블록에서 **이전 블록의 크기**를 바로 알 수 있다.

### Coalescing 4가지 케이스

| Case | prev | next | 결과 |
|------|------|------|------|
| 1 | allocated | allocated | 현재 블록만 free로 표시 |
| 2 | allocated | free | 현재 + next 병합 (크기: n+m2) |
| 3 | free | allocated | prev + 현재 병합 (크기: n+m1) |
| 4 | free | free | 세 블록 전부 병합 (크기: n+m1+m2) |

---

## 8. Explicit Free List

Implicit 방식의 단점: 모든 블록을 순회해야 함 (할당+빈 블록 모두).

**Explicit Free List**는 빈 블록 안에 **pred(이전)** / **succ(다음)** 포인터를 저장해 빈 블록끼리 직접 연결한다.

```
할당된 블록:                빈 블록:
┌─────────────┐            ┌─────────────┐
│  hdr (a/f)  │            │  hdr (a/f)  │
├─────────────┤            ├─────────────┤
│             │            │  pred ──────┼──→ 이전 빈 블록
│   Payload   │            ├─────────────┤
│             │            │  succ ──────┼──→ 다음 빈 블록
├─────────────┤            ├─────────────┤
│  Padding    │            │  Padding    │
├─────────────┤            ├─────────────┤
│  ftr (a/f)  │            │  ftr (a/f)  │
└─────────────┘            └─────────────┘
```

---

## 9. Garbage Collection

C와 달리 Java 등에서는 개발자가 `free()`를 호출하지 않아도 된다.

### 기본 개념

- **Garbage**: 프로그램에서 더 이상 도달할 수 없는(unreachable) 변수/메모리
- **Reachability Graph**: 변수를 노드로, 포인터를 엣지로 표현한 그래프
  - **Root node**: 힙 외부의 live 변수 (스택 변수, 전역 변수 등)
  - Root에서 경로가 있으면 **Reachable** → 살아있음
  - 경로가 없으면 **Unreachable (Garbage)** → 회수 대상

```c
void make_garbage() {
    int *p = (int*) malloc(100);
    return;  // p가 스택에서 사라짐 → 100바이트는 garbage!
}
```

### Mark & Sweep GC

1. **Mark Phase**: Root에서 시작해 도달 가능한 모든 블록에 표시
2. **Sweep Phase**: 표시되지 않은 블록을 모두 `free()`

```
Before mark: [1]──→[3]──→[4]──→[5]──→[6]   (일부만 연결)
After mark:  [1]  [3]  [4]  [5]  [6]       (표시된 블록: 파란색)
After sweep: [1]  [Free] [4] [5] [Free]     (미표시 블록 해제)
```

---

## 10. 구현 코드 핵심 매크로

```c
#define WSIZE     4          // 워드 크기 (bytes)
#define DSIZE     8          // 더블 워드 크기 (bytes)
#define CHUNKSIZE (1<<12)    // 힙 확장 단위 (4096 bytes)

/* 크기와 할당 비트를 하나의 워드로 패킹 */
#define PACK(size, alloc)  ((size) | (alloc))

/* 주소 p에서 읽기/쓰기 */
#define GET(p)       (*(unsigned int *)(p))
#define PUT(p, val)  (*(unsigned int *)(p) = (val))

/* 헤더/푸터에서 크기, 할당 여부 읽기 */
#define GET_SIZE(p)   (GET(p) & ~0x7)
#define GET_ALLOC(p)  (GET(p) & 0x1)

/* bp(payload 포인터)에서 헤더/푸터 주소 계산 */
#define HDRP(bp)  ((char *)(bp) - WSIZE)
#define FTRP(bp)  ((char *)(bp) + GET_SIZE(HDRP(bp)) - DSIZE)

/* 다음/이전 블록의 payload 포인터 계산 */
#define NEXT_BLKP(bp)  ((char *)(bp) + GET_SIZE(((char *)(bp) - WSIZE)))
#define PREV_BLKP(bp)  ((char *)(bp) - GET_SIZE(((char *)(bp) - DSIZE)))
```

> 💡 `bp`는 항상 **payload의 시작 주소**를 가리킨다. 헤더는 `bp - WSIZE`에 있다.

---

## 11. Programming Assignment 5 개요

시뮬레이션된 힙 위에서 `malloc`과 `free`를 직접 구현한다.

### 구현해야 할 TODO 목록

| 함수 | 역할 |
|------|------|
| `block_set_header()` | 헤더와 다음 블록의 prev_footer 업데이트 |
| `block_next()` | 다음 블록 포인터 반환 |
| `block_prev()` | 이전 블록 포인터 반환 |
| `extend_heap()` | brk 증가, 새 빈 블록 초기화, coalesce |
| `coalesce()` | 4가지 케이스에 따라 인접 빈 블록 병합 |
| `find_free_block()` | 크기를 만족하는 빈 블록 탐색 |
| `place()` | 빈 블록에 할당, 필요 시 split |
| `mem_alloc()` | malloc 구현 |
| `mem_free()` | free 구현 |

### 개발 방법론: TDD (Test Driven Development)

```
① 실패하는 테스트 작성
       ↓
② 테스트를 통과하는 코드 작성
       ↓
③ 리팩토링
       ↓
    반복!
```

TDD의 장점:
- 구현할 내용을 먼저 명확히 정의
- 코드 수정 후 회귀 테스트가 쉬움
- 리팩토링을 통한 코드 품질 향상

### 기대 출력

```
$ ./a.out
testing mem_aligned_size: success
testing prolog/epilog: success
testing alloc 1 byte: success
testing free 1 byte: success
...
SUCCESS!
Passed all test cases
```
