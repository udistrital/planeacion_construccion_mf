// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    entorno: 'test',
    autenticacion: true,
    notificaciones: false,
    menuApps: false,
    appname: 'PLANEACION',
    appMenu: 'PLANEACION',
    apiUrl:"http://localhost:4206/",
    SECRET_KEY: 'MySecretKey',
    PLANES_CRUD: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/planes_crud/',
    PLANES_FORMULACION_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/planeacion_formulacion_mid/v1/',
    PLANES_SEGUIMIENTO_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/planeacion_seguimiento_mid/v1/',
    PLANES_ARBOL_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/planeacion_arbol_mid/v1/',
    PARAMETROS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/parametros/v1/',
    GESTOR_DOCUMENTAL_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/gestor_documental_mid/v1/',
    OIKOS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/oikos_crud_api/v2/',
    CONFIGURACION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/',
    CONF_MENU_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/menu_opcion_padre/ArbolMenus/',
    TERCEROS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/terceros_crud/v1/',
    AUTENTICACION_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/autenticacion_mid/v1/',
    NOTIFICACION_SERVICE: 'wss://pruebasapi.portaloas.udistrital.edu.co:8116/ws',
    TOKEN: {
      AUTORIZATION_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oauth2/authorize',
      CLIENTE_ID: 'YN4iI_fMZvdOe1EhAaxHLdQonYsa',
      RESPONSE_TYPE: 'id_token token',
      SCOPE: 'openid email',
      REDIRECT_URL: 'http://localhost:4206/',
      SIGN_OUT_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oidc/logout',
      SIGN_OUT_REDIRECT_URL: 'http://localhost:4206/',
      AUTENTICACION_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/autenticacion_mid/v1/token/userRol',
    },
}