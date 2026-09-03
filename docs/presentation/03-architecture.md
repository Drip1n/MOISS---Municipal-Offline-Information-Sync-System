# Architecture

## Concept

```mermaid
flowchart TD
  CMD[Municipal Command] -->|signed update| COU[Courier]
  COU -->|physical transport| NCP[NCP]
  NCP --> PUB[Public Display]
  PUB --> CIT[Citizens]
  NCP -. field report .-> COU
  COU -. return trip .-> CMD
  classDef red fill:#E41613,stroke:#E41613,color:#ffffff
  class CIT red
```

## Normal network vs MOISS

```mermaid
flowchart LR
  subgraph Normal
    M1[Municipality] --> I1[Internet / 4G] --> C1[Citizen]
  end
  subgraph Blackout
    M2[Municipality] --x I2[Internet]
  end
  subgraph MOISS
    M3[Municipality] --> K[Courier] --> N[NCP] --> C3[Citizen]
  end
  classDef red fill:#E41613,stroke:#E41613,color:#ffffff
  class I2 red
```

## Information flow

```mermaid
flowchart LR
  CREATE --> SIGN --> STORE --> CARRY --> SYNC --> DISPLAY
```

## Critical assumption

> A courier-carried device can reliably transport authenticated crisis
> information between digitally isolated municipal locations without internet
> connectivity.
