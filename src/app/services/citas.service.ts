import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface Cita {
  id?: string;
  pacienteId: string;
  pacienteNombre?: string;
  medicoId: string;
  medicoNombre?: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  constructor(private firestore: Firestore) {}

getCitas(): Observable<any[]> {
  const citasRef = collection(this.firestore, 'citas');
  return collectionData(citasRef, { idField: 'id' }); // <-- esto incluye el ID de documento
}


  getCitaById(id: string): Observable<Cita> {
    const citaDocRef = doc(this.firestore, `citas/${id}`);
    return docData(citaDocRef, { idField: 'id' }) as Observable<Cita>;
  }

getCitasConNombres(): Observable<Cita[]> {
  const citasRef = collection(this.firestore, 'citas');
  return collectionData(citasRef, { idField: 'id' }).pipe(
    map((docs) => docs as Cita[]), // 👈 Forzamos el tipo aquí
    switchMap((citas: Cita[]) => {
      const citasConNombres = citas.map(async (cita) => {
        const pacienteSnap = await getDoc(doc(this.firestore, `usuarios/${cita.pacienteId}`));
        const medicoSnap = await getDoc(doc(this.firestore, `medicos/${cita.medicoId}`));

        return {
          ...cita,
          pacienteNombre: pacienteSnap.exists() ? pacienteSnap.data()['nombre'] : 'Desconocido',
          medicoNombre: medicoSnap.exists() ? medicoSnap.data()['nombre'] : 'Desconocido'
        };
      });

      return from(Promise.all(citasConNombres));
    })
  );
}


  addCita(cita: Cita) {
    const citasRef = collection(this.firestore, 'citas');
    return addDoc(citasRef, cita);
  }

  updateCita(id: string, cita: Cita) {
    const citaDocRef = doc(this.firestore, `citas/${id}`);
    return updateDoc(citaDocRef, { ...cita });
  }

  updateEstadoCita(id: string, estado: string) {
    const citaDocRef = doc(this.firestore, `citas/${id}`);
    return updateDoc(citaDocRef, { estado });
  }


solicitarCita(cita: any, idAgenda: string) {
  const citasRef = collection(this.firestore, 'citas');
  const citaConAgenda = {
    ...cita,
    uidAgenda: idAgenda // 🔁 Agregamos el ID de agenda
  };
  return addDoc(citasRef, citaConAgenda).then(() => {
    const agendaRef = doc(this.firestore, `agendas/${idAgenda}`);
    return updateDoc(agendaRef, { disponible: false });
  });
}


cancelarCita(citaId: string): Promise<void> {
  const citaRef = doc(this.firestore, `citas/${citaId}`);
  return deleteDoc(citaRef);
}

eliminarCita(idCita: string, idAgenda: string) {
  const citaRef = doc(this.firestore, `citas/${idCita}`);
  const agendaRef = doc(this.firestore, `agendas/${idAgenda}`);

  return deleteDoc(citaRef).then(() => {
    return updateDoc(agendaRef, { disponible: true });
  }).catch(err => {
    console.error('Error actualizando agenda:', err);
    throw err;
  });
}

updateAgenda(id: string, data: any) {
  const agendaDoc = doc(this.firestore, 'agendas', id);
  return updateDoc(agendaDoc, data);
}



}

