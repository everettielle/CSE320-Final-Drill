# Network Programming
> CSE320 System Fundamentals II — Lecture 11 정리

---

## 1. Client-Server Model

네트워크 애플리케이션의 기본 구조는 **Client-Server 모델**이다.

| 구성 요소 | 역할 |
|---------|------|
| **Server process** | 리소스를 관리하고 클라이언트에게 서비스를 제공 |
| **Client process** | 서버에 요청을 보내고 응답을 처리 |

> 중요: Client와 Server는 **머신(호스트)이 아니라 프로세스**다!

### Transaction (트랜잭션)

클라이언트-서버 간 통신은 다음 4단계로 이루어진다:

1. **Client**가 request를 보냄
2. **Server**가 request를 해석하고 리소스를 조작
3. **Server**가 response를 보냄
4. **Client**가 response를 처리

예시: Web server, FTP server, Email server

---

## 2. Networks 기초

### 네트워크란?

호스트 입장에서 네트워크는 **데이터의 source이자 sink 역할을 하는 또 하나의 I/O 장치**다.

```
CPU chip ─── System bus ─── I/O bridge ─── Memory bus ─── Main memory
                                │
                            I/O bus
                    ┌───┬───┬───┬───┐
                   USB  GPU Disk  Network
                                  adapter ← 여기!
```

### Adapter (어댑터)

- 네트워크에 대한 **물리적 인터페이스**
- 호스트와 네트워크 사이에서 데이터를 복사

---

## 3. LAN (Local Area Network)

건물이나 캠퍼스 규모의 네트워크. 가장 대표적인 LAN 기술은 **Ethernet**이다.

### Ethernet Segment

- **구성**: 와이어(꼬임 쌍선) + 허브(Hub)
- **범위**: 방 하나 또는 건물의 한 층
- 와이어의 대역폭: 100 Mb/s, 1 Gb/s 등 (동일 세그먼트 내에서는 같은 대역폭)

### Hub vs Bridge

| 장치 | 동작 |
|------|------|
| **Hub** | 한 포트에서 받은 비트를 **모든 다른 포트**에 복사 (브로드캐스트) |
| **Bridge** | 여러 Ethernet 세그먼트를 연결하고, **필요한 포트에만 선택적으로** 프레임을 복사 |

Bridge는 어떤 호스트가 어느 포트에서 도달 가능한지 알고 있으며, 세그먼트 간 와이어의 대역폭이 다를 수 있다.

### MAC Address & Frame

- 각 Ethernet 어댑터는 **전역적으로 고유한 48비트 MAC 주소**를 가진다
- 같은 세그먼트의 호스트끼리 **프레임(Frame)** 을 주고받는다

**Ethernet Frame 구조 (IEEE 802.3):**

```
| Preamble | SFD | Dest Addr | Src Addr | Length | Data (46~1500B) | FCS(CRC) |
| 7 byte   | 1B  | 6 byte    | 6 byte   | 2 byte |                 | 4 byte   |
```

- 전체 크기: 64 ~ 1518 byte
- Header (14 byte): 출발지/목적지 주소, 프레임 길이
- Payload: 실제 데이터

---

## 4. internet (소문자 i)

서로 **호환되지 않는 LAN들**을 연결한 네트워크를 internet이라 한다.

### Router (라우터)

- 여러 **호환되지 않는 LAN**들을 연결
- **WAN (Wide Area Network)** 도 연결 (예: 점대점 전화 연결)

### Protocol Software

서로 다른 네트워크를 넘어 통신하기 위해 호스트와 라우터에서 프로토콜 소프트웨어가 동작한다.

**두 가지 핵심 역할:**

**Naming Scheme (주소 체계)**
- 서로 다른 LAN 기술은 주소 할당 방식이 다르다
- internet 프로토콜이 **통일된 호스트 주소 형식**을 정의

