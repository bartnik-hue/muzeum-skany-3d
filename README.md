# Cyfrowe Archiwum Muzealne 3D — Przeglądarka modeli

Statyczna aplikacja webowa (Three.js + ES Modules) do prezentacji i kontroli jakości (QA) zdigitalizowanych obiektów muzealnych.

## Obiekty w repozytorium

| ID obiektu | Nazwa | Wymiary (W × S × G) | Model webowy (GLB) | Jakość geometryczna |
|---|---|---|---|---|
| `MPŁW_E_1212` | Rzeźba drewniana „Agnieszka na wsi” (sygn. Uścimiak) | `239,21 × 174,71 × 143,03 mm` | `300 018` trójkątów, tekstura `4096×4096 JPG`, `45,11 MB` | Mediana `0,0277 mm`, `99,995% ≤ 1,0 mm` |

## Funkcje przeglądarki

- Interaktywna inspekcja 3D w przeglądarce (obrót, zoom, przesuwanie, automatyczny obrót).
- Predefiniowane rzuty kamery: **Przód**, **Tył**, **Bok**, **Góra**, **Reset**.
- Kontrola oświetlenia studyjnego (obrót światła kluczowego, ekspozycja) oraz tryb **Siatka (Wireframe)** i **Siatka skali (10 cm)**.
- **Linijka 3D**: pomiar odległości w milimetrach bezpośrednio na powierzchni obiektu (2 kliknięcia).
- Panel metadanych technicznych oraz galeria **QA** z powiększeniem (lightbox) i bezpośrednim linkiem do pełnego raportu HTML, pliku JSON oraz wykazu SHA-256.

## Struktura repozytorium i pliki archiwalne

Ze względu na limit pojedynczego pliku GitHub (`100 MB`), w repozytorium umieszczono wersję webową **LowPoly GLB** (`45,11 MB`), teksturę **4K JPG** oraz kompletną dokumentację **QA i metadane**. Pełne pliki archiwalne (`OBJ HighPoly 8,71 GB`, `STL 3,60 GB`, `XYZ 1,314 GB` oraz projekt roboczy RealityScan) przechowywane są w lokalnym archiwum produkcyjnym.

## Uruchomienie lokalne

```bash
python -m http.server 8080
```

Następnie otwórz w przeglądarce `http://localhost:8080`.
