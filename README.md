# Cyfrowe Archiwum Muzealne 3D — Przeglądarka modeli i chmur punktów

Statyczna aplikacja webowa (Three.js + ES Modules) do interaktywnego przeglądania zdigitalizowanych obiektów muzealnych w dwóch trybach: teksturowanej siatki **Model 3D (GLB)** oraz kolorowej **Chmury punktów (RGB)**.

## Obiekty w repozytorium

| ID obiektu | Nazwa | Wymiary (W × S × G) | Model webowy (GLB) | Chmura punktów web (PLY RGB) |
|---|---|---|---|---|
| `MPŁW_E_1212` | Rzeźba drewniana „Agnieszka na wsi” (sygn. Uścimiak) | `239,21 × 174,71 × 143,03 mm` | `300 018` trójkątów, `4096×4096 JPG`, `45,11 MB` | `2 412 151` pkt RGB (`34,51 MB`), odstępy: mediana `0,105 mm`, P95 `0,215 mm` |

## Funkcje przeglądarki

- Przełączanie trybu podglądu: **Model 3D (GLB)** oraz **Chmura punktów (RGB)** w jednej wspólnej skali `1:1` (`1 jednostka = 1 m`).
- Regulacja rozmiaru punktów w trybie chmury punktów (`0,4–3,0 mm`), kąta światła w trybie modelu oraz ekspozycji.
- Predefiniowane rzuty kamery (**Przód**, **Tył**, **Bok**, **Góra**, **Reset**), automatyczny obrót, siatka trójkątów (`Wireframe`) oraz siatka skali (`10 mm/kratka`).
- **Linijka 3D**: pomiar odległości w milimetrach zarówno na powierzchni modelu GLB, jak i na chmurze punktów.
- Panel metadanych technicznych oraz bezpośrednie pobieranie `GLB`, `PLY` i `metadane.json`.

## Zgodność ze specyfikacją i pliki archiwalne

- Chmura punktów w przeglądarce (`2 412 151` pkt) pochodzi wprost z rzeczywistych punktów pomiarowych pliku archiwalnego `MPŁW_E_1212_chmura_punktow.xyz` (`35 994 991` pkt) bez sztucznego zagęszczania i zachowuje wymagania gęstości dla obiektów `10–100 cm` (`mediana 0,105 mm ≤ 0,50 mm`, `P95 0,215 mm ≤ 1,00 mm`).
- Pełne pliki archiwalne powyżej limitu `100 MB` dla GitHuba (`OBJ HighPoly 8,71 GB`, `STL 3,60 GB`, `XYZ 1,314 GB` oraz projekt roboczy RealityScan) przechowywane są w lokalnym archiwum produkcyjnym.