**Delivery Mechanism (전달 메커니즘)**
- **Packet**: 데이터 비트를 이산적 청크로 묶는 통일된 방법
- Header: 출발지/목적지 주소, 패킷 크기
- Payload: 실제 데이터

### 데이터가 호스트 간에 이동하는 과정

```
Host A (Client)                          Host B (Server)
    │ (1) Data                               ▲ (8) Data
    ▼                                        │
Protocol SW                            Protocol SW
    │ (2) [Data|PH|FH1]                     ▲ (7) [Data|PH|FH2]
    ▼                                        │
LAN1 adapter                           LAN2 adapter
    │ (3)                                    ▲ (6)
    ▼          Router                        │
    ────→ LAN1 adapter → Protocol SW → LAN2 adapter ────→
         (4) [Data|PH|FH1]  (5) [Data|PH|FH2]
```

- **PH**: internet packet header (변하지 않음)
- **FH1**: LAN1용 frame header
- **FH2**: LAN2용 frame header
- 라우터가 FH1을 벗기고 FH2를 새로 붙여서 전달!

---

## 5. IP Internet (대문자 I)

**Global IP Internet**은 internet의 가장 유명한 구현체다.

### 프로토콜 스택

| 계층 | 프로토콜 | 역할 |
|------|---------|------|
| **장치 간** | **IP** (Internet Protocol) | 주소 체계(naming) + 패킷 전달(delivery), 패킷을 datagram이라 부름 |
| **프로세스 간** | **TCP** (Transmission Control Protocol) | 신뢰성 있는 양방향 연결 (스트리밍) |
| **프로세스 간** | **UDP** (Unreliable Datagram Protocol) | 패킷 유실/중복 가능 |

### 소프트웨어/하드웨어 구조

```
         User code:     Client / Server
              ↕  Socket interface (system calls)
         Kernel code:   TCP/IP
              ↕  Hardware interface (interrupts)
         Hardware:       Network adapter
              ↕
         Global IP Internet
```

---

## 6. IP Addresses

IP 주소는 **부호 없는 32비트 정수**이며, **dotted-decimal 표기법**으로 표현한다.

### IP 주소 구조체

```c
struct in_addr {
    uint32_t s_addr;    // Network byte order (big-endian)로 저장
};
```

### Byte Order 변환 함수

네트워크는 항상 **big-endian**을 사용하고, 호스트는 big-endian이거나 little-endian일 수 있다.

```c
#include <arpa/inet.h>

// Host → Network (big-endian)
uint32_t htonl(uint32_t hostlong);
uint16_t htons(uint16_t hostshort);

// Network → Host
uint32_t ntohl(uint32_t netlong);
uint16_t ntohs(uint16_t netshort);
```

**예시 (little-endian 호스트에서):**

```
hl = 0x12345678 → 메모리: 78 56 34 12
nl = htonl(hl)  → 메모리: 12 34 56 78  (big-endian)
```

---

## 7. Internet Domain Names

숫자 IP 주소 대신 사람이 읽기 쉬운 **도메인 이름**을 사용한다.

### 도메인 이름 계층 구조

```
         (unnamed root)
        /    |    \     \
      mil   edu   gov   com          ← 1st-level
           / \            \
        cmu  berkeley    amazon      ← 2nd-level
        / \                \
      cs   ece             www       ← 3rd-level
```

### 특징

- 하나의 도메인 이름에 **여러 IP 주소**가 매핑될 수 있다 → **로드 밸런싱**
- DNS (Domain Name System)가 도메인 이름 ↔ IP 주소 변환을 담당

---

## 8. TCP/IP Connection

| 속성 | 설명 |
|------|------|
| **Point-to-point** | 한 쌍의 프로세스를 연결 |
| **Full-duplex** | 양방향으로 동시에 데이터 전송 가능 |
| **Reliable** | 보낸 순서대로 데이터가 도착하는 것을 보장 |

### Socket (소켓)

- 연결의 **끝점(end point)**
- **Socket address** = IP 주소 : 포트 번호 (예: `128.2.194.242:80`)

