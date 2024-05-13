// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    apiUrl:"http://localhost:4206/",
    SECRET_KEY: 'MySecretKey',
    PLANES_CRUD: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8523/',
    PLANES_MID: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8524/v1/',
    PLANES_FORMULACION_MID: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8551/v1/',
    PLANES_SEGUIMIENTO_MID: 'http://pruebasapi3.intranetoas.udistrital.edu.co:8558/v1/',
    PLANES_ARBOL_MID: 'http://pruebasapi.intranetoas.udistrital.edu.co:8550/v1/',
    PARAMETROS_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8510/v1/',
    GESTOR_DOCUMENTAL_MID: 'http://pruebasapi2.intranetoas.udistrital.edu.co:8199/v1/',
    OIKOS_SERVICE: 'http://api.intranetoas.udistrital.edu.co:8087/v1/',
    CONFIGURACION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/',
    CONF_MENU_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/menu_opcion_padre/ArbolMenus/',
    TERCEROS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/terceros_crud/v1/',
    AUTENTICACION_MID: 'http://pruebasapi.intranetoas.udistrital.edu.co:8110/v1/',
    NOTIFICACION_SERVICE: 'wss://pruebasapi.portaloas.udistrital.edu.co:8116/ws',
    TOKEN: {
        AUTORIZATION_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oauth2/authorize',
        CLIENTE_ID: 'e36v1MPQk2jbz9KM4SmKhk8Cyw0a',
        RESPONSE_TYPE: 'id_token token',
        SCOPE: 'openid email',
        REDIRECT_URL: 'http://localhost:4206/',
        SIGN_OUT_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oidc/logout',
        SIGN_OUT_REDIRECT_URL: 'http://localhost:4206/',
        AUTENTICACION_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/autenticacion_mid/v1/token/userRol',
      },
}