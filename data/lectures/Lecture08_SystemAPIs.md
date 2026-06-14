# CSE320 System Fundamentals II — System APIs 정리

> YoungMin Kwon 교수님의 Lecture 08 슬라이드를 기반으로 작성된 학습 자료입니다.

---

## 1. OS Services (운영체제 서비스)

운영체제는 두 방향으로 서비스를 제공한다.

- **Applications → System Calls**: 앱이 OS 기능을 쓰고 싶을 때 시스템 콜을 통해 요청
- **Hardware → Interrupt Handlers**: 하드웨어 이벤트가 발생하면 OS가 인터럽트 핸들러로 처리

### System Stack (계층 구조)

```
Application Programs
      ↕ (Application Programming Interface)
Libraries / Utilities
      ↕ (Application Binary Interface)
Operating System
      ↕ (Instruction Set Architecture)
Execution Hardware
      ↕
System Interconnect (Bus)  ←→  Memory Translation
      ↕
I/O Devices & Networking      Main Memory
```

앱은 보통 하드웨어에 직접 접근하지 않고, 이 스택을 거쳐서 요청을 보낸다.

### System Call 흐름

```
[User Mode]                          [Kernel Mode]
 xyz()  →  xyz() { SYSCALL }  →  system_call: sys_xyz()  →  sys_xyz() { ... }
           (wrapper routine)         handler              service routine
```

- **Unix I/O 함수** (`read`, `write` 등): OS가 제공하는 wrapper routine
- **Standard I/O** (`printf`, `scanf` 등): Unix I/O 위에 구현된 라이브러리

---

## 2. Unix I/O 개요

### I/O란?

메인 메모리와 디스크, 터미널, 네트워크 같은 외부 장치 사이에서 데이터를 복사하는 과정이다.

### Unix I/O의 핵심 아이디어

Linux에서는 **모든 I/O 장치를 파일로 추상화**한다.

- 네트워크, 디스크, 터미널 → 전부 "파일"처럼 다룬다
- 덕분에 단순한 저수준 API(Unix I/O)로 모든 장치를 제어할 수 있다

### 왜 Standard I/O 놔두고 Unix I/O를 배우나?

1. Unix I/O를 이해하면 다른 시스템 개념(프로세스 생성, 파일 열기 등)도 더 잘 이해된다
2. 상황에 따라 Unix I/O 말고는 선택지가 없는 경우가 있다

---

## 3. Unix I/O: 파일 기본 개념

### 파일의 정의

Linux 파일은 단순히 **바이트의 순열**이다.

```
B0, B1, B2, ..., Bk, ..., Bm
```

### 파일 관련 주요 동작

| 동작 | 설명 |
|------|------|
| **Opening** | 앱이 I/O 장치에 접근하겠다고 OS에 알림. 커널이 **file descriptor(정수)** 를 반환 |
| **File Position** | 파일의 어느 위치를 읽을지 나타내는 byte offset. `seek`으로 변경 가능 |
| **Reading** | `read` — 파일의 현재 위치에서 n바이트를 메모리로 복사 |
| **Writing** | `write` — 메모리에서 n바이트를 파일의 현재 위치에 복사 |
| **Closing** | 앱이 파일 접근을 끝냈음을 커널에 알림 |

### 파일 타입

| 타입 | 설명 |
|------|------|
| Regular file | 임의의 데이터를 담는 일반 파일 (텍스트/바이너리) |
| Directory | 파일 이름과 파일을 매핑하는 링크 배열을 담는 파일. `.`은 자기 자신, `..`은 부모 디렉토리 |
| Socket | 다른 프로세스와 통신하기 위한 파일 |
| 기타 | Named pipe, symbolic link, character/block device 등 |

Linux 커널은 모든 파일을 루트 디렉토리 `/`에서 시작하는 **단일 디렉토리 계층**으로 관리하며, 각 프로세스는 자신만의 **current working directory**를 갖는다.

