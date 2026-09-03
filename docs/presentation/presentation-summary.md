# MOISS — One Slide

**PROBLEM**
During a 72-hour blackout, municipal digital communication fails and
neighborhood information points go dark.

**IDEA**
An offline store-and-forward system: a courier physically carries signed
municipal updates between disconnected locations.

**DIAGRAM**

```mermaid
flowchart LR
  C[Command] --> K[Courier] --> N[NCP] --> Z[Citizens]
  classDef red fill:#E41613,stroke:#E41613,color:#ffffff
  class Z red
```

**VALIDATION**
Messages `__ / __` · Data integrity `__ %` · Internet used: **NO**

**NEXT**
Automatic proximity sync, then testing with real crisis-management users.

---
*Hackathon prototype — not an official Gemeente Eindhoven system.*
