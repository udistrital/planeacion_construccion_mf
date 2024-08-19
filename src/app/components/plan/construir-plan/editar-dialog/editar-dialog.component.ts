import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RequestManager } from 'src/app/components/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { MatRadioChange } from '@angular/material/radio';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-editar-dialog',
  templateUrl: './editar-dialog.component.html',
  styleUrls: ['./editar-dialog.component.scss']
})
export class EditarDialogComponent implements OnInit {
  formularioModificado: boolean = false;
  formEditar!: any;
  aplicativoId!: string;
  fechaCreacion!: Date;
  nombre!: string;
  descripcion!: string;
  activoS!: string;
  tipoDato!: string;
  tipoPlan!: string;
  required!: boolean;
  opciones!: string;
  formatoS!: string;
  padre!: string;
  banderaTablaS!: string;
  nivel!: number;
  opt!: boolean;
  tiposPlanes!: any[];
  vigencias!: any[];
  vigencia_aplica_selected!: any;

  vTipo!: boolean;
  vRequired!: boolean;
  vOpciones!: boolean;
  vFormato!: boolean;
  vParametros!: boolean;
  vBandera!: boolean;
  vTipoPlan!: boolean;
  vObligatorio!: boolean;
  vVigenciaAplicaTipoPlan!: boolean;
  vCargando!: boolean;
  hijos_formato_paf: any[] | undefined;
  hijos_plan: any[] | undefined;
  nivel_id: any;

