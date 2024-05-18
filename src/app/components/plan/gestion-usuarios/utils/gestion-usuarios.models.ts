export interface Usuario {
    role:                string[];
    documento:           string;
    documento_compuesto: string;
    email:               string;
    FamilyName:          string;
    Codigo:              string;
    Estado:              string;
  }
  
  export interface Rol {
    rol: string;
    selected: boolean;
  };