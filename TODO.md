# TODO: Implementar Drag and Drop para Mover Archivos entre Carpetas

## Tareas Pendientes
- [ ] Envolver el componente principal con DndContext
- [ ] Hacer que los archivos sean arrastrables (FileList.tsx)
- [ ] Hacer que las carpetas sean receptores de drop (FolderList.tsx)
- [ ] Implementar lógica para mover archivos en la base de datos
- [ ] Recargar archivos después de mover
- [ ] Probar la funcionalidad

## Información Recopilada
- Dependencias instaladas: @dnd-kit/core y @dnd-kit/sortable
- Estructura: Archivos en FileList, carpetas en FolderList, lógica principal en index.tsx
- Base de datos: Tabla "archivos" con campo folder_id

## Plan de Edición
1. Editar index.tsx para agregar DndContext y función moveFile
2. Editar FileList.tsx para hacer archivos arrastrables
3. Editar FolderList.tsx para hacer carpetas receptores de drop
