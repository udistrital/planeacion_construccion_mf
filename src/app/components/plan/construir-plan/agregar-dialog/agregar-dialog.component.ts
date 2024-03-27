import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';

interface tipoDato{
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-agregar-dialog',
  templateUrl: './agregar-dialog.component.html',
  styleUrls: ['./agregar-dialog.component.scss']
})

export class AgregarDialogComponent implements OnInit{
  formAgregar!: any;
  tipos: tipoDato[] = [
    {value: 'numeric', viewValue:'Numérico'},
    {value: 'input', viewValue:'Texto'},
    {value: 'select', viewValue:'Select'}
  ]
  control = { value: '', disabled: false,visible: false };
  opt!: boolean;
  vBandera!: boolean;
  vObligatorio!: boolean;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AgregarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.opt = false;
    }

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.formAgregar = this.formBuilder.group({
      descripcion: ['', Validators.required],
      nombre: ['', Validators.required],
      activo: ['', Validators.required],
      tipoDato: ['', this.control, Validators.required],
      requerido: ['', this.control, Validators.required],
      parametro: ['', Validators.required],
      bandera: ['', Validators.required],
      opciones: ['', Validators.required]
    });
    if (this.opt == false){
      this.formAgregar.get('opciones').disable();
    }
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required', )) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  deshacer(){
    this.formAgregar.reset();
  }

  onChange(event: string){
    if (event == 'select'){
      this.opt = true;
      this.formAgregar.get('opciones').enable();
    } else {
      this.opt = false;
      this.formAgregar.get('opciones').disable();
    }
  }

  verificarNivel(event: MatRadioChange){
    if(event.value == "false"){
      this.control = {value: '', disabled: true, visible: false }
      this.vBandera = false;
      this.formAgregar.get('bandera').setValue("false");
      this.formAgregar.get('tipoDato').disable();
      this.formAgregar.get('requerido').disable();
      this.formAgregar.get('opciones').disable();
    }else if (event.value == "true"){
      this.control = { value: '', disabled: false, visible: true }
      this.vBandera = true;
      this.vObligatorio = false;
      this.formAgregar.get('bandera').setValue("");
      this.formAgregar.get('tipoDato').setValue("");
      this.formAgregar.get('tipoDato').enable();
      this.formAgregar.get('requerido').enable();
      if (this.opt){
        this.formAgregar.get('opciones').enable();
      }
    }
    this.verificarBandera(this.formAgregar.get('bandera').value);
  }

  verificarBandera(event: string) {
    if (event == "true") {
      this.vObligatorio = false;
      this.formAgregar.get('requerido').setValue("true");
    } else if (event == "false"){
      this.vObligatorio = true;
    }
  }
}
