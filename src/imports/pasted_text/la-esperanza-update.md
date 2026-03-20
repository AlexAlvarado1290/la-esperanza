Actualiza la aplicación existente “La Esperanza - Gestión Agrícola” sin rehacer la arquitectura base. Mantén React + Tailwind CSS v4, mobile-first, react-router con createBrowserRouter, el sistema de componentes actual, Layout.tsx, navegación por rol y el estilo visual agrícola ya implementado.

Aplica estos cambios contextuales y funcionales:

1. MODELO DE USUARIOS Y ACCESO
- NO debe existir autoregistro público.
- Solo el Administrador / Asociación puede crear usuarios nuevos (productores y compradores).
- Mantener modo invitado solo para consultar catálogo.
- El login debe quedar unificado únicamente con teléfono + PIN de 4 dígitos.
- Eliminar o ajustar cualquier referencia a usuario + contraseña si contradice el login principal.
- Agregar soporte para:
  - cambio de PIN por el propio usuario desde su perfil
  - reinicio de PIN por parte del administrador
- El flujo “cuando se registren” debe interpretarse como “cuando el administrador los da de alta en el sistema”.

2. PERFIL DE USUARIO
- Crear pantalla real de “Mi Perfil” para Productor y Comprador.
- Permitir editar solo campos personales no únicos.
- Mantener bloqueados y visualmente deshabilitados los datos únicos:
  - DPI/CUI
  - teléfono principal
  - tipo de usuario
  - identificador único definido por el sistema
- Agregar acción “Cambiar PIN”.
- Para admin, permitir reiniciar PIN de otros usuarios desde la gestión de usuarios.

3. CATÁLOGO DE PRODUCTOS
- En el listado general de productos NO mostrar el nombre del productor de entrada.
- El comprador o invitado primero debe ver solo el producto.
- El productor se muestra hasta entrar al detalle del producto.
- Mantener filtros y búsqueda, pero reforzar orden por:
  - categoría
  - disponibilidad
  - unidad
  - precio referencial
- El invitado puede ver catálogo y detalle, pero no puede solicitar ni negociar.

4. REGLA DE PEDIDOS
- Cada solicitud de compra debe ser de un solo productor.
- Mantener el flujo de solicitud individual por producto/productor.
- El comprador puede agregar mensaje o comentario dentro de la solicitud para negociar.

5. PRODUCTORES
- Un productor puede publicar varios productos al mismo tiempo.
- Puede actualizar cantidades y precio referencial cuando quiera.
- El precio mostrado públicamente es solo referencial.
- El precio final negociado debe quedar visible dentro del acuerdo, no en el catálogo público.

6. ACUERDOS, ENTREGA Y ESTADOS
- Mantener el flujo de acuerdos y entregas, pero actualizar los estados para que reflejen confirmación de ambas partes.
- Secuencia sugerida:
  1. Solicitud enviada
  2. Aceptada
  3. Preparando
  4. Programada
  5. En ruta
  6. Entregada por productor
  7. Confirmada por comprador
- La entrega debe confirmarse en 2 pasos:
  - primero el productor marca “Entregada por productor”
  - luego el comprador marca “Confirmar recepción”
- El estado final debe dejar claro que ambas partes participaron en el cierre.

7. CANCELACIONES E INCIDENCIAS
- Mejorar flujo de cancelación.
- Cuando una solicitud o acuerdo se cancela, registrar:
  - motivo de cancelación
  - quién solicitó la cancelación
  - observación o justificación
- Si un productor no cumple una entrega, debe poder quedar registrada una justificación.
- Mantener opción de reportar inconformidad o incidencia.
- El administrador puede resolver incidencias y forzar cancelación si es necesario.

8. MODERACIÓN Y CONFIANZA
- Agregar una capa ligera de reputación / confianza del usuario.
- No hacer algo complejo; basta con incluir:
  - estado de cuenta: activa / suspendida / bloqueada
  - número de reportes
  - indicador simple de confiabilidad o historial
- El administrador puede activar, desactivar, suspender o bloquear cuentas.
- Esto aplica tanto a compradores como a productores.

9. ADMINISTRADOR / ASOCIACIÓN
- Mantener un solo rol administrativo: Asociación / Administrador.
- No crear múltiples tipos de admin.
- Ese rol representa a la asociación comunitaria y puede ser usado por uno o varios miembros autorizados.
- El admin NO debe comportarse como comprador en el catálogo.
- Quitar la acción “Solicitar” para el admin si aparece.
- El admin debe enfocarse en:
  - gestión de usuarios
  - supervisión de productos
  - supervisión de acuerdos
  - moderación
  - incidencias
  - estadísticas generales
  - reinicio de PIN

10. ESTADÍSTICAS Y REPORTES
- Fortalecer el dashboard o crear una pantalla de reportes para la Asociación.
- Mostrar estadísticas agregadas y anonimizadas, sin exponer quién compró o vendió específicamente.
- Incluir métricas como:
  - productos publicados
  - productores activos
  - compradores activos
  - solicitudes enviadas
  - entregas completadas
  - entregas canceladas
  - incidencias/reportes
  - ventas agregadas por categoría o producto
- Mantener enfoque simple y visual, fácil de entender.

11. PAGOS
- La app NO procesará pagos en línea por ahora.
- Pero sí puede registrar el estado manual del pago dentro del acuerdo si se desea, con algo simple como:
  - pago contra entrega
  - pendiente
  - realizado
- No implementar pasarela ni checkout.

12. UX Y CONTEXTO RURAL
- Mantener diseño mobile-first, simple, legible y con botones grandes.
- Priorizar una experiencia fácil de usar, con poco texto complejo.
- Mantener interfaz visualmente clara, con íconos y señales de estado fáciles de entender.
- Considerar conectividad variable como parte del contexto, aunque no hace falta implementar offline complejo en esta versión.

13. ARCHIVOS / PÁGINAS NUEVAS O AJUSTADAS
Agregar o ajustar estas pantallas según sea necesario:
- Profile.tsx o equivalente
- ChangePin.tsx o flujo dentro de Profile
- opción de reset PIN dentro de Users / UserForm para admin
- Reports.tsx o sección equivalente en Dashboard para estadísticas
- ajustar Products.tsx para ocultar productor en listado
- ajustar ProductDetail.tsx para mostrar productor ahí
- ajustar Agreements.tsx y AgreementDetail.tsx para cancelación con motivo, justificación, doble confirmación de entrega y estado final claro
- ajustar Users.tsx / UserForm.tsx para reflejar que solo admin crea cuentas y reinicia PIN

14. REGLA GENERAL
No rehagas el proyecto desde cero. Conserva estructura, componentes, estilos, roles actuales y flujos ya implementados. Solo corrige y amplía la app con estos cambios para que quede coherente con los últimos acuerdos funcionales del sistema.