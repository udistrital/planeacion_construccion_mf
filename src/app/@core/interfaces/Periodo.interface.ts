export interface Periodo {
  Activo:            boolean;
  FechaCreacion:     string;
  FechaModificacion: string;
  Id:                number;
  ParametroId:       ParametroId;
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
  ParametroPadreId?: null;
  TipoParametroId?:  ParametroId;
  AreaTipoId?:       ParametroId;
}
