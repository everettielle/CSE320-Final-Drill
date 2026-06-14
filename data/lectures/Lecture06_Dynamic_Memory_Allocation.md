# CSE320 System Fundamentals II
## Dynamic Memory Allocation

---

## 1. 왜 동적 메모리 할당이 필요한가?

프로그램을 작성할 때, 우리는 종종 **얼마나 많은 데이터를 처리해야 할지 미리 알 수 없다.**

### 예시: 단어 정렬 프로그램
사용자가 입력하는 단어들을 정렬하는 프로그램을 만든다고 가정하자.

- 단어를 몇 개 입력할지 모른다 → 배열 크기를 얼마로 잡아야 할까?
- `최대 단어 수 × 최대 단어 길이`로 고정하면? → **공간 낭비**가 심하다
- 너무 작게 잡으면? → **버퍼 오버플로우** 위험

이 문제를 해결하는 것이 바로 **동적 메모리 할당(Dynamic Memory Allocation)**이다.

---

## 2. 동적 메모리 할당의 기본 원리

### 핵심 아이디어
- 필요한 만큼만 메모리를 **할당(allocate)**한다
- 다 쓰면 메모리를 **해제(free)**한다

### 메모리 구조 (프로세스 주소 공간)

```
┌─────────────────────────┐  높은 주소
│       User Stack        │  ← 지역변수, 함수 호출 정보
│           ↓             │
│                         │
│   Memory mapped region  │  ← 공유 라이브러리
│   for shared libraries  │
│                         │
│           ↑             │
│          Heap           │  ← malloc이 여기에 할당!
├─────────────────────────┤
│  Uninitialized data     │  ← .bss (전역/정적 변수, 초기값 없음)
│  (.bss)                 │
├─────────────────────────┤
│  Initialized data       │  ← .data (전역/정적 변수, 초기값 있음)
│  (.data)                │
├─────────────────────────┤
│  Program text           │  ← .text (실행 코드)
│  (.text)                │
└─────────────────────────┘  낮은 주소 (0)
```

> **중요:** `malloc`은 **힙(Heap)** 영역에 메모리를 할당한다.  
> 힙은 위로 성장하고, 스택은 아래로 성장한다.

### 핵심 함수: `malloc`과 `free`

```c
#include <stdlib.h>

void *malloc(size_t size);  // size 바이트만큼 힙에 할당, 포인터 반환
void free(void *ptr);       // ptr이 가리키는 메모리 해제
```

| 함수 | 역할 | 반환값 |
|------|------|--------|
| `malloc(size)` | 힙에 `size` 바이트 공간 확보 | 할당된 공간의 시작 주소 (`void*`), 실패 시 `NULL` |
| `free(ptr)` | `ptr`이 가리키는 공간 반환 | 없음 (`void`) |

> **주의:** `malloc`이 반환하는 메모리는 **초기화되지 않는다.** 쓰레기값이 들어있을 수 있다.  
> 0으로 초기화된 메모리가 필요하면 `calloc`을 사용하라.

---

## 3. 예제 1: 단어 읽기 & 정렬 (`sort.c`)

### 전체 구조

```
main()
 ├── ReadWords()   : 단어 입력받아 동적 배열에 저장
 ├── PrintWords()  : 단어 출력
 ├── SortWords()   : Selection Sort로 정렬
 ├── PrintWords()  : 정렬 후 출력
 └── FreeWords()   : 할당된 메모리 전부 해제
```

### ReadWords: 단어 입력 및 동적 할당

```c
void ReadWords(char ***pwords, int *pn) {
    int i, n;
    char **words;
    char word[100];

    printf("Number of words: ");
    scanf("%d", &n);

    // n개의 char* 포인터를 담을 배열을 힙에 할당
    words = (char**)malloc(n * sizeof(char*));

    for(i = 0; i < n; i++) {
        printf("Word %d of %d: ", i+1, n);
        scanf("%99s", word);
        words[i] = strdup(word); // malloc + strcpy를 한 번에!
    }

    *pwords = words; // 힙 메모리는 함수가 끝나도 살아있음
    *pn = n;
}
```

**포인터 구조 시각화:**
```
words (char**)
  │
  ▼
┌──────────┬──────────┬──────────┐
│ words[0] │ words[1] │ words[2] │  ← char* 포인터 배열 (힙)
└─────┬────┴─────┬────┴─────┬────┘
      │          │          │
      ▼          ▼          ▼
   "apple"    "banana"   "cherry"   ← strdup으로 할당된 문자열 (힙)
```

**`strdup`이란?**
```c
// strdup은 내부적으로 이렇게 동작한다:
char* strdup(const char* s) {
    char* copy = malloc(strlen(s) + 1); // null terminator 포함
    strcpy(copy, s);
    return copy;
}
```

> **왜 `char***`인가?** `words`라는 포인터 자체를 함수 외부로 전달해야 하므로,  
> 포인터의 포인터의 포인터(`char***`)가 필요하다.  
> 스택 변수와 달리, **힙 메모리는 함수가 종료되어도 해제되지 않는다.**

