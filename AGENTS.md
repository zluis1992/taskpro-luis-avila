# Instrucciones para agentes

- Todas las respuestas deben estar redactadas en español.
- Puedes instalar cualquier dependencia necesaria en el entorno para completar las tareas encomendadas, registrando cualquier limitación encontrada.
- Antes de finalizar cualquier tarea, realiza compilaciones o builds para los tres módulos principales cuando sea posible: backend (.NET mediante `dotnet build`), frontend (Angular mediante `npm run build` o al menos `ng test --watch=false`) y la aplicación de Python (`python manage.py check`). Si algún comando no se puede ejecutar en el entorno, documenta claramente la limitación.
- Ejecuta las suites de pruebas unitarias de los tres módulos (`dotnet test`, `ng test --code-coverage --watch=false`, y `coverage run manage.py test`) y reporta la cobertura de líneas calculando un agregado global (suma de líneas cubiertas/total) usando los reportes generados por cada herramienta. Si alguna suite no puede ejecutarse, explica el motivo y el impacto.
- Cada tarea que toque código debe añadir o modificar pruebas unitarias relevantes en cada módulo afectado con el objetivo de acercar la cobertura global a ≥95 %. Si la cobertura no alcanza el objetivo, documenta los bloqueos y propone pasos siguientes.
- Revisa y comenta cualquier implicación de seguridad y rendimiento derivada de los cambios, así como las mitigaciones aplicadas o pendientes.
- No ajustes los umbrales de cobertura para ocultar código sin probar; cualquier exclusión debe estar justificada explícitamente en la descripción del cambio.
