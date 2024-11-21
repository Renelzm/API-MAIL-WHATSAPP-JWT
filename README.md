<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a> RLM
</p>

# API SERVICE

## Servicios

* Autenticación con Token
* Servicio de mensajeria whatsapp
* Servicio de mensajeria mail

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

Antes de iniciar el proyecto debe de asegurarse de tener una base de datos postgreSQL corriendo y establecer las variables de entorno

### ENV

```javascript

DB_PASSWORD="pasword inicial bd"
DB_NAME="nombre_base de datos o coleccion de datos"
DB_HOST="url de la base de datos"
DB_PORT=5432
DB_USERNAME="username otorgado de la base de datos"
PORT=3000
JWT_SECRET="establecer secreto de tokens"
MAILER_EMAIL="correo de donde se enviaran los emails @gmail.com"
MAILER_SECRET_KEY="Proveido por gmail se ve algo asi sdad jlhl mklk kljd"
MAILER_SERVICE=gmail
```

## 1- Ejecutar ruta /api/seed con datos de nombre, correo y/o password para crear admin

Este paso crea un administrador general, solo puede ser usado una unica ocación.

```javascript
@Post('/api/seed')
{
    "nombre": "user",
    "correo": "admin3@gmail.com",
    "password": "123456"
}
```

2 Popular los datos de roles en la base de datos

## STRUCTURE

ADMINISTRADOR:
Crea Roles
Crea usuarios
  
NOTES:
1.- Se autentica token por id o email solo es necesario configurar en auth service en login y create.
  El usuario se compone de (rol, password, nombre, correo, entidad?)
  Si el rol no se encuentra es imposible crear el usuario.
2.- Tiene un guard de roles para saber que rol puede acceder:

## En el controlador

```javascript
@Get(':id')
@RoleProtected('admin', 'general')
@UseGuards(AuthGuard('jwt'), UserRoleGuard )
```

# SERVICIOS GENERALES

NOTA: Es necesario revisar los services en msg para poderlos usar en medio de la app y no usarlas sin protección por toda la aplicacion.

## Servicio de whatsapp

```javascript
{
  "to": "521 + 10 digitos de numero", 
  "message": "¡Hola, este es un mensaje de prueba!"
}
```

### Metodos para diferentes sesiones o una por defecto

NOTA:
/api/msg/send = base de whatsapp servicio fijo.
/api/msg/send/numerowhatsapp = base de whatsapp servicio dinamico diferentes sesiones a base del numero.

INICIO QR:
/api/msg/qr/{numero}
/api/msg/qr BASE

```javascript
@Post('local/')
body: { to: string[]; message: string }
  
@Post('send/:session')
body: { to: string[]; message: string }
session = "numero de celular"
```

## 3.- Servicio de correo

```javascript
{
    to: string | string[];
    subject: string;
    htmlBody: string;
}
```
