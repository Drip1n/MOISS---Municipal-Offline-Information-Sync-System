# Problem

72-hour blackout → power + telecom degrade → municipal digital communication
fails → neighborhood information points become isolated → verified information
can no longer move.

```mermaid
flowchart TD
  A[72-hour blackout] --> B[Power + telecom degrade]
  B --> C[Municipal digital comms fail]
  C --> D[Neighborhood points isolated]
  D --> E[Verified information cannot move]
  classDef red fill:#E41613,stroke:#E41613,color:#ffffff
  class E red
```

> **Challenge:** For municipal crisis coordinators who must distribute verified
> local information during a prolonged blackout, we want to enable reliable
> information delivery to neighborhood emergency points without depending on
> internet or cellular networks.
