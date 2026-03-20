# LA ESPERANZA

Prototipo web (maquetación con datos de ejemplo). Stack: React, Vite, Tailwind.

## Desarrollo local

```bash
npm install
npm run dev
```

## Compilar

```bash
npm run build
```

La salida queda en `dist/`.

## GitHub Pages

El repositorio incluye un workflow que construye el sitio y publica la rama `gh-pages`.

1. En GitHub: **Settings → Pages**: origen **Deploy from a branch**, rama **gh-pages**, carpeta **/ (root)**.
2. Tras el primer push a `main`, espera a que termine el workflow **Deploy to GitHub Pages**.

La URL será `https://AlexAlvarado1290.github.io/<nombre-del-repo>/` (el `<nombre-del-repo>` debe coincidir con el nombre del repositorio en GitHub; el workflow pasa esa ruta al build automáticamente).

Si cambias el nombre del repositorio, no hace falta tocar el código: el workflow usa el nombre actual del repo.