---

## 4. 파일 열기/닫기

### `open()`

```c
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>

int open(char *filename, int flags, mode_t mode);
```

**flags** — 어떻게 열 것인지:

| 플래그 | 의미 |
|--------|------|
| `O_RDONLY` | 읽기 전용 |
| `O_WRONLY` | 쓰기 전용 |
| `O_RDWR` | 읽기+쓰기 |
| `O_CREAT` | 파일이 없으면 새로 생성 |
| `O_TRUNC` | 파일이 있으면 내용 비우기 |
| `O_APPEND` | 파일 끝에 이어쓰기 |

**mode** — 파일 권한 (생성 시 사용):

| 상수 | 의미 |
|------|------|
| `S_IRUSR`, `S_IRGRP`, `S_IROTH` | User/Group/Other 읽기 권한 |
| `S_IWUSR`, `S_IWGRP`, `S_IWOTH` | User/Group/Other 쓰기 권한 |
| `S_IXUSR`, `S_IXGRP`, `S_IXOTH` | User/Group/Other 실행 권한 |

### `close()`

```c
#include <unistd.h>
int close(int fd);
```

### `umask` 사용 예시

```c
#define DEF_MODE  S_IRUSR|S_IWUSR|S_IRGRP|S_IWGRP|S_IROTH|S_IWOTH
#define DEF_UMASK S_IWGRP|S_IWOTH   // group/other 쓰기 권한을 끄는 마스크

umask(DEF_UMASK);
int fd = open("foo.txt", O_CREAT|O_TRUNC|O_WRONLY, DEF_MODE);
// 실제 권한 = DEF_MODE & ~DEF_UMASK & 0777
close(fd);
```

> **포인트**: umask에 설정된 비트는 실제 권한에서 제거된다. 보안 설정의 기본 단위다.

---

## 5. 파일 읽기/쓰기

```c
#include <unistd.h>

ssize_t read(int fd, void *buf, size_t n);   // 파일 → 메모리
ssize_t write(int fd, const void *buf, size_t n); // 메모리 → 파일
```

- `fd`: file descriptor (open이 반환한 정수)
- `buf`: 데이터를 담을 메모리 주소
- `n`: 읽거나 쓸 바이트 수
- 반환값: 실제로 읽거나 쓴 바이트 수

### 표준 입출력 fd

| fd | 의미 |
|----|------|
| `0` (STDIN_FILENO) | 표준 입력 |
| `1` (STDOUT_FILENO) | 표준 출력 |
| `2` (STDERR_FILENO) | 표준 에러 |

### 읽기/쓰기 예시 (stdin → 파일 → stdout)

```c
char buf[100];
int fd1, fd2, n, i;

// 표준 입력에서 읽기
n = read(STDIN_FILENO, buf, sizeof(buf));

// 파일에 쓰기
fd1 = open("foo.txt", O_CREAT|O_WRONLY, S_IRUSR|S_IWUSR);
for (i = 0; i < n; )
    i += write(fd1, buf + i, n - i);
close(fd1);

// 파일에서 읽기
fd2 = open("foo.txt", O_RDONLY, 0);
for (i = 0; i < n; )
    i += read(fd2, buf + i, n - i);
close(fd2);

// 표준 출력에 쓰기
for (i = 0; i < n; )
    i += write(STDOUT_FILENO, buf + i, n - i);
```

> `for` 루프를 쓰는 이유: `read/write`는 요청한 n바이트보다 적게 처리할 수 있기 때문(short count). 루프로 끝까지 처리해야 안전하다.

---

## 6. 파일 메타데이터 읽기

### stat 관련 함수

```c
#include <unistd.h>
#include <sys/stat.h>

int stat(const char *filename, struct stat *buf);  // 심볼릭 링크 따라감
int lstat(const char *filename, struct stat *buf); // 링크 자체 정보
int fstat(int fd, struct stat *buf);               // 열린 파일 정보
```

