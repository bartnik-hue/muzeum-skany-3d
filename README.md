# Cyfrowe Archiwum Muzealne 3D — Przeglądarka modeli i chmur punktów

Statyczna aplikacja webowa (Three.js + ES Modules) do interaktywnego przeglądania zdigitalizowanych obiektów muzealnych w dwóch trybach: teksturowanej siatki **Model 3D (GLB)** oraz kolorowej **Chmury punktów (RGB)**.

## Obiekty w repozytorium

| ID obiektu | Nazwa | Wymiary (W × S × G) | Model webowy (GLB) | Chmura punktów web (PLY RGB) |
|---|---|---|---|---|
| `MPŁW_E_1212` | Rzeźba drewniana „Agnieszka na wsi” (sygn. Uścimiak) | `239,21 × 183,48 × 117,83 mm` | `325 674` trójkątów, `4096×4096 JPG`, `15,06 MB` | `4 338 695` pkt RGB (`62,07 MB`), mediana `0,087 mm`, P95 `0,193 mm` (ręce/tułów: `0,055 mm`) |

## Funkcje przeglądarki

- Przełączanie trybu podglądu: **Model 3D (GLB)** oraz **Chmura punktów (RGB)** w jednej wspólnej skali `1:1` (`1 jednostka = 1 m`).
- Regulacja rozmiaru punktów w trybie chmury punktów (`0,4–3,0 mm`), kąta światła w trybie modelu oraz ekspozycji.
- Predefiniowane rzuty kamery (**Przód**, **Tył**, **Bok**, **Góra**, **Reset**), automatyczny obrót, siatka trójkątów (`Wireframe`) oraz siatka skali (`10 mm/kratka`).
- **Linijka 3D**: pomiar odległości w milimetrach zarówno na powierzchni modelu GLB, jak i na chmurze punktów.
- Panel metadanych technicznych oraz bezpośrednie pobieranie `GLB`, `PLY` i `metadane.json`.

## Zgodność ze specyfikacją i pliki archiwalne

- Chmura punktów w przeglądarce (`4 338 695` pkt RGB, `62,07 MB`) została wygenerowana na bazie ostatecznego modelu `MPŁW_E_1212` z drewnianym spodem oraz lokalnym zagęszczeniem pod dłońmi trzymającymi garnek i przy styku ręki z tułowiem (`mediana 0,055 mm` w tej strefie, globalnie `0,087 mm ≤ 0,50 mm`, `P95 0,193 mm ≤ 1,00 mm`).
- Pełne pliki archiwalne powyżej limitu `100 MB` dla GitHuba (`OBJ HighPoly 8,71 GB`, `STL 3,60 GB`, `XYZ 1,314 GB` oraz projekt roboczy RealityScan) przechowywane są w lokalnym archiwum produkcyjnym.
