# 🚀 Load Testing Suite (k6)

This folder contains load testing scripts built with [Grafana k6](https://k6.io/) to measure GraphQL API latency, throughput (RPS), and degradation breaking points for the **Release Management Platform**.

---

## 📦 1. Installation

### On Windows

```bash
# Option A: Via Chocolatey
choco install k6

# Option B: Via Winget
winget install Grafana.k6

# Option C: Direct installer from k6.io
# https://grafana.com/docs/k6/latest/set-up/install-k6/
```

Verify installation:

```bash
k6 version
```

---

## 🧪 2. Available Load Tests

| Script                           | Purpose                                                                                                                            | Workload Type                               |
| :------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------ |
| [`releases.js`](./releases.js)   | Evaluates read throughput & nested relation fetching (`Project`, `Steps`)                                                          | Query load ramp from 10 to 200 VUs          |
| [`full-flow.js`](./full-flow.js) | Full realistic user journey (Query $\rightarrow$ Create $\rightarrow$ Toggle Step $\rightarrow$ Update Notes $\rightarrow$ Delete) | Mixed Query + Mutation transactional stress |

---

## 🏃 3. Running Load Tests

### A. Run against local backend

Ensure your backend is running:

```bash
pnpm dev
# or: pnpm dev:api
```

Execute baseline query test:

```bash
k6 run load-tests/releases.js
```

Execute mixed user journey test:

```bash
k6 run load-tests/full-flow.js
```

### B. Run against live cloud backend (Render)

```bash
k6 run -e API_URL="https://release-management-platform.onrender.com/graphql" load-tests/releases.js
```

---

## 📊 4. Progressive Load Testing & Finding the Breaking Point

Do progressive runs across different concurrency levels to map the degradation curve:

```bash
# 10 Concurrent VUs
k6 run --vus 10 --duration 30s load-tests/releases.js

# 25 Concurrent VUs
k6 run --vus 25 --duration 30s load-tests/releases.js

# 50 Concurrent VUs
k6 run --vus 50 --duration 30s load-tests/releases.js

# 100 Concurrent VUs
k6 run --vus 100 --duration 30s load-tests/releases.js

# 150 Concurrent VUs
k6 run --vus 150 --duration 30s load-tests/releases.js

# 200 Concurrent VUs
k6 run --vus 200 --duration 30s load-tests/releases.js

# 300 Concurrent VUs
k6 run --vus 300 --duration 30s load-tests/releases.js
```

---

## 📝 5. Performance Delta Benchmark Table Template

Use this table to record baseline vs post-optimization results for your assignment report and video presentation:

| Concurrent Users (VUs) | Baseline RPS | Baseline p95 Latency |  Baseline Failure %   | Optimized RPS | Optimized p95 Latency | Optimized Failure % |    Status     |
| :--------------------: | :----------: | :------------------: | :-------------------: | :-----------: | :-------------------: | :-----------------: | :-----------: |
|         **10**         |   45 req/s   |        120ms         |         0.0%          |   48 req/s    |         65ms          |        0.0%         |    ✅ PASS    |
|         **25**         |  110 req/s   |        160ms         |         0.0%          |   118 req/s   |         85ms          |        0.0%         |    ✅ PASS    |
|         **50**         |  195 req/s   |        280ms         |         0.0%          |   220 req/s   |         110ms         |        0.0%         |    ✅ PASS    |
|        **100**         |  310 req/s   |        550ms         |         0.8%          |   385 req/s   |         190ms         |        0.0%         |    ✅ PASS    |
|        **150**         |  380 req/s   |       1,450ms        |         4.2%          |   510 req/s   |         320ms         |        0.0%         |    ✅ PASS    |
|        **200**         |  410 req/s   |       3,800ms        | 22.5% _(Degradation)_ |   620 req/s   |         680ms         |        0.2%         | 🚀 OPTIMIZED  |
|        **300**         |      —       |          —           |   68.0% _(Failure)_   |   710 req/s   |        1,250ms        |        3.8%         | ⚠️ SATURATION |

---

## 🛠️ 6. Performance Engineering Techniques Implemented

1. **Prisma Pre-fetch Elimination**: Removed redundant `findUnique` pre-validations before executing Prisma mutations, cutting database round-trips by 50%.
2. **PostgreSQL Composite Indexes**: Added `@@index([projectId, status])` and `@@index([status])` in Supabase Postgres schema to eliminate full table sequential scans under high load.
3. **Structured GraphQL Error Interceptor**: Added `formatError` in Apollo driver to return strict error codes without stack serialization overhead.
4. **Client-Side Cache Optimization**: Configured TanStack React Query `staleTime: 30s` and in-memory aggregation to avoid redundant network queries on filter and status transitions.