### struct stat 주요 필드

```c
struct stat {
    dev_t   st_dev;    // 파일이 있는 장치 ID
    ino_t   st_ino;    // inode 번호
    mode_t  st_mode;   // 파일 타입 + 권한
    nlink_t st_nlink;  // 하드 링크 수
    uid_t   st_uid;    // 소유자 User ID
    gid_t   st_gid;    // 소유자 Group ID
    off_t   st_size;   // 파일 크기 (bytes)
    time_t  st_atime;  // 마지막 접근 시간
    time_t  st_mtime;  // 마지막 수정 시간
    time_t  st_ctime;  // 마지막 상태 변경 시간
    ...
};
```

### 하드 링크 vs 심볼릭 링크

```bash
$ ln aa.txt aa1.txt    # 하드 링크 — 같은 inode를 가리킴
$ ln -s aa.txt aa2.txt # 심볼릭 링크 — 별개의 inode, 경로를 저장
```

하드 링크(`aa.txt`, `aa1.txt`)는 inode 번호가 같고 링크 카운트가 2가 된다.
심볼릭 링크(`aa2.txt`)는 별도의 inode를 갖고, 내용은 원본 파일 경로 문자열이다.

### 파일 타입 판별 예시

```c
switch (sb.st_mode & S_IFMT) {
    case S_IFBLK:  printf("block device\n");     break;
    case S_IFCHR:  printf("character device\n"); break;
    case S_IFDIR:  printf("directory\n");        break;
    case S_IFIFO:  printf("FIFO/pipe\n");        break;
    case S_IFLNK:  printf("link\n");             break;
    case S_IFREG:  printf("regular file\n");     break;
    case S_IFSOCK: printf("socket\n");           break;
}
```

---

## 7. 파일 시스템 내부 구조

### 디스크 구조 (큰 그림)

```
Disk Drive
└── Partition
    └── File System
        ├── Boot Block(s)
        ├── Super Block        ← 파일 시스템 전체 정보
        └── Cylinder Groups
            ├── Super Block Copy
            ├── CG Info
            ├── i-node map
            ├── block bitmap
            ├── i-nodes         ← 파일 메타데이터
            └── Data Blocks     ← 실제 파일 데이터
```

### 핵심 커널 자료구조

#### `super_block` — 파일 시스템 전체 정보

```c
struct super_block {
    dev_t   s_dev;        // 장치 식별자
    unsigned long s_blocksize; // 블록 크기(bytes)
    struct file_system_type *s_type; // 파일 시스템 타입
    unsigned long s_magic; // 파일 시스템 매직 넘버
    struct dentry *s_root; // 루트 디렉토리 마운트 포인트
    struct list_head s_inodes; // 이 FS의 inode 목록
    ...
};
```

#### `inode` — 파일 하나의 메타데이터

```c
struct inode {
    unsigned long i_ino;   // inode 번호
    unsigned int  i_nlink; // 하드 링크 수
    uid_t         i_uid;   // 소유자 UID
    loff_t        i_size;  // 파일 크기
    umode_t       i_mode;  // 접근 권한
    struct inode_operations *i_op; // inode 연산 테이블
    struct file_operations  *i_fop;// 파일 연산 테이블
    ...
};
```

#### `dentry` — 파일 이름 ↔ inode 연결

```c
struct dentry {
    struct dentry *d_parent;  // 부모 디렉토리
    struct qstr    d_name;    // 파일 이름
    struct inode  *d_inode;   // 연결된 inode
    ...
};
```

> **요약**: 디렉토리 블록에는 `(inode 번호, 파일명)` 쌍이 저장된다. 파일명으로 inode를 찾고, inode로 실제 데이터 블록 위치를 찾는다.

---

## 8. 디렉토리 내용 읽기

