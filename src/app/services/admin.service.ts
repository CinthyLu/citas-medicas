import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, updateDoc, deleteDoc, getDoc, query, where } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword, deleteUser, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Administrador } from '../models/admin.model';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private snackBar: MatSnackBar
  ) {}

  registerAdmin(admin: Administrador, password: string): Promise<void> {
    return createUserWithEmailAndPassword(this.auth, admin.email, password)
      .then(cred => {
        const uid = cred.user.uid;
        const newAdmin: Administrador = {
          uid,
          nombre: admin.nombre,
          direccion: admin.direccion,
          fechaNacimiento: admin.fechaNacimiento,
          email: admin.email,
          rol: 'administrador'
        };
        const docRef = doc(this.firestore, 'usuarios', uid);
        return setDoc(docRef, newAdmin);
      });
  }

async crearAdminConGoogle(): Promise<boolean> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(this.auth, provider);
  const uid = credential.user?.uid;
  if (!uid) return false;

  const docRef = doc(this.firestore, 'usuarios', uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    await setDoc(docRef, {
      nombre: credential.user?.displayName,
      email: credential.user?.email,
      rol: 'administrador',
    });
    return true; // creado
  } else {
    return false; // ya existía
  }
}


  getAdmins(): Observable<Administrador[]> {
    const administradorQuery = query(
      collection(this.firestore, 'usuarios'),
      where('rol', '==', 'administrador')
    );
    return collectionData(administradorQuery, { idField: 'uid' }) as Observable<Administrador[]>;
  }

  updateAdmin(admin: Administrador): Promise<void> {
    const docRef = doc(this.firestore, 'usuarios', admin.uid!);
    return updateDoc(docRef, {
      nombre: admin.nombre,
      direccion: admin.direccion,
      fechaNacimiento: admin.fechaNacimiento,
      email: admin.email
    });
  }

  deleteAdmin(uid: string): Promise<void> {
    const docRef = doc(this.firestore, 'usuarios', uid);
    return deleteDoc(docRef);
  }
}
