export interface AreaTipo {
	Id:                number;
	Nombre:            string;
	Descripcion:       string;
	CodigoAbreviacion: string;
	Activo:            boolean;
	NumeroOrden:       number;
	FechaCreacion:     string;
	FechaModificacion: string;
}

export interface TipoParametro {
	Id:                number;
	Nombre:            string;
	Descripcion:       string;
	CodigoAbreviacion: string;
	Activo:            boolean;
	NumeroOrden:       number;
	FechaCreacion:     string;
	FechaModificacion: string;
	AreaTipoId?:       TipoParametro;
}

export interface Parametro {
	Activo:            boolean;
	CodigoAbreviacion: string;
	Descripcion:       string;
	FechaCreacion?:     string;
	FechaModificacion?: string;
	Id?:                number;
	Nombre:            string;
	NumeroOrden:       number;
	ParametroPadreId?: Parametro | null;
	TipoParametroId?:  TipoParametro;
}

export interface Periodo {
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

export interface ParametroPeriodo {
	Activo:            boolean;
	FechaCreacion?:     string;
	FechaModificacion?: string;
	Id?:                number;
	ParametroId:       Parametro | any;
	PeriodoId:         Periodo;
	Valor:             string;
}
