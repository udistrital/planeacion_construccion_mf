export interface Vigencia {
    Id:                number;
    Nombre:            string;
    Descripcion:       string;
    Year:              number;
    Ciclo:             string;
    CodigoAbreviacion: string;
    Activo:            boolean;
    AplicacionId:      number;
    InicioVigencia:    string;
    FinVigencia:       string;
    FechaCreacion:     string;
    FechaModificacion: string;
  }
  
  export interface Unidades {
    posicion:                   string;
    correoElectronico:          string;
    DependenciaTipoDependencia: string;
    Id:                         number;
    Nombre:                     string;
    TelefonoDependencia:        string;
    TipoDependencia:            string;
    iconSelected:               string;
  }
  
  export interface Unidad {
    Id:                 string;
    Nombre:             string;
    FechaModificacion?:  string;
  }
  
  
  export interface PlanInteres {
    _id:    string;
    nombre: string;
    fecha_modificacion?: string;
  }
  
  export interface Seguimiento {
    _id:                    string;
    nombre:                 string;
    descripcion:            string;
    plan_id:                string;
    dato:                   string;
    tipo_seguimiento_id:    string;
    estado_seguimiento_id:  string;
    activo:                 boolean;
    fecha_creacion:         string;
    fecha_modificacion:     string;
    __v:                    number;
    fecha_fin:              string;
    fecha_inicio:           string;
    periodo_seguimiento_id: string;
  }
  
  export interface PeriodoSeguimiento {
    _id:                  string
    fecha_inicio:         string
    fecha_fin:            string
    periodo_id:           string
    tipo_seguimiento_id:  string
    activo:               boolean
    unidades_interes:     string
    planes_interes:       string
    fecha_creacion:       string
    fecha_modificacion:   string
    __v?:                 number;
  }
  
  export interface Periodo {
    Activo:            boolean;
    FechaCreacion:     string;
    FechaModificacion: string;
    Id:                number;
    ParametroId:       ParametroId;
    PeriodoId:         PeriodoId;
    Valor:             string;
  }
  
  export interface ParametroId {
    Activo:            boolean;
    CodigoAbreviacion: string;
    Descripcion:       string;
    FechaCreacion:     string;
    FechaModificacion: string;
    Id:                number;
    Nombre:            string;
    NumeroOrden:       number;
    ParametroPadreId?: any;
    TipoParametroId?:  TipoParametroId;
  }
  
  export interface TipoParametroId {
    Activo:            boolean;
    AreaTipoId?:       AreaTipoId;
    CodigoAbreviacion: string;
    Descripcion:       string;
    FechaCreacion:     string;
    FechaModificacion: string;
    Id:                number;
    Nombre:            string;
    NumeroOrden:       number;
  }
  
  export interface AreaTipoId {
    Activo:            boolean;
    CodigoAbreviacion: string;
    Descripcion:       string;
    FechaCreacion:     string;
    FechaModificacion: string;
    Id:                number;
    Nombre:            string;
    NumeroOrden:       number;
  }
  
  export interface PeriodoId {
    Activo:            boolean;
    AplicacionId:      number;
    Ciclo:             string;
    CodigoAbreviacion: string;
    Descripcion:       string;
    FechaCreacion:     string;
    FechaModificacion: string;
    FinVigencia:       string;
    Id:                number;
    InicioVigencia:    string;
    Nombre:            string;
    Year:              number;
  }