### Port Number (포트 번호)

- 16비트 정수

| 종류 | 설명 | 예시 |
|------|------|------|
| **Ephemeral port** | 커널이 자동으로 할당 | 클라이언트 소켓 |
| **Well-known port** | 서비스별로 고정된 번호 | HTTP=80, SSH=22, FTP=21, SMTP=25 |

```
/etc/services 파일에서 확인 가능:
ftp      21/tcp
ssh      22/tcp
http     80/tcp
```

---

## 9. Sockets Interface

소켓 인터페이스는 클라이언트-서버 네트워크 프로그래밍의 핵심 API다.

### 전체 흐름

```
    Client                          Server
    ──────                          ──────
    socket()                        socket()
                                    bind()
                                    listen()
    connect() ──── 연결 요청 ────→  accept()
    write()   ──── 데이터 ────→    read()
    read()    ←─── 데이터 ────     write()
    close()   ──── EOF ────→       read()
                                    close()
```

### Socket Address 구조체

```c
// Generic (connect, bind, accept에서 사용)
struct sockaddr {
    uint16_t sa_family;     // 프로토콜 패밀리
    char     sa_data[14];   // 주소 데이터
};

// IP 전용
struct sockaddr_in {
    uint16_t        sin_family;   // 항상 AF_INET
    uint16_t        sin_port;     // 포트 (network byte order)
    struct in_addr  sin_addr;     // IP 주소 (network byte order)
    unsigned char   sin_zero[8];  // sockaddr 크기에 맞추기 위한 패딩
};
```

### 주요 함수들

**`socket()` — 소켓 생성**

```c
int fd = socket(AF_INET, SOCK_STREAM, 0);
// fd는 아직 partially opened → read/write 불가
```

**`connect()` — 서버에 연결 (클라이언트)**

```c
int connect(int sockfd, const struct sockaddr *addr, socklen_t addrlen);
// 연결이 완료될 때까지 블로킹
// 성공하면 sockfd로 읽기/쓰기 가능
```

**`bind()` — 소켓에 주소 바인딩 (서버)**

```c
int bind(int sockfd, const struct sockaddr *addr, socklen_t addrlen);
// 서버의 소켓 주소를 sockfd에 연결
```

**`listen()` — 연결 대기 상태로 전환 (서버)**

```c
int listen(int sockfd, int backlog);
// sockfd를 listening socket으로 변환
// backlog: 커널이 큐에 넣을 연결 요청 수 (보통 1024)
```

**`accept()` — 연결 수락 (서버)**

```c
int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);
// 클라이언트의 연결 요청을 기다림 (블로킹)
// addr에 클라이언트의 소켓 주소가 채워짐
// 반환값: Unix I/O에 사용할 수 있는 connected descriptor
```

### Listening Descriptor vs Connected Descriptor

```
단계 1: 서버가 accept()에서 블로킹 — listenfd(3)으로 대기
단계 2: 클라이언트가 connect() 호출 — 연결 요청 전송
단계 3: accept() 리턴 — connfd(4)가 생성되어 실제 통신에 사용
```

- **listenfd**: 서버가 연결 요청을 받기 위한 소켓 (재사용)
- **connfd**: 특정 클라이언트와의 실제 통신용 소켓 (클라이언트마다 새로 생성)

---

## 10. Echo Server/Client 예제

### Echo Server 핵심 구조

```c
// 1. 서버 소켓 준비
memset(&saddr, 0, sizeof(saddr));
saddr.sin_family = AF_INET;
saddr.sin_addr.s_addr = htonl(INADDR_ANY);  // 모든 인터페이스에서 수신
saddr.sin_port = htons(SERV_PORT);

// 2. socket → bind → listen
sfd = socket(AF_INET, SOCK_STREAM, 0);
bind(sfd, (struct sockaddr*)&saddr, sizeof(saddr));
listen(sfd, 1024);

// 3. 무한 루프: accept → fork → echo
while(1) {
    cfd = accept(sfd, (struct sockaddr*)&caddr, &clen);

    if(fork() == 0) {   // 자식 프로세스
        close(sfd);      // 자식은 listening socket 불필요
        echo(cfd);       // 클라이언트와 통신
        close(cfd);
        exit(0);
    } else {             // 부모 프로세스
        close(cfd);      // 부모는 connected socket 불필요
    }
}
```

