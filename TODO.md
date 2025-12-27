# Plan para integrar estilos y animaciones staggered al sidebar

## Información recopilada:
- El sidebar actual es fijo en desktop, colapsable, y overlay en móvil.
- El CSS staggered define un menú de overlay con animaciones staggered en los items.
- El usuario quiere mantener la estructura pero aplicar estilos staggered y hacerlo desplegable.

## Plan:
- [ ] Actualizar Header.tsx para agregar un botón de toggle en desktop para abrir/cerrar el sidebar como overlay.
- [ ] Modificar Sidebar.tsx para usar clases staggered-menu cuando esté abierto, convirtiéndolo en overlay con animaciones.
- [ ] Agregar divs de prel layers para el efecto de animación.
- [ ] Estilizar los items de navegación con clases sm-panel-item, fuente grande, etc.
- [ ] Agregar animacion es CSS para el efecto staggered en sidebar-staggered.css.
- [ ] Asegurar que el toggle funcione correctamente en desktop y móvil.

## Archivos dependientes:
- web-app/src/components/ui/Header.tsx
- web-app/src/components/ui/Sidebar.tsx
- web-app/src/styles/sidebar-staggered.css

## Pasos de seguimiento:
- [ ] Probar la funcionalidad en desktop y móvil.
- [ ] Ajustar estilos si es necesario.
