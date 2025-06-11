import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collectionData,
  updateDoc,
  query,
  where,
  DocumentReference
} from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Paciente } from '../models/paciente.model';
import { Observable } from 'rxjs';






@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  // Crear paciente con autenticación
  createPacienteWithAuth(paciente: Paciente & { password: string }): Promise<void> {
    return createUserWithEmailAndPassword(this.auth, paciente.email, paciente.password)
      .then((cred) => {
        const uid = cred.user?.uid;
        if (!uid) throw new Error('UID no disponible');

        const pacienteData: Paciente = {
          uid,
          nombre: paciente.nombre,
          direccion: paciente.direccion,
          fechaNacimiento: paciente.fechaNacimiento,
          email: paciente.email,
          rol: 'paciente'
        };

        const userDocRef = doc(this.firestore, 'usuarios', uid);
        return setDoc(userDocRef, pacienteData);
      });
  }

  // Obtener todos los pacientes
 getPacientes(): Observable<Paciente[]> {
  const pacientesQuery = query(
    collection(this.firestore, 'usuarios'),
    where('rol', '==', 'paciente')
  );
  return collectionData(pacientesQuery, { idField: 'uid' }) as Observable<Paciente[]>;
}

  // Obtener un paciente por UID
  getPaciente(uid: string): Promise<Paciente | null> {
    const pacienteDocRef = doc(this.firestore, 'usuarios', uid);
    return getDoc(pacienteDocRef).then(snapshot => {
      if (snapshot.exists()) {
        return snapshot.data() as Paciente;
      } else {
        return null;
      }
    });
  }

  // Eliminar un paciente por UID
  deletePaciente(uid: string): Promise<void> {
    const pacienteDocRef = doc(this.firestore, 'usuarios', uid);
    return deleteDoc(pacienteDocRef);
  }

  updatePaciente(uid: string, paciente: Partial<Paciente>): Promise<void> {
  const pacienteDocRef = doc(this.firestore, 'usuarios', uid);
  return updateDoc(pacienteDocRef, paciente);
}
}