```c
#include <dirent.h>

DIR           *opendir(const char *name);
struct dirent *readdir(DIR *dirp);
int            closedir(DIR *dirp);

struct dirent {
    ino_t d_ino;       // Inode 번호
    char  d_name[256]; // 파일 이름
    ...
};
```

### 예시: 디렉토리 목록 출력

```c
int main(int argc, char **argv) {
    DIR *dp;
    struct dirent *dep;
    char *name = (argc != 2 ? "/" : argv[1]);

    dp = opendir(name);
    while ((dep = readdir(dp)) != NULL)
        printf("%s\n", dep->d_name);
    closedir(dp);
    return 0;
}
```

---

## 9. 파일 공유 (Sharing Files)

### 세 가지 커널 자료구조

```
Descriptor Table          Open File Table           v-node Table
(프로세스마다 별도)         (모든 프로세스 공유)        (모든 프로세스 공유)

fd 0 ─────────────────►  File pos               ► File access
fd 1                      refcnt = 1               File size
fd 2                      ...                       File type
fd 3
fd 4
```

- **Descriptor Table**: 각 프로세스가 독립적으로 갖는 fd → Open File Table 포인터 배열
- **Open File Table**: 현재 열려있는 파일들의 상태 (file position, reference count)
- **v-node Table**: 실제 파일의 메타데이터 (stat 구조체 대부분)

### 케이스별 동작

| 케이스 | 결과 |
|--------|------|
| 서로 다른 파일을 각각 open | fd마다 별도 Open File Table 엔트리, 서로 독립적 |
| 같은 파일을 두 번 open | fd마다 별도 file position (독립적으로 읽기/쓰기 가능) |
| `fork` 후 파일 공유 | 자식은 부모의 descriptor table 복사본을 가짐. **Open File Table은 공유** → file position도 공유됨! |

### fork와 파일 공유의 차이

```c
// 1. fork한 다음 open — 부모/자식이 각자 open → 독립적인 file position
int pid = fork();
int fd = open("foo.txt", O_CREAT|O_RDWR, S_IRUSR|S_IWUSR);

// 2. open한 다음 fork — file position 공유!
int fd = open("bar.txt", O_CREAT|O_RDWR, S_IRUSR|S_IWUSR);
int pid = fork();
```

> **주의**: open-then-fork의 경우, 부모가 쓴 내용을 자식이 읽으려면 `lseek(fd, 0, SEEK_SET)`으로 file position을 처음으로 되돌려야 한다.

---

## 10. I/O Redirection

셸에서 자주 쓰는 기능이다.

```bash
$ ls > foo.txt    # ls의 출력을 foo.txt로 리다이렉트
$ wc < foo.txt    # foo.txt를 wc의 입력으로 리다이렉트
$ ls | wc         # ls 출력을 파이프로 wc 입력에 연결
```

### `dup2`

```c
#include <unistd.h>
int dup2(int oldfd, int newfd);
```

- `oldfd`의 descriptor 엔트리를 `newfd`에 복사
- `newfd`가 이미 열려있으면 먼저 닫고 복사
- 이를 이용해 `stdout`(fd=1) 또는 `stdin`(fd=0)을 원하는 파일로 교체할 수 있다

### 리다이렉트 구현 흐름

```
execve 실행 전에:
1. 원하는 파일을 open
2. dup2(fd, 1)  → 이후 출력이 그 파일로 감 (output redirect)
   dup2(fd, 0)  → 이후 입력이 그 파일에서 옴 (input redirect)
3. execve 실행
```

### `dup2(4, 1)` 실행 후 변화

```
이전: fd1 → File A
이후: fd1 → File B (File A의 refcnt = 0으로 닫힘, fd4와 fd1 모두 File B를 가리킴)
```

---

## 11. Pipe (파이프)

프로세스 간 통신(IPC) 메커니즘이다.

```c
#include <unistd.h>
int pipe(int fd[2]);
// fd[0]: 읽기 end (read)
// fd[1]: 쓰기 end (write)
```