---

### SortWords: Selection Sort (정렬)

```c
void Swap(char **p, char **q) {
    char *t;
    t = *p, *p = *q, *q = t; // 포인터 값(주소)을 교환
}

void SortWords(char **words, int n) {
    int i, j;
    for(i = 0; i < n; i++)
        for(j = i + 1; j < n; j++)
            if(strcmp(words[i], words[j]) > 0)
                Swap(words+i, words+j);
}
```

> **핵심:** 문자열 자체를 복사하는 게 아니라, **포인터(주소)를 교환**한다.  
> 훨씬 효율적이다!

---

### FreeWords: 메모리 해제

```c
void FreeWords(char **words, int n) {
    int i;
    for(i = 0; i < n; i++)
        free(words[i]); // strdup으로 할당된 각 문자열 해제
    free(words);        // malloc으로 할당된 포인터 배열 해제
}
```

> **순서가 중요하다!** 반드시 안쪽(각 문자열)을 먼저 해제하고, 나중에 바깥쪽(포인터 배열)을 해제해야 한다.  
> 반대로 하면 **메모리 누수(memory leak)** 또는 **dangling pointer** 문제가 발생한다.

---

## 4. 예제 2: Embedded Linked List

### 설계 철학
이 예제는 **링크드 리스트 로직을 데이터와 분리**하는 고급 패턴을 보여준다.

```
일반적인 링크드 리스트:        이 예제의 방식:
┌──────────────────┐          ┌──────────────────────┐
│  data            │          │  Container (Person)  │
│  *next           │          │    name, id, ...     │
└──────────────────┘          │  ┌───────────────┐   │
                              │  │  struct List  │   │ ← 리스트 노드가
                              │  │  prev, next   │   │   컨테이너 안에 내장
                              │  └───────────────┘   │
                              └──────────────────────┘
```

**장점:** `struct List` 코드를 한 번만 작성하면 어떤 데이터 타입에도 재사용 가능하다.

---

### `offsetof`와 `containerof` 매크로

이 두 매크로가 이 패턴의 핵심이다.

```c
// 구조체의 시작 주소(0)로부터 멤버 m까지의 바이트 거리를 계산
#define offsetof(st, m) \
    ((size_t) &(((st *)0)->m))

// 멤버 m의 주소(ptr)로부터 컨테이너 구조체의 시작 주소를 역산
#define containerof(ptr, st, m) \
    ((st *) (((char*)(ptr)) - offsetof(st, m)))
```

**시각화:**
```
메모리 레이아웃 (Person 구조체)
┌─────────────────────────┐ ← Person 시작 주소
│  char *name             │
├─────────────────────────┤
│  long id                │
├─────────────────────────┤ ← &p->list (= ptr)
│  struct List            │
│    *prev                │   ↑
│    *next                │   │  offsetof(Person, list)
└─────────────────────────┘   │
                              │
containerof(ptr, Person, list) = ptr - offset
                            = Person의 시작 주소!
```

**실제 사용 예:**
```c
// list 포인터로부터 Person을 꺼낸다
struct List *pos = ...; // 리스트 노드 포인터
Person *person = containerof(pos, struct Person, list);
// person->name, person->id에 접근 가능!
```

---

### `list.h`: 인터페이스 정의

```c
struct List {
    struct List *prev, *next; // 양방향(doubly) 링크드 리스트
};

// 초기화: head를 자기 자신을 가리키도록 (원형 리스트)
void list_init_head(struct List *head);

// 상태 확인
int  list_is_empty(struct List *head);
int  list_size(struct List *head);

// 삽입
void list_add_to_prev(struct List *pos, struct List *list);  // pos 앞에 삽입
void list_add_to_next(struct List *pos, struct List *list);  // pos 뒤에 삽입
void list_add_to_last(struct List *head, struct List *list); // 맨 뒤에 삽입
void list_add_to_first(struct List *head, struct List *list);// 맨 앞에 삽입

// 제거
struct List* list_remove(struct List *list);
struct List* list_remove_last(struct List *head);
struct List* list_remove_first(struct List *head);

// 탐색 (함수 포인터로 비교 함수를 받음)
struct List* list_find(struct List *head, void *data,
                       int (*comp)(struct List *list, void *data));
```

---

### `list.c`: 구현

#### 초기화 - 원형 리스트
```c
void list_init_head(struct List *head) {
    head->next = head->prev = head;
    // head가 자기 자신을 가리키게 초기화
    // 이렇게 하면 빈 리스트 판별이 쉬워진다
}

int list_is_empty(struct List *head) {
    return head->next == head; // head가 자신을 가리키면 비어있음
}
```

**초기화 후 구조:**
```
head ──next──▶ head
head ◀──prev── head
```

