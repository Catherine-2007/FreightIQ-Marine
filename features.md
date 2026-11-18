# FreightIQ Marine — Distinguishing Features

These are the features chosen to make this platform more than "a freight
dashboard". Each one below states what it does **and** its honest limits, so
nobody demonstrating the project over-claims.

## 1. Unified GPS + Digital Twin
Click a vessel marker on the map **or** a row in the fleet roster and the same
Digital Twin opens: a data-driven side-profile illustration (hull, hatches
scaled to vessel class, nav lights, funnel smoke, rocking motion, labelled
LOA/beam/draft), an embedded GPS mini-map at the vessel's position, an
animated compass swinging to its heading, speed, a live ETA countdown, and an
estimated CO₂-per-day figure.
*Limit:* all positions are **simulated** (see `data_source` columns); the
architecture (`vessel_positions`) is shaped for a real AIS feed but none is
connected. The illustration is a schematic, not a render of the real ship.

## 2. Animated trade lanes + sonar pings
All 20 origin→India routes are drawn as curved lanes whose dashes flow in the
direction of cargo movement; underway vessels emit sonar-style pings and a
heading-aligned wake. Toggle lanes with the **Trade Lanes** button.
*Limit:* wakes are illustrative (derived from current heading), not real tracks.

## 3. Carbon-emissions estimator (IMO-factor based)
Every vessel-optimizer candidate, shipper recommendation, contract and the
dashboard shows an estimated CO₂ figure, and the optimizer flags the
**🌿 Greenest** port-compatible option (lowest kg CO₂ per tonne of cargo).
Method: `fuel burned = class fuel-burn (t/day) × voyage days × voyages`;
`CO₂ = fuel × 3.114` (IMO standard tonnes-CO₂ per tonne of heavy fuel oil).
*Limit:* uses class-typical consumption, not measured bunker data, and assumes
HFO — treat as a planning estimate, not CII/EEXI compliance reporting.

## 4. Tamper-evident contract ledger
Each contract stores a SHA-256 fingerprint of its committed terms (route,
vessel class, type, voyages, volume, rate, dates, creator). The **Verify
Integrity** button recomputes it server-side and compares; every check is
written to the audit log. Tested end-to-end: editing the stored rate directly
in the database flips the result to *Mismatch detected*.
*Limit:* this is detection, not prevention, and not a blockchain — someone with
full database write access who also rewrites the stored hash would defeat it.
For stronger guarantees, anchor hashes externally or chain them (each hash
including the previous one).

## 5. Live ETA countdowns
Underway vessels show a ticking `Xd HHh MMm SSs` countdown in the roster and
inside the Digital Twin.

## 6. Explainable by design (carried over from earlier builds)
Every optimizer recommendation lists *why* (and why alternatives were
rejected); forecasts expose trend/seasonality/volatility; a counterfactual
what-if simulator shows the causal delta of demand, congestion and bunker
shocks.

## 7. Accessibility & presentation
Reduced-Motion mode **stops** animations (including SVG ones) rather than
merely shortening them; 17 languages incl. RTL (Arabic, Urdu); 11 currencies;
4 themes whose canvas/map/glow effects all recolor live.


## 8. Draft-Aware Load Lab (new)
Open any vessel's Digital Twin. Drag **Cargo on board** from 0 to 100 %: the SVG waterline rises/falls,
a depth gauge shows the keel against every port's draft limit, and a chip per port shows pass/fail,
the metre margin, and the **maximum safe cargo** that port allows. Ports whose LOA/beam limits the
ship exceeds are flagged as impossible regardless of load.
*Method:* light-ship draught = 38 % of the vessel's recorded loaded draft; draught is interpolated
linearly with load; cargo at full load = 94 % of DWT.
*Limit:* planning aid only — ignores trim, water density, squat, tide and under-keel clearance, and
is **not** a class-approved loading computer. The 38 % / 94 % constants are typical bulk-carrier
values, not per-ship data; replace with real hydrostatics if you have them.

## 9. Map Time Machine + Congestion Rings (new)
A slider scrubs ±24 h (with a play button). Underway vessels are projected along heading × speed.
Rings around ports scale and colour with the congestion index.
*Limit:* straight-line dead reckoning — it can cross land and is **not** a route prediction.

## 10. Command Palette (new)
`Ctrl/Cmd+K` or `/`: fuzzy-jump to pages, vessels (opens the twin via `fleet.php#v=<id>`) and ports.


## 11. Laytime & Demurrage planner (new)
`pages/laytime.php`. Inputs: destination port, vessel class, cargo tonnes, contract discharge rate (t/day),
demurrage rate (USD/day, class defaults are editable round numbers), despatch % and extra waiting days.
*Model:* waiting = max(0, current est. turnaround − historical turnaround) + extra days; handling = cargo ÷ port
handling capacity; allowed laytime = cargo ÷ contract rate; overrun × demurrage rate = demurrage, underrun ×
rate × despatch % = despatch; port-side cost/t = (handling charge + demurrage − despatch) ÷ cargo. All 14 ports are
ranked; vessels exceeding a port's draft/LOA/beam are flagged *Not compatible* and ranked last.
*Limit:* indicative only — no notice time, SHINC/SHEX terms, weather days or real berth queues.

## A note on comparisons
These features were chosen because they are uncommon in a typical chartering
dashboard, but this project has **not** been benchmarked against any specific
commercial product, so no claim is made that incumbents lack them.