### 파이프 동작 구조

```
Parent                    Child
fd[0]  fd[1]    fork     fd[0]  fd[1]
  ↑      ↓                ↑      ↓
  └──────────── pipe ─────────────┘
                (kernel)
```

### `ls | wc` 구현 예시

```c
int fd[2];
pipe(fd);
pid_t pid = fork();

if (pid == 0) {         // 자식: ls 실행
    close(fd[0]);
    dup2(fd[1], 1);     // stdout → 파이프 write end
    char *param[] = {"/bin/ls", NULL};
    execve(param[0], param, NULL);
} else {                // 부모: wc 실행
    close(fd[1]);
    dup2(fd[0], 0);     // stdin → 파이프 read end
    waitpid(pid, NULL, 0);
    char *param[] = {"/usr/bin/wc", NULL};
    execve(param[0], param, NULL);
}
```

---

## 12. Programming Assignment 6 — `myls` 구현

`ls -al` 명령과 동일한 출력을 만드는 프로그램을 구현하는 과제다.

### 구현해야 할 함수들

| 함수 | 설명 |
|------|------|
| `print_dir(path)` | 디렉토리 열기, 엔트리 순회, 정렬 후 출력 |
| `update_field_info(path, name, pfi)` | `lstat`으로 각 파일 정보 읽어 출력 폭 계산 |
| `print_file(path, name, pfi)` | 파일 타입, 권한, 링크수, 유저, 그룹, 크기, 날짜, 이름 출력 |
| `sort_names(names, nr_names)` | 이름 배열을 알파벳 순으로 정렬 |
| `print_type(buf, mode)` | 파일 타입 문자 출력 (`-`, `d`, `l`, `c`, `b`, `p`, `s`) |
| `print_permission(buf, mode)` | `rwxrwxrwx` 형태의 권한 문자열 출력 |
| `print_nlink(buf, w, nlink)` | 링크 수를 우측 정렬로 출력 |
| `print_user(buf, w, uid)` | UID → 사용자명 변환 후 출력 |
| `print_group(buf, w, gid)` | GID → 그룹명 변환 후 출력 |
| `print_size(buf, w, size)` | 파일 크기 출력 |
| `print_date(buf, w, sec)` | 날짜 출력 (올해면 시간, 다른 해면 연도 표시) |
| `print_name(buf, mode, fullpath, name)` | 심볼릭 링크면 `name -> target` 형태로 출력 |

### 예상 출력 형식

```
total 4
drwxr-xr-x 16 root root 3240 Sep 21 15:10 .
drwxr-xr-x 19 root root 4096 Sep  6 08:40 ..
crw-r--r--  1 root root    0 Sep  6 08:40 autofs
lrwxrwxrwx  1 root root   11 Sep  6 08:40 core -> /proc/kcore
```

### 구현 힌트

- `opendir` / `readdir` / `closedir` — 디렉토리 순회
- `lstat` — 심볼릭 링크 자체 정보 (링크를 따라가지 않음)
- `getpwuid` — UID → 사용자명
- `getgrgid` — GID → 그룹명
- `readlink` — 심볼릭 링크의 타겟 경로
- `localtime` — `time_t` → `struct tm` 변환
- `sprintf` with `%*d`, `%-*s` — 폭 지정 출력

---

## 핵심 개념 요약

```
System Call  →  OS 기능을 쓰기 위한 인터페이스
File         →  Linux에서 모든 I/O 장치를 추상화한 바이트 시퀀스
File Descriptor → open()이 반환하는 정수 핸들
inode        →  파일의 메타데이터 (이름 제외)
dentry       →  파일 이름 ↔ inode 매핑
dup2         →  file descriptor를 복사 (I/O 리다이렉션의 핵심)
pipe         →  프로세스 간 단방향 데이터 채널
fork + exec  →  새 프로세스를 만들고 다른 프로그램을 실행
```
