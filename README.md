# Portal de equipo con tablero de notas

Aplicación de la prueba técnica: acceso por roles, administración de usuarios, lienzo compartido de notas y dashboard. La entrega se puede ejecutar completamente en local con Docker Compose; no requiere una cuenta AWS ni ningún despliegue remoto.

## Vista general

- **Frontend**: React + Vite (`apps/web`).
- **API**: Node.js + Express + Prisma (`apps/api`).
- **Persistencia**: PostgreSQL 16.
- **Métricas**: función AWS Lambda (`services/metrics-lambda`) ejecutable en local.
- **Infraestructura AWS**: plantilla AWS SAM/CloudFormation (`infrastructure/template.yaml`) con EC2, RDS, Lambda, S3 y CloudFront.

## Requisitos

- **Docker** con el plugin **Docker Compose** (vía recomendada).
- Alternativa sin contenedores: **Node.js 22+**, npm y una instancia **PostgreSQL 16** accesible.
- Para el despliegue AWS (opcional): **AWS CLI** y **SAM CLI**.

## Arranque local (recomendado: Docker Compose)

```bash
docker compose up --build
```

1. El contenedor `db` inicia PostgreSQL 16 y espera a estar sano.
2. El contenedor `api` aplica las migraciones de Prisma (`prisma migrate deploy`), carga las cuentas demo y arranca la API.
3. El contenedor `web` sirve el frontend ya compilado tras un build de producción.

Accesos:

| Servicio | URL |
|---|---|
| Aplicación | http://localhost:8080 |
| API | http://localhost:3001 |

PostgreSQL persiste sus datos en el volumen nombrado `postgres_data`: al reiniciar o volver a levantar el entorno (`docker compose up`), los datos se conservan; el seed es idempotente y solo asegura que las cuentas demo existan.

### Arranque sin Docker (desarrollo con hot reload)

```bash
DATABASE_URL="postgresql://team_notes:team_notes_local@localhost:5432/team_notes?schema=public"
npm install
npm run db:migrate --workspace=api
npm run db:seed --workspace=api
npm run dev
```

Abre `http://localhost:5173` (frontend Vite) y la API queda en `http://localhost:3001`.

## Cuentas de demostración

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@demo.local | Admin123! |
| Usuario | usuario@demo.local | User123! |

- **Administrador**: tablero, dashboard y administración de usuarios.
- **Usuario**: tablero y dashboard (sin acceso a la administración).

Un usuario creado desde la aplicación inicia sesión directamente con el correo y la contraseña que se eligieron al crearlo. Un usuario desactivado no puede iniciar sesión ni continuar usando el área autenticada (su token actual deja de ser válido). Siempre se conserva al menos un administrador activo: no se puede desactivar, eliminar ni cambiar de rol a ese último administrador.

## Instrucciones de uso

1. **Iniciar sesión**: entra con una de las cuentas demo (o con una creada por el administrador). El botón *Salir* del panel lateral cierra la sesión.
2. **Tablero**: todas las notas compartidas aparecen sobre un lienzo libre.
   - **Crear**: botón *+ Nueva nota*.
   - **Editar**: botón *Editar* sobre la nota; cambia el título, el texto y el estado (Pendiente / En curso / Hecho) y confirma con *Guardar*.
   - **Mover**: arrastra la nota con el ratón; al soltarla, su nueva posición se guarda automáticamente.
   - **Eliminar**: botón *×* de la nota.
3. **Dashboard**: muestra el total de notas y su distribución por estado. Se actualiza cada vez que se abre o recarga la página.
4. **Usuarios (solo administrador)**: lista los usuarios y permite crear, editar (nombre, correo, rol), desactivar/reactivar y eliminar.

Los cambios de las notas (contenido, estado y posición) se conservan al recargar la aplicación y al reiniciar el entorno local.

## Persistencia y métricas

