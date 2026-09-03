# Demo — 60 seconds

1. Crisis coordinator creates an update.
2. Command generates an offline transfer.
3. Courier receives the update.
4. Courier physically moves to the NCP.
5. NCP receives and verifies the update.
6. Public display updates.

```mermaid
flowchart LR
  A[Create] --> B[Transfer] --> C[Carry] --> D[Verify] --> E[Display]
  classDef red fill:#E41613,stroke:#E41613,color:#ffffff
  class E red
```