  tipos: tipoDato[] = [
    { value: 'numeric', viewValue: 'Numérico' },
    { value: 'input', viewValue: 'Texto' },
    { value: 'select', viewValue: 'Select' }
  ]
  visibleType = {
    value: this.data.subDetalle.type,
    disabled: false
  };
  visibleRequired = {
    value: this.data.subDetalle.required,
    disabled: false
  };
  visibleOpciones = {
    value: this.data.subDetalle.options,
    disabled: false
  };
  visibleFormato = {
    value: String(this.data.sub.formato),
    disabled: false
  };
  visibleBandera = {
    value: String(this.data.sub.banderaTabla),
    disabled: false
  };
  listaOpciones: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private cdRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<EditarDialogComponent>,
    private request: RequestManager,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.vCargando = true;
    this.aplicativoId = data.sub.aplicativo_id;
    this.fechaCreacion = data.sub.fecha_creacion;
    this.nombre = data.sub.nombre;
    this.padre = data.sub.padre;
    if (data.sub.vigencia_aplica) {
      this.vigencia_aplica_selected = data.sub.vigencia_aplica;
    } else {
      this.vigencia_aplica_selected = null;
    }
    this.descripcion = data.sub.descripcion;
    this.activoS = String(data.sub.activo);
    this.tipoPlan = data.sub.tipo_plan_id;
    this.formatoS = String(data.sub.formato);
    this.tipoDato = data.subDetalle.type;
    this.required = data.subDetalle.required;
    this.opciones = data.subDetalle.options;
    this.banderaTablaS = String(data.sub.banderaTabla);
    this.nivel = data.nivel;
    this.opt = false;
    this.vParametros = false;
    this.vBandera = false;
    this.vObligatorio = false;
    if(data.sub.hijos){
      this.hijos_formato_paf = data.sub.hijos.hijos_formato_paf;
      this.hijos_plan = data.sub.hijos.hijos_plan;
      this.nivel_id = data.sub.nivel_id;
    } else {
      this.hijos_formato_paf = undefined;
      this.hijos_plan = undefined;
      this.nivel_id = undefined;
    }
  }

  async ngOnInit(): Promise<void> {
    this.formEditar = this.formBuilder.group({
      aplicativo_id: [this.aplicativoId, Validators.required],
      fecha_creacion: [this.fechaCreacion, Validators.required],
      descripcion: [this.descripcion, Validators.required],
      nombre: [this.nombre, Validators.required],
      activo: [this.activoS, Validators.required],
      tipo_plan_id: [this.tipoPlan, Validators.required],
      vigencia_aplica: [[]],
      formato: [this.formatoS, Validators.required],
      parametro: ['', Validators.required],
      tipoDato: [this.tipoDato, Validators.required],
      requerido: [this.required, Validators.required],
      banderaTabla: [this.banderaTablaS, Validators.required],
      opciones: ['', [Validators.maxLength(80)]]
    });

    this.verificarDetalle();
    // Suscribe a los cambios en el formulario
    this.formEditar.valueChanges.subscribe(() => {
      this.formularioModificado = true;
      // Marca el componente para la detección de cambios
      this.cdRef.detectChanges();
    });
  }

  adicionarOpcion() {
    const opcion = this.formEditar.get('opciones').value.trim();
    if (opcion && !this.listaOpciones.includes(opcion)) {
      this.listaOpciones.push(opcion);
      this.actualizarOpciones(); // Actualizar el valor del campo 'opciones'
      this.formEditar.get('opciones').setValue(''); // Limpiar el input después de añadir la opción
    }
  }
  eliminarOpcion(index: number) {
    this.listaOpciones.splice(index, 1);
    this.actualizarOpciones();
    this.formEditar.get('opciones').setValue(''); // Limpiar el input después de añadir la opción
  }
  actualizarOpciones() {
    // Actualizar el valor del campo 'opciones' con todas las opciones añadidas
    this.formEditar.get('opciones').setValue(this.listaOpciones.join(','));
  }
  close(): void {
    // Actualizar el valor del campo 'opciones' con las opciones actuales
    this.actualizarOpciones();
    this.dialogRef.close(this.formEditar.value);

  }
  closecancelar(): void {
    this.dialogRef.close();
  }

  onOpenedChange(isOpened: boolean) {
    if (isOpened) {
      Swal.fire({
        title: 'Información',
        text: 'Por favor verificar el tipo de plan de acción. Actualmente NO soportado por el módulo de reportes.',
        icon: 'info',
        confirmButtonText: 'OK'
      });
    }
  }

  mostrarMensajeCarga(): void {
    Swal.fire({
      title: 'Cargando datos...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  async loadPeriodos() {
    return new Promise((resolve) => {
      this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: any) => {
        if (data) {
          this.vigencias = data.Data;
          resolve(true);
        }
      }, (error: any) => {
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      })
    });
  }

  async compararTipoPlan_PED_PI() {
    let tipoPlanPI: any;
    let tipoPlanPED: any;
    this.vVigenciaAplicaTipoPlan = false;
    this.tiposPlanes.forEach(tipoPlan => {
      if (tipoPlan.codigo_abreviacion == 'PLI_SP') {
        tipoPlanPI = tipoPlan;
      }
      if (tipoPlan.codigo_abreviacion == 'PD_SP') {
        tipoPlanPED = tipoPlan;
      }
    });
    if (this.formEditar.get('tipo_plan_id').value == tipoPlanPED._id || this.formEditar.get('tipo_plan_id').value == tipoPlanPI._id) {
      //? Se adiciona control para seleccionar vigencias a las que aplica el PI o PED
      this.formEditar.addControl('vigencia_aplica', this.formBuilder.control([], Validators.required));
      this.vVigenciaAplicaTipoPlan = true;
      if (this.vigencia_aplica_selected != null) this.setSelectedVigencias();
    } else {
      //? Se elimina control para seleccionar vigencias a las que aplica el PI o PED
      this.vVigenciaAplicaTipoPlan = false;
      this.formEditar.removeControl('vigencia_aplica');
    }
  }

  setSelectedVigencias(): void {
    let arrayVigencias = JSON.parse(this.vigencia_aplica_selected);
    const selectedValues = arrayVigencias.map((v: any) => JSON.stringify(v));
    this.formEditar.get('vigencia_aplica').patchValue(selectedValues);
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  isFormularioModificado(): boolean {
    return this.formularioModificado;
  }

  resetFormularioModificado(): void {
    this.formularioModificado = false;
  }

  deshacer() {
    this.formEditar.reset();
    this.resetFormularioModificado();
  }

  onChange(event: boolean) {
    if (event) {
      this.opt = true;
      this.formEditar.get('opciones').enable();
    } else {
      this.opt = false;
      this.formEditar.get('opciones').disable();
    }
  }

  async verificarDetalle() {
    if (this.data.ban == "plan") {
      await this.loadPeriodos();
      await this.loadTiposPlan();
      await this.compararTipoPlan_PED_PI();
      this.vTipo = false;
      this.vFormato = true;
      this.vTipoPlan = true;
      this.opt = false;
      this.vParametros = false;
      this.vBandera = false;
      this.formEditar.get('parametro').disable();
      this.formEditar.get('tipoDato').disable();
      this.formEditar.get('opciones').disable();
      this.formEditar.get('banderaTabla').disable();
    } else if (this.data.ban == "nivel") {
      this.vTipo = true
      this.vFormato = false
      this.opt = false
      this.vTipoPlan = false;
      this.formEditar.get('tipoDato').enable();
      this.formEditar.get('tipo_plan_id').disable();
      if (this.tipoDato == 'select') {
        this.opt = true;
        this.vParametros = true;
        this.formEditar.get('parametro').setValue("true");
        this.formEditar.get('opciones').enable();
        this.formEditar.get('tipoDato').enable();
        this.formEditar.get('requerido').enable();
        // Inicializar listaOpciones con el valor actual del campo 'opciones'
        this.listaOpciones = this.opciones.split(',').filter(opcion => opcion.trim() !== '');
      } else if (this.tipoDato == 'input' || this.tipoDato == 'numeric') {
        this.opt = false;
        this.vParametros = true;
        this.formEditar.get('parametro').setValue("true");
        this.formEditar.get('tipoDato').enable();
        this.formEditar.get('requerido').enable();
        this.formEditar.get('opciones').disable();
      }
      if(this.hijos_formato_paf && this.hijos_formato_paf && this.nivel_id) {
        await this.verificarNivelNoInactivar();
      }
    }
    if (this.tipoDato == "undefined" || this.tipoDato == undefined) {
      this.vTipo = true;
      this.vParametros = false;
      this.formEditar.get('parametro').setValue("false");
      this.formEditar.get('tipoDato').disable();
      this.formEditar.get('requerido').disable();
      this.formEditar.get('opciones').disable();
    }
    if (this.formatoS == "undefined" || this.formatoS == undefined) {
      this.vFormato = false
    }
    if (this.nivel > 1) {
      this.formEditar.get('banderaTabla').setValue(this.visibleBandera.value);
    }
    if (this.formEditar.get('parametro').value == "true") {
      this.vBandera = true;
    }
    if (this.formEditar.get('banderaTabla').value == "false") {
      this.vObligatorio = true;
    }
    Swal.close();
    this.vCargando = false;
  }

  verificarNivel(event: MatRadioChange) {
    if (event.value == "false") {
      this.vParametros = false;
      this.vBandera = false;
      this.formEditar.get('banderaTabla').setValue("false");
      this.formEditar.get('tipoDato').disable();
      this.formEditar.get('requerido').disable();
      this.formEditar.get('opciones').disable();
    } else if (event.value == "true") {
      this.vParametros = true;
      this.vBandera = true;
      this.vObligatorio = false;
      this.formEditar.get('banderaTabla').setValue("");
      this.formEditar.get('tipoDato').setValue("");
      this.formEditar.get('tipoDato').enable();
      this.formEditar.get('requerido').enable();
      if (this.opt) {
        this.formEditar.get('opciones').enable();
      }
    }
    this.verificarBandera(this.formEditar.get('banderaTabla').value);
  }

  verificarBandera(event: any) {
    if (event == "true") {
      this.vObligatorio = false;
      this.formEditar.get('requerido').setValue("true");
    } else if (event == "false") {
      this.vObligatorio = true;
    }
  }

  async loadTiposPlan() {
    return new Promise((resolve) => {
      this.request.get(environment.PLANES_CRUD, `tipo-plan?query=activo:true`).subscribe(
        (data: any) => {
          if (data) {
            this.tiposPlanes = data.Data;
            resolve(true);
          } else {
            Swal.fire({
              title: 'Error en la operación',
              text: 'No se encontraron datos registrados',
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          }
        },
        (error: any) => {
          Swal.fire({
            title: 'Error en la operación',
            text: 'No se encontraron datos registrados',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        }
      );
    });
  }

  vigenciaToJson(vigencia: { Id: number, Nombre: string }): string {
    return JSON.stringify({ Id: vigencia.Id, Nombre: vigencia.Nombre });
  }

  onOpenedChangeVigencia(isOpened: boolean) {
    if (isOpened) {
      Swal.fire({
        title: 'Información',
        text: 'Una vez guardadas las vigencias a las que aplicará el plan NO está permitido desmarcarlas. Para más información comunicarse con computo@udistrital.edu.co',
        icon: 'info',
        confirmButtonText: 'OK'
      });
    }
  }

  isDisabledVigencia(vigencia: any) {
    if (this.vigencia_aplica_selected != null) {
      let vigencias = JSON.parse(this.vigencia_aplica_selected);
      return vigencias.some((v: any) => v.Id == vigencia.Id);
    }
    return false;
  }

  async verificarNivelNoInactivar() { //? Función para verificar los niveles que NO se pueden inactivar de un formato de tipo PAF
    let vDisabled: boolean = false;
    this.hijos_plan!.forEach(hijo => {
      if(hijo.id == this.nivel_id){
        vDisabled = this.searchRefInArray(this.hijos_formato_paf, hijo.ref);
      }
      if(hijo.sub && hijo.sub.length > 0){
        hijo.sub.forEach((subHijo:any) => {
          if(subHijo.id == this.nivel_id){
            vDisabled = this.searchRefInArray(this.hijos_formato_paf, subHijo.ref);
          }
          if(subHijo.sub && subHijo.sub.length > 0){
            subHijo.sub.forEach((subSubHijo:any) => {
              if(subSubHijo.id == this.nivel_id){
                vDisabled = this.searchRefInArray(this.hijos_formato_paf, subSubHijo.ref);
              }
            });
          }
        });
      }
    });
    if(vDisabled) {
      this.formEditar.get('nombre').disable();
      this.formEditar.get('activo').disable();
      this.formEditar.get('parametro').disable();
      this.formEditar.get('requerido').disable();
    } else {
      this.formEditar.get('nombre').enable();
      this.formEditar.get('activo').enable();
      this.formEditar.get('parametro').enable();
      this.formEditar.get('requerido').enable();
    }
  }

  searchRefInArray(array: any[] | undefined, ref: string): boolean {
    // Recorremos el array en el nivel actual
    if (array != undefined) {
      for (const item of array) {
        // Comparamos si el ref coincide con el id del item
        if (item.id === ref) {
          return true;
        }

        // Si el item tiene hijos (propiedad 'sub'), hacemos una búsqueda recursiva
        if (item.sub && item.sub.length > 0) {
          const foundInSub = this.searchRefInArray(item.sub, ref);
          if (foundInSub) {
            return true;
          }
        }
      }
    }

    // Si no encontramos coincidencia, devolvemos false
    return false;
  }
}

interface tipoDato {
  value: string;
  viewValue: string;
}