La API persiste usuarios y notas —incluidas las coordenadas `x`/`y` de cada nota— en PostgreSQL mediante Prisma. Las migraciones están versionadas en `apps/api/prisma/migrations/`; para crearlas durante desarrollo: `npx prisma migrate dev --name descripcion --schema apps/api/prisma/schema.prisma`.

El dashboard calcula sus métricas con la misma función Lambda que se despliega en AWS: localmente la API invoca `services/metrics-lambda/index.js` y, en AWS, la función queda expuesta por API Gateway. La Lambda puede probarse de forma aislada con:

```bash
node services/metrics-lambda/local.js
```

## Arquitectura

**En local (sin AWS):** un único `docker compose` levanta PostgreSQL, la API (Dockerfile) y el frontend servido desde Nginx (Dockerfile). Ningún servicio depende de una cuenta AWS.

**En AWS (plantilla `infrastructure/template.yaml`):**

- **EC2**: instancia Amazon Linux 2023 con Docker; clona el repositorio, construye la imagen de la API (`Dockerfile.api`) y lanza el contenedor en el puerto 3001.
- **RDS**: PostgreSQL 16 (db.t3.micro), accesible únicamente desde la instancia EC2 mediante su grupo de seguridad.
- **Lambda**: métricas del dashboard expuestas por API Gateway (`POST /dashboard/metrics`).
- **S3 + CloudFront**: almacenamiento y distribución del frontend (`dist/` de `apps/web`).

La plantilla crea además la VPC, subredes públicas, Internet Gateway con sus rutas, grupos de seguridad y el rol/perfil IAM de la instancia. Los recursos se crean y se retiran con AWS SAM/CloudFormation y AWS CLI.

### Despliegue en AWS (opcional)

Paso previo: construir el frontend con la URL de la API apuntando a la instancia EC2 (output `ApiUrl` del stack, disponible tras el primer despliegue) y sincronizar `dist/` al bucket S3 que crea la plantilla (output `FrontendBucket`).

Parámetros de la plantilla:

| Parámetro | Descripción |
|---|---|
| `KeyName` | Par de claves EC2 para conectarse por SSH a la instancia de la API. |
| `RepositoryUrl` | URL HTTPS del repositorio con el código (se usa `git clone` para construir la imagen en EC2). |
| `DBUsername` | Usuario maestro de RDS (por defecto `team_notes`). |
| `DBPassword` | Contraseña maestra de RDS (mín. 8 caracteres). |
| `JwtSecret` | Secreto de firma de los JWT de la API (mín. 16 caracteres). |
| `InstanceType` | Tipo de instancia EC2 (por defecto `t3.micro`). |

```bash
sam build -t infrastructure/template.yaml
sam deploy --guided   # responde a los parámetros anteriores
```

Resultado: frontend en `CloudFrontUrl`, métricas en `MetricsEndpoint` y API en `ApiUrl`.

### Retirar los recursos

```bash
aws cloudformation delete-stack --stack-name NOMBRE_DEL_STACK
```

Elimina todos los recursos creados por la plantilla (EC2, RDS, VPC, Lambda, S3, CloudFront).

## Limitaciones y pendientes conocidos

- El frontend de AWS consume la API de la instancia EC2 por HTTP; para producción conviene HTTPS (por ejemplo, con certificado en CloudFront/ALB).
- La Lambda de métricas del dashboard se despliega con su propio endpoint API Gateway: la conexión de la API de EC2 hacia esa Lambda con autenticación es una mejora pendiente.
- La contraseña de RDS se suministra como parámetro de CloudFormation; en producción debe gestionarse con AWS Secrets Manager.
- No se incluyen tableros múltiples, columnas, asignación de notas, comentarios ni colaboración en tiempo real (fuera del alcance del enunciado).

## Tiempo empleado

Tiempo efectivo total: **7 horas**.

## Entrega

Proyecto completo entregado: El código, los Dockerfiles, la plantilla SAM.
