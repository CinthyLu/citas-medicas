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
    return collectionData(this.agendaRef, { idField: 'uid' }) as Observable<Agenda[]>;
  }

  getAgendasByMedico(medicoId: string): Observable<Agenda[]> {
    const q = query(this.agendaRef, where('medicoId', '==', medicoId));
    return collectionData(q, { idField: 'uid' }) as Observable<Agenda[]>;
  }

  addAgenda(agenda: Agenda) {
    return addDoc(this.agendaRef, agenda);
  }

  updateAgenda(uid: string, agenda: Partial<Agenda>) {
    const agendaDocRef = doc(this.firestore, `agendas/${uid}`);
    return updateDoc(agendaDocRef, agenda);
  }

  deleteAgenda(uid: string) {
    const agendaDocRef = doc(this.firestore, `agendas/${uid}`);
    return deleteDoc(agendaDocRef);
  }
}