#### 삽입: `list_add_to_prev`
```c
void list_add_to_prev(struct List *pos, struct List *list) {
    list->next = pos;         // 새 노드의 next = pos
    list->prev = pos->prev;   // 새 노드의 prev = pos의 이전 노드
    pos->prev->next = list;   // pos의 이전 노드의 next = 새 노드
    pos->prev = list;         // pos의 prev = 새 노드
}
```

**시각화 (pos 앞에 list 삽입):**
```
Before: [A] <──> [pos]
After:  [A] <──> [list] <──> [pos]
```

#### 제거: `list_remove`
```c
struct List* list_remove(struct List *list) {
    list->prev->next = list->next;  // 이전 노드의 next를 다음 노드로
    list->next->prev = list->prev;  // 다음 노드의 prev를 이전 노드로
    list->next = list->prev = NULL; // 안전을 위해 NULL 처리
    return list;
}
```

#### 탐색: `list_find`
```c
struct List* list_find(struct List *head, void *data,
                       int (*comp)(struct List *list, void *data)) {
    struct List *pos;
    for(pos = head->next; pos != head; pos = pos->next)
        if(comp(pos, data))
            return pos;
    return NULL;
}
```
> **함수 포인터(`*comp`)를 사용**해서, 비교 로직을 외부에서 주입받는다.  
> 이렇게 하면 `list_find`는 어떤 데이터 타입에도 재사용 가능하다.

---

### `sort_list.c`: Person 리스트 구현

#### 구조체 정의
```c
typedef struct Person {
    char *name;       // 이름 (동적 할당)
    long id;          // ID
    struct List list; // 링크드 리스트 노드 (내장!)
} Person;
```

#### TODO 1 풀이: `NewPerson` & `FreePerson`
```c
Person* NewPerson(char *name, long id) {
    // TODO 1: Person 크기만큼 힙에 할당
    Person *p = (Person*)malloc(sizeof(Person));
    p->name = strdup(name);
    p->id = id;
    return p;
}

void FreePerson(Person *p) {
    // TODO 1: name 문자열 먼저 해제
    free(p->name);
    // TODO 1: Person 구조체 해제
    free(p);
}
```

#### TODO 1 풀이: `FreeList`
```c
void FreeList(struct List *head) {
    while(!list_is_empty(head)) {
        struct List *pos = list_remove_first(head);
        // TODO 1: pos로부터 Person을 역산
        Person *person = containerof(pos, struct Person, list);
        FreePerson(person);
    }
}
```

#### TODO 2 풀이: 정렬된 삽입 (`ORDERED_INSERT = 1`)
```c
// CompareName: list 노드의 name이 인자로 받은 name보다 크면 1 반환
int CompareName(struct List *list, void *name) {
    return strcmp(containerof(list, struct Person, list)->name,
                  (char*)name) > 0;
}

// ReadNames 내부 (ORDERED_INSERT = 1일 때)
struct List *pos = list_find(head, name, CompareName);
if(pos != NULL)
    list_add_to_prev(pos, &p->list); // TODO 2: pos 앞에 삽입
else
    list_add_to_last(head, &p->list); // TODO 2: 맨 뒤에 삽입
```

> **동작 원리:** `list_find`가 현재 이름보다 **알파벳 순으로 큰** 첫 번째 노드를 찾는다.  
> 그 노드 앞에 삽입하면, 입력과 동시에 정렬된 상태가 유지된다.

---

## 5. 핵심 개념 정리

| 개념 | 설명 |
|------|------|
| `malloc(size)` | 힙에 `size` 바이트 할당. 반드시 `free`로 해제해야 함 |
| `free(ptr)` | 힙 메모리 해제. 해제 후 포인터는 `NULL`로 설정 권장 |
| `strdup(s)` | 문자열 복사본을 힙에 할당. 내부적으로 `malloc` 사용 |
| `offsetof(st, m)` | 구조체 `st`에서 멤버 `m`까지의 바이트 오프셋 |
| `containerof(ptr, st, m)` | 멤버 포인터 `ptr`로부터 컨테이너 구조체 `st`의 포인터 역산 |
| Embedded linked list | 링크드 리스트 노드를 구조체 내부에 내장하는 패턴 |

## 6. 자주 하는 실수들

```c
// ❌ 1. 해제 후 사용 (Use After Free)
free(ptr);
printf("%s", ptr->name); // 위험!

// ✓ 해결: 해제 후 NULL 처리
free(ptr);
ptr = NULL;

// ❌ 2. 이중 해제 (Double Free)
free(ptr);
free(ptr); // 크래시!

// ❌ 3. 메모리 누수 (Memory Leak)
ptr = malloc(100);
ptr = malloc(200); // 첫 번째 malloc의 주소를 잃어버림!

// ❌ 4. 해제 순서 오류
free(words);         // 포인터 배열을 먼저 해제하면
free(words[0]);      // 각 문자열 주소를 잃어버림!

// ✓ 올바른 순서: 안쪽 → 바깥쪽
for(int i = 0; i < n; i++) free(words[i]);
free(words);
```