### Echo Client 핵심 구조

```c
// 1. 서버 주소 준비
saddr.sin_family = AF_INET;
saddr.sin_addr.s_addr = inet_addr("127.0.0.1");
saddr.sin_port = htons(SERV_PORT);

// 2. socket → connect
sfd = socket(AF_INET, SOCK_STREAM, 0);
connect(sfd, (struct sockaddr*)&saddr, sizeof(saddr));

// 3. stdin에서 읽어서 서버로 보내고, 서버 응답을 stdout에 출력
copy(sfd);
close(sfd);
```

> 핵심: `fork()`로 자식 프로세스를 만들어 **동시에 여러 클라이언트**를 처리할 수 있다. 자식은 `sfd`를 닫고, 부모는 `cfd`를 닫는 것이 중요!

---

## 11. Programming Assignment 9 — Remote Shell

이전 과제에서 만든 쉘을 **원격으로 실행**할 수 있는 서버/클라이언트를 구현한다.

### Server 구현 포인트

```c
// accept 후 fork한 자식 프로세스에서:
dup2(cfd, 0);    // stdin → 클라이언트 소켓
dup2(cfd, 1);    // stdout → 클라이언트 소켓
dup2(cfd, 2);    // stderr → 클라이언트 소켓
close(cfd);
close(sfd);
execvp("./shell", args);  // 쉘 실행
```

`dup2`로 표준 입출력을 소켓에 연결하면, 쉘이 소켓을 통해 클라이언트와 직접 통신하게 된다.

### Client 구현 포인트 (`select` 사용)

```c
while(1) {
    FD_ZERO(&fds);
    FD_SET(0, &fds);       // stdin 감시
    FD_SET(sfd, &fds);     // 서버 소켓 감시

    select(sfd + 1, &fds, NULL, NULL, NULL);  // 입력 대기

    if(FD_ISSET(0, &fds)) {
        // stdin → sfd (키보드 입력을 서버로 전송)
        n = read(0, buf, MAX_LINE);
        writen(sfd, buf, n);
    }
    if(FD_ISSET(sfd, &fds)) {
        // sfd → stdout (서버 응답을 화면에 출력)
        n = read(sfd, buf, MAX_LINE);
        writen(1, buf, n);
    }
}
```

`select()`는 여러 fd를 동시에 감시해서, **입력이 준비된 fd만** 처리할 수 있게 해준다. stdin과 소켓을 동시에 모니터링하는 **I/O 멀티플렉싱**의 핵심!

---

## 요약

| 개념 | 핵심 포인트 |
|------|------------|
| Client-Server | 서버 프로세스 + 클라이언트 프로세스, request/response 트랜잭션 |
| Network | 호스트 입장에서 또 하나의 I/O 장치 |
| LAN/Ethernet | Hub(브로드캐스트) vs Bridge(선택적 전달), MAC 주소(48비트) |
| internet/Router | 호환되지 않는 LAN들을 연결, 프로토콜로 통일 |
| IP | 32비트 주소, network byte order(big-endian), htonl/ntohl 변환 |
| TCP | Point-to-point, Full-duplex, Reliable 연결 |
| Socket | 연결의 끝점, IP:Port로 식별 |
| Socket API | socket → bind → listen → accept (서버) / socket → connect (클라이언트) |
| fork + socket | 부모는 cfd 닫기, 자식은 sfd 닫기로 동시 처리 |
| select() | 여러 fd를 동시 감시하는 I/O 멀티플렉싱 |
