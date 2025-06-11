import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentData,
  query,
  where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Agenda } from '../models/agenda.model';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  private agendaRef: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.agendaRef = collection(this.firestore, 'agendas');
  }

  getAgendas(): Observable<Agenda[]> {
    return collectionData(this.agendaRef, { idField: 'id' }) as Observable<Agenda[]>;
  }

getAgendasByMedico(medicoId: string): Observable<Agenda[]> {
  const q = query(this.agendaRef, where('uidMedico', '==', medicoId));
  return collectionData(q, { idField: 'id' }) as Observable<Agenda[]>;
}




  addAgenda(agenda: Agenda) {
    return addDoc(this.agendaRef, agenda);
  }

  updateAgenda(id: string, agenda: Partial<Agenda>) {
    const agendaDocRef = doc(this.firestore, `agendas/${id}`);
    return updateDoc(agendaDocRef, agenda);
  }

  deleteAgenda(id: string) {
    const agendaDocRef = doc(this.firestore, `agendas/${id}`);
    return deleteDoc(agendaDocRef);
  }

  updateDisponibilidadAgenda(idAgenda: string, disponible: boolean) {
  const agendaRef = doc(this.firestore, `agendas/${idAgenda}`);
  return updateDoc(agendaRef, { disponible });
}

actualizarAgenda(id: string, cambios: Partial<Agenda>) {
  const agendaDoc = doc(this.firestore, `agendas/${id}`);
  return updateDoc(agendaDoc, cambios);
}

}
