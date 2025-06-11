import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  enviarCorreo(destinatario: string, mensaje: string) {
    // Aquí iría la lógica real de envío de correo (simulada)
    console.log(`Correo enviado a ${destinatario}: ${mensaje}`);
    // En producción, aquí se llamaría a un backend o servicio de correo
  }

  enviarWhatsApp(destinatario: string, mensaje: string) {
    // Simulación de envío de WhatsApp
    console.log(`WhatsApp enviado a ${destinatario}: ${mensaje}`);
    // En producción, aquí se integraría con una API de WhatsApp
  }
  
}
