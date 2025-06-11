import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Medico } from '../models/medico.model';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  constructor(private firestore: Firestore) {}

  getMedicos(): Observable<Medico[]> {
    const medicosRef = collection(this.firestore, 'medicos');
    return collectionData(medicosRef, { idField: 'id' }) as Observable<Medico[]>;
  }

  getMedicoById(id: string): Observable<Medico> {
    const medicoDocRef = doc(this.firestore, `medicos/${id}`);
    return docData(medicoDocRef, { idField: 'id' }) as Observable<Medico>;
  }

  addMedico(medico: Medico) {
    const medicosRef = collection(this.firestore, 'medicos');
    return addDoc(medicosRef, medico);
  }

  updateMedico(id: string, medico: Medico) {
    const medicoDocRef = doc(this.firestore, `medicos/${id}`);
    return updateDoc(medicoDocRef, { ...medico });
  }

  deleteMedico(id: string) {
    const medicoDocRef = doc(this.firestore, `medicos/${id}`);
    return deleteDoc(medicoDocRef);
  }
  
}
