export interface Agenda {
  id?: string;
  uidMedico: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
  medicoNombre?: string; // opcional, útil para mostrar en frontend
}
