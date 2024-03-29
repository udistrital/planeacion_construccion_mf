import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Vigencia } from '../../habilitar-reporte/utils/habilitar-reportes.models';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AreaTipo, Parametro, ParametroPeriodo, TipoParametro } from '../utils/gestion-parametros.models';
import { RequestManager } from 'src/app/components/services/requestManager';
import { environment } from 'src/environments/environment';
import { DataRequest } from 'src/app/@core/interfaces/DataRequest.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-parametros',
  templateUrl: './form-parametros.component.html',
  styleUrls: ['./form-parametros.component.scss']
})
export class FormParametrosComponent implements OnInit, OnChanges{
  formParametros!: FormGroup | any;
  
  vigencia!: Vigencia | any;
  vigenciaSelected!: boolean;
  areaTipo!: AreaTipo;
  tipoParametro!: TipoParametro;
  @Input() banderaAdicion!: boolean;
  @Input() banderaEdicion!: boolean;
  @Input() vigencias!: Vigencia[];
  @Input() parametroPeriodoEdicion!: ParametroPeriodo;
  @Output() limpiar = new EventEmitter<void>();

  constructor(
    private request: RequestManager,
    private fb: FormBuilder,
    ) {
      this.formParametros = this.fb.group({
        concepto: ['', Validators.required],
        valor: ['', Validators.required],
        selectVigencia: ['', Validators.required]
      }) ;
    }

  ngOnInit(): void {
    this.formParametros = new FormGroup({
      concepto: new FormControl(),
      valor: new FormControl(),
      selectVigencia: new FormControl(),
    })
    if(this.banderaEdicion) {
      this.formParametros.reset();
      this.loadDataEdicion();
    } else {
      this.loadAreaTipo();
      this.loadTipoParametro();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Se llama cada vez que hay cambios en las propiedades de entrada
    if (changes['parametroPeriodoEdicion'] && this.banderaEdicion) {
      // Actualiza el formulario con los datos del componente padre
      this.loadDataEdicion();
    }
  }

  loadAreaTipo() {
    this.request.get(environment.PARAMETROS_SERVICE, `/area_tipo?query=CodigoAbreviacion%3APL_SISGPLAN`).subscribe(
      (data: DataRequest) => {
        if (data) {
          this.areaTipo = data.Data[0];
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }
    );
  }

  loadTipoParametro() {
    this.request.get(environment.PARAMETROS_SERVICE, `tipo_parametro?query=CodigoAbreviacion%3AP_SISGPLAN,activo:true`).subscribe(
      (data: DataRequest) => {
        if (data) {
          this.tipoParametro = data.Data[0];
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }
    );
  }

  loadDataEdicion() {
    this.formParametros.get('concepto').setValue(this.parametroPeriodoEdicion.ParametroId.Nombre);
    this.formParametros.get('valor').setValue(this.parametroPeriodoEdicion.Valor);
    this.vigencia = this.vigencias.find(vigencia => vigencia.Id === this.parametroPeriodoEdicion.PeriodoId.Id);
    this.formParametros.get('selectVigencia').setValue(this.vigencia);
  }

  onChangeVigencia(vigencia: Vigencia) {
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
    }
  }

  limpiarForm() {
    this.limpiar.emit();
    this.vigenciaSelected = false;
    this.vigencia = undefined;
    this.formParametros.reset();
  }

  guardar() {
    if (this.formParametros.valid) {
      if(this.banderaAdicion) {
        this.tipoParametro.AreaTipoId = this.areaTipo;
        var parametro: Parametro = {
          Activo: true,
          CodigoAbreviacion: '',
          Descripcion: this.formParametros.get('concepto').value,
          Nombre: this.formParametros.get('concepto').value,
          NumeroOrden: 0,
          ParametroPadreId: null,
          TipoParametroId: this.tipoParametro,
        }
        var parametroPeriodo: ParametroPeriodo = {
          Activo: true,
          ParametroId: undefined,
          PeriodoId: this.vigencia,
          Valor: this.formParametros.get('valor').value,
        }
        this.agregar(parametro, parametroPeriodo);
      } else if (this.banderaEdicion) {
        let parametroPeriodo: ParametroPeriodo = { ...this.parametroPeriodoEdicion };
        this.editar(parametroPeriodo);
      }
    } else {
      this.marcarCamposInvalidos();
    }
  }

  agregar(parametro: Parametro, parametroPeriodo: ParametroPeriodo) {
    this.request.post(environment.PARAMETROS_SERVICE, `parametro`, parametro).subscribe((data: DataRequest) => {
      if (data) {
        let parametroCreado: Parametro = data.Data;
        parametroPeriodo.ParametroId = parametroCreado;
        this.request.post(environment.PARAMETROS_SERVICE, `parametro_periodo`, parametroPeriodo).subscribe((data: DataRequest) => {
          if (data) {
            Swal.fire({
              title: 'Parámetro agregado',
              icon: 'success',
              showConfirmButton: false,
              timer: 4500
            })
            window.location.reload();
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se almacenó el registro por fallas en el servicio, intente nuevamente más tarde`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se almacenó el registro por fallas en el servicio, intente nuevamente más tarde`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  editar(parametroPeriodo: ParametroPeriodo) {
    var parametro: Parametro = parametroPeriodo.ParametroId;
    parametro.Nombre = this.formParametros.get('concepto').value;
    parametro.Descripcion = this.formParametros.get('concepto').value;
    this.request.put(environment.PARAMETROS_SERVICE, `parametro`, parametro, parametro.Id).subscribe((data: DataRequest) => {
      if (data) {
        parametroPeriodo.Valor = this.formParametros.get('valor').value;
        parametroPeriodo.PeriodoId = this.vigencia;
        parametroPeriodo.ParametroId = parametro;
        this.request.put(environment.PARAMETROS_SERVICE, `parametro_periodo`, parametroPeriodo, parametroPeriodo.Id).subscribe((data: DataRequest) => {
          if (data) {
            Swal.fire({
              title: 'Parámetro actualizado',
              icon: 'success',
              showConfirmButton: false,
              timer: 4500
            });
            window.location.reload();
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se almacenó el registro por fallas en el servicio, intente nuevamente más tarde`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se almacenó el registro por fallas en el servicio, intente nuevamente más tarde`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  marcarCamposInvalidos() {
    Object.keys(this.formParametros.controls).forEach(controlName => {
      this.formParametros.get(controlName).markAsTouched();
    });
  }
}
