# planeacion_construccion_mf

Microfrontend de Construcción. Contiene las características, funcionalidades y vistas del componente de Construcción del Cliente del Sistema de Planeación.

## Especificaciones Técnicas

### Tecnologías Implementadas y Versiones

- [Angular 16.1.0](https://angular.io/)
- [Node 16.14.0](https://nodejs.org/en)

### Variables de Entorno

```shell
SECRET_KEY: [SECRET_KEY],
PLANES_CRUD: [API Planes CRUD],
PLANES_FORMULACION_MID: [API MicroMid Formulacion],
PLANES_SEGUIMIENTO_MID: [API MicroMid Seguimiento],
PLANES_ARBOL_MID: [API MicroMid Arbol],
PARAMETROS_SERVICE: [API PARAMETROS SERVICE],
RESOLUCIONES_DOCENTES_SERVICE: [API DOCENTES SERVICE],
GESTOR_DOCUMENTAL_MID: [API GESTOR DOCUMENTAL MID],
OIKOS_SERVICE: [API OIKOS SERVICE],
CONFIGURACION_SERVICE: [Servicio de Configuracion Crud],
CONF_MENU_SERVICE: [Servicio Configuracion Menú],
TERCEROS_SERVICE: [API TERCEROS],
AUTENTICACION_MID: [API AUTENTICACION],
NOTIFICACION_SERVICE: [Servicio de Notificaciones],
TOKEN: {
  AUTORIZATION_URL: [URL de Autorización],
  CLIENTE_ID: [Tipo de Cliente],
  RESPONSE_TYPE: [Tipo de Respuesta],
  SCOPE: [Scope],
  REDIRECT_URL: [URL de redirección],
  SIGN_OUT_URL: [URL de Cerrar Sesión],
  SIGN_OUT_REDIRECT_URL: [URL de redirección],
  AUTENTICACION_MID: [API MID Autenticación],
},
```

### Ejecución del Proyecto

Clonar el proyecto del repositorio de git

```bash
# clone the project
git clone https://github.com/udistrital/planeacion_construccion_mf.git


# enter the project directory
cd planeacion_construccion_mf
```

Iniciar el servidor en local

```bash
# install dependency
npx npm install
or
npm install
# start server
npx ng serve
# Whenever you want to change the port just run
npx ng dev --port = 9528
```

Linter

```bash
# Angular linter
npm run lint
# run linter and auto fix
npm run lint:fix
# run linter on styles
npm run lint:styles
# run lint UI
npm run lint:ci
```

### Ejecución Dockerfile

```bash
# Does not apply
```

### Ejecución docker-compose

```bash
# Does not apply
```

### Ejecución Pruebas

Pruebas unitarias powered by Jest

```bash
# run unit test
npm run test
# Runt linter + unit test
npm run test:ui
```

## Estado CI

```bash
# Developing
```

## Modelo de Datos

```bash
# Developing
```

## Licencia

planeacion_construccion_mf is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (atSara Sampaio your option) any later version.

planeacion_construccion_mf is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with planeacion_construccion_mf. If not, see https://www.gnu.org/licenses/.