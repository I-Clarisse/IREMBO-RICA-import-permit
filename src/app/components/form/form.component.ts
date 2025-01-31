import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import emailjs from '@emailjs/browser';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})
export class FormComponent implements OnInit {
  importPermitForm !: FormGroup;
  isSubmitting = false;
  submitMessage = '';
  submitStatus: 'success' | 'error' | '' = '';
  showDebug = false; // Set to true to see form state;
  districts: string[] = [
    'Nyarugenge', 'Gasabo', 'Kicukiro', 'Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo',
    'Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango',
    'Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana',
    'Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'
  ];

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // emailjs.init("YOUR_PUBLIC_KEY");
    emailjs.init("6c1oV4SgqgFfAu1W5");

    // Subscribe to form value changes if needed
    this.importPermitForm.valueChanges.subscribe(values => {
      console.log('Form values changed:', values);
    });

    // Subscribe to form status changes if needed
    this.importPermitForm.statusChanges.subscribe(status => {
      console.log('Form status changed:', status);
    });
  }

  // initializeForm() {
  //   this.importPermitForm = this.fb.group({
  //     idNumber: ['', [
  //       Validators.required,
  //       Validators.minLength(12),
  //       Validators.pattern('^[0-9]*$')
  //     ]],
  //     testLanguage: ['', Validators.required],
  //     district: ['', Validators.required]
  //   })
  // }

  initializeForm(): void {
    this.importPermitForm = this.fb.group({
      citizenship: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      idNumber: ['', [
        Validators.required,
        Validators.minLength(16),
        Validators.maxLength(16),
        Validators.pattern(/^[0-9]{16}$/)
      ]],
      passportNumber: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(9),
        Validators.pattern(/^[A-Z0-9]{8,9}$/)  // Uppercase letters and numbers only
      ]],
      otherNames: ['', Validators.required],
      surname: ['', Validators.required],
      nationality: ['', Validators.required],
      ownerDistrict: ['', Validators.required],
      businessDistrict: ['', Validators.required],

      // phoneNumber: ['', Validators.pattern('^[0-9]{10}$')],
      email: ['', [Validators.required, Validators.email]],
      businessType: ['', Validators.required],
      companyName: ['', Validators.required],
      tinNumber: ['', [
        Validators.required, 
        Validators.pattern(/^[0-9]+$/)
      ]],
      registrationDate: ['', Validators.required],
      importPurpose: ['', Validators.required],
      specifyPurpose: [''],
      productCategory: ['', Validators.required],
      productName: ['', Validators.required],
      weight: ['', Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')],
      description: ['', Validators.required],
      unitMeasurement: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]]
    });

    // Conditional validation for passportNumber or idNumber
    this.importPermitForm.get('citizenship')?.valueChanges.subscribe(value => {
      if (value === 'rwandan') {
        this.importPermitForm.get('idNumber')?.setValidators([Validators.required]);
        this.importPermitForm.get('passportNumber')?.clearValidators();
      } else if (value === 'foreigner') {
        this.importPermitForm.get('passportNumber')?.setValidators([Validators.required]);
        this.importPermitForm.get('idNumber')?.clearValidators();
      }
      this.importPermitForm.get('idNumber')?.updateValueAndValidity();
      this.importPermitForm.get('passportNumber')?.updateValueAndValidity();
    });

    // Conditional validation for specifyPurpose
    this.importPermitForm.get('importPurpose')?.valueChanges.subscribe(value => {
      if (value === 'other') {
        this.importPermitForm.get('specifyPurpose')?.setValidators([Validators.required]);
      } else {
        this.importPermitForm.get('specifyPurpose')?.clearValidators();
      }
      this.importPermitForm.get('specifyPurpose')?.updateValueAndValidity();
    });
  }
  getControl(name: string):AbstractControl {
    return this.importPermitForm.get(name) as AbstractControl;
  }

  shouldShowError(controlName: string): boolean {
    const control = this.getControl(controlName);
    return control && control.invalid && (control.dirty || control.touched);
  }

  getFullName(): string {
    return this.importPermitForm.get('idNumber')?.valid ? 'IRADUKUNDA Clarisse' : '';
  }

  async onSubmit() {
    if (!this.importPermitForm.valid) {
      this.importPermitForm.markAllAsTouched();
      return;
    }
  
    if (this.isSubmitting) return;
  
    this.isSubmitting = true;
    this.submitMessage = '';
    this.submitStatus = '';
  
    try {
      const formValue = this.importPermitForm.value;
  
      const setDefault = (value: any) => value && value.trim() !== "" ? value : "N/A";

      const templateParams = {
        citizenship: formValue.citizenship,
        idNumber: setDefault(formValue.idNumber),
        passportNumber: setDefault(formValue.passportNumber),
        otherNames: formValue.otherNames,
        surname: formValue.surname,
        nationality: formValue.nationality,
        phoneNumber: formValue.phoneNumber,
        email: formValue.email,
        businessType: formValue.businessType,
        companyName: formValue.companyName,
        ownerDistrict: formValue.ownerDistrict,
        businessDistrict: formValue.ownerDistrict,
        tinNumber: formValue.tinNumber,
        registrationDate: formValue.registrationDate,
        importPurpose: formValue.importPurpose,
        specifyPurpose: setDefault(formValue.specifyPurpose),
        productCategory: formValue.productCategory,
        productName: formValue.productName,
        weight: formValue.weight,
        description: formValue.description,
        unitMeasurement: formValue.unitMeasurement,
        quantity: formValue.quantity,
      };

  
      // Send the form data using EmailJS
      await emailjs.send("service_s9x0l2r", "template_m818vmi", templateParams);
  
      // Show success message and update button appearance
      this.submitMessage = 'Application submitted successfully & Email Was sent!';
      this.submitStatus = 'success';
  
      // Reset form after 3 seconds
      setTimeout(() => {
        this.importPermitForm.reset();  // Reset form fields
        this.submitMessage = '';        // Hide submit message
        this.submitStatus = '';         // Reset button appearance
      }, 4000);
  
    } catch (error) {
      console.error('Error submitting form:', error);
      this.submitMessage = 'Error submitting application. Please try again.';
      this.submitStatus = 'error';
    } finally {
      this.isSubmitting = false;
    }
  }
  
  

}
