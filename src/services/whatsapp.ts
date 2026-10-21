import { Appointment, Tenant } from '../types';

export function formatWhatsAppMessage(
  template: string,
  appointment: Appointment,
  tenant: Tenant
): string {
  let message = template;

  const replacements: Record<string, string> = {
    '{empresa}': tenant.name,
    '{cliente}': appointment.customerName,
    '{telefono}': appointment.customerPhone,
    '{servicio}': appointment.serviceName,
    '{precio}': `$${(appointment.servicePrice || 0).toLocaleString()} ${tenant.currency}`,
    '{fecha}': appointment.date,
    '{hora}': appointment.startTime,
    '{codigo}': appointment.bookingCode,
    '{profesional}': appointment.staffName || 'Profesional asignado',
    '{modalidad}':
      appointment.modality === 'presential'
        ? 'Presencial en sede'
        : appointment.modality === 'home'
        ? 'A Domicilio'
        : 'Virtual',
    '{direccion}': appointment.address || tenant.address
  };

  // Add custom answers if present
  if (appointment.customAnswers) {
    Object.entries(appointment.customAnswers).forEach(([key, val]) => {
      replacements[`{custom_${key}}`] = String(val);
    });
  }

  // Replace all keys
  Object.entries(replacements).forEach(([key, val]) => {
    message = message.split(key).join(val);
  });

  return message;
}

export function buildWhatsAppLink(phone: string, text: string): string {
  // Strip non digits from phone number
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
}
