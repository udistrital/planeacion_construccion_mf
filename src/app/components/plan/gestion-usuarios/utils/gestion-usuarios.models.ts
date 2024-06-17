export interface Usuario {
  role:                string[];
  documento:           string;
  documento_compuesto: string;
  email:               string;
  FamilyName:          string;
  Codigo:              string;
  Estado:              string;
  Vinculacion?:         Vinculacion[];
  VinculacionSeleccionadaId?:  number;
}
  
export interface Rol {
  rol: string;
  selected: boolean;
};

export interface Vinculacion {
  Id:                     number;
  TerceroPrincipalId:     TerceroPrincipalID;
  TerceroRelacionadoId:   null;
  TipoVinculacionId:      number;
  CargoId:                number;
  DependenciaId:          number;
  Dependencia?:           string;
  Soporte:                number;
  PeriodoId:              number;
  Periodo?:               string;
  FechaInicioVinculacion: Date;
  FechaFinVinculacion:    Date;
  Activo:                 boolean;
  FechaCreacion:          string;
  FechaModificacion:      string;
  Alternancia:            boolean;
}

export interface TerceroPrincipalID {
  Id:                number;
  NombreCompleto:    string;
  PrimerNombre:      string;
  SegundoNombre:     string;
  PrimerApellido:    string;
  SegundoApellido:   string;
  LugarOrigen:       number;
  Activo:            boolean;
  FechaCreacion:     string;
  FechaModificacion: string;
  UsuarioWSO2:       string;
}

export interface Dependencia {
  Id:                number;
  TipoDependenciaId: TipoDependenciaID;
  DependenciaId:     DependenciaID;
}

export interface DependenciaID {
  Id:                         number;
  Nombre:                     string;
  TelefonoDependencia:        string;
  CorreoElectronico:          string;
  DependenciaTipoDependencia: null;
}

export interface TipoDependenciaID {
  Id:     number;
  Nombre: string;
}