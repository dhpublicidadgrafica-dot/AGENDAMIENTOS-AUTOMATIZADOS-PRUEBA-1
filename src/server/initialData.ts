import { Tenant, Service, Staff, BlockedSlot, Customer, Appointment, AppUser } from '../types';

export const initialSchedule = {
  monday: { active: true, start: '08:00', end: '18:00', breaks: [{ start: '13:00', end: '14:00' }] },
  tuesday: { active: true, start: '08:00', end: '18:00', breaks: [{ start: '13:00', end: '14:00' }] },
  wednesday: { active: true, start: '08:00', end: '18:00', breaks: [{ start: '13:00', end: '14:00' }] },
  thursday: { active: true, start: '08:00', end: '18:00', breaks: [{ start: '13:00', end: '14:00' }] },
  friday: { active: true, start: '08:00', end: '18:00', breaks: [{ start: '13:00', end: '14:00' }] },
  saturday: { active: true, start: '09:00', end: '16:00', breaks: [] },
  sunday: { active: false, start: '09:00', end: '14:00', breaks: [] }
};

export const initialTenants: Tenant[] = [
  {
    id: 'tenant-grooming-01',
    name: 'Huellitas & Pelos - Grooming Canino & Spa',
    slug: 'huellitas-grooming',
    sector: 'grooming',
    description: 'Especialistas en bienestar, corte higiénico y spa canino sin estrés. Cuidamos a tu mejor amigo con amor y profesionalismo.',
    logo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&h=200&q=80',
    banner: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&h=400&q=80',
    primaryColor: '#0284c7', // Sky 600
    accentColor: '#0ea5e9',
    email: 'contacto@huellitasgrooming.com',
    phone: '+57 300 123 4567',
    whatsapp: '573001234567',
    address: 'Calle 127 # 15-32, Bogotá, Colombia',
    timezone: 'America/Bogota',
    currency: 'COP',
    autoConfirm: false, // requires manual approval
    advanceMinHours: 2,
    advanceMaxDays: 30,
    cancelMinHours: 6,
    slotIntervalMinutes: 30,
    defaultSchedule: initialSchedule,
    bookingTerms: 'Por favor presentar carnet de vacunación al día. En caso de pulgas o garrapatas se aplicará tratamiento antipulgas preventivo previa autorización.',
    dataPolicyNotice: 'Autorizo a Huellitas & Pelos el tratamiento de mis datos personales conforme a la Ley 1581 de 2012 para la gestión de citas y recordatorios de servicio.',
    whatsappTemplates: {
      onReceived: '¡Hola {empresa}! Acabo de solicitar una cita en su página para {servicio} el día {fecha} a las {hora}. Código: {codigo}. Mascota: {custom_petName}. Cliente: {cliente}. ¿Me confirman por favor?',
      onConfirmed: '¡Hola {cliente}! Tu cita en {empresa} para {servicio} ha sido CONFIRMADA para el día {fecha} a las {hora}. Te esperamos con mucho gusto.',
      onRescheduled: 'Hola {cliente}, tu cita en {empresa} ha sido REPROGRAMADA para el {fecha} a las {hora}.',
      onCancelled: 'Hola {cliente}, tu cita {codigo} en {empresa} ha sido cancelada. Puedes agendar nuevamente cuando gustes.'
    },
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tenant-barber-02',
    name: 'Barbería Royal King Club',
    slug: 'barberia-royal-king',
    sector: 'barbershop',
    description: 'Cortes clásicos, degradados modernos, perfilado de barba con toalla caliente y experiencia VIP con bebida de cortesía.',
    logo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=200&h=200&q=80',
    banner: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&h=400&q=80',
    primaryColor: '#b45309', // Amber 700
    accentColor: '#d97706',
    email: 'contacto@royalkingbarber.com',
    phone: '+57 311 987 6543',
    whatsapp: '573119876543',
    address: 'Carrera 11 # 85-40, Zona T, Bogotá',
    timezone: 'America/Bogota',
    currency: 'COP',
    autoConfirm: true, // auto confirms
    advanceMinHours: 1,
    advanceMaxDays: 20,
    cancelMinHours: 3,
    slotIntervalMinutes: 30,
    defaultSchedule: initialSchedule,
    bookingTerms: 'Agradecemos llegar 5 minutos antes de la hora acordada. Contamos con estacionamiento reservado para clientes.',
    dataPolicyNotice: 'Tratamiento confidencial de datos para agendamiento y promociones exclusivas del club.',
    whatsappTemplates: {
      onReceived: 'Hola {empresa}, he agendado una cita para {servicio} el {fecha} a las {hora} con {profesional}. Código: {codigo}.',
      onConfirmed: '¡Listo {cliente}! Tu reserva en {empresa} está CONFIRMADA para el {fecha} a las {hora}. ¡Te esperamos con un buen café o cerveza!',
      onRescheduled: 'Estimado {cliente}, tu cita ha sido reprogramada al {fecha} a las {hora}.',
      onCancelled: 'Estimado {cliente}, tu cita ha sido cancelada satisfactoriamente.'
    },
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tenant-dental-03',
    name: 'Clínica OdontoSalud Integral',
    slug: 'odontosalud-clinica',
    sector: 'health_dental',
    description: 'Salud oral y diseño de sonrisa con tecnología de vanguardia y especialistas certificados.',
    logo: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=200&h=200&q=80',
    banner: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&h=400&q=80',
    primaryColor: '#0d9488', // Teal 600
    accentColor: '#14b8a6',
    email: 'citas@odontosaludintegral.com',
    phone: '+57 315 444 8899',
    whatsapp: '573154448899',
    address: 'Av. Las Palmas, Edificio Médico Torre 2, Consultorio 604',
    timezone: 'America/Bogota',
    currency: 'COP',
    autoConfirm: false,
    advanceMinHours: 4,
    advanceMaxDays: 45,
    cancelMinHours: 12,
    slotIntervalMinutes: 45,
    defaultSchedule: initialSchedule,
    bookingTerms: 'Por favor traer documento de identidad e historia médica previa si aplica.',
    dataPolicyNotice: 'Tratamiento de datos personales y de salud conforme a la legislación sanitaria y Ley 1581 de 2012.',
    whatsappTemplates: {
      onReceived: 'Buen día {empresa}, he enviado solicitud de valoración dental para {servicio} el día {fecha} a las {hora}. Código: {codigo}.',
      onConfirmed: 'Apreciado/a {cliente}, su cita odontológica ha sido CONFIRMADA para el {fecha} a las {hora} con el profesional {profesional}.',
      onRescheduled: 'Apreciado/a {cliente}, su cita ha sido reprogramada para el {fecha} a las {hora}.',
      onCancelled: 'Apreciado/a {cliente}, su cita médica ha sido cancelada.'
    },
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialServices: Service[] = [
  // Grooming services
  {
    id: 'srv-gr-01',
    tenantId: 'tenant-grooming-01',
    name: 'Baño Completo & Deslanado Spa',
    category: 'Grooming Básico',
    description: 'Incluye baño con agua tibia, champú hipoalergénico, masaje relajante, deslanado profundo, secado suave, corte de uñas y limpieza de oídos.',
    price: 48000,
    durationMinutes: 60,
    bufferMinutes: 15,
    modalities: ['presential'],
    staffIds: ['staff-gr-01', 'staff-gr-02'],
    dynamicFields: [
      { id: 'petName', label: 'Nombre de la mascota', type: 'text', placeholder: 'Ej. Max, Luna', required: true },
      { id: 'petSpecies', label: 'Tipo de mascota', type: 'select', options: ['Perro Raza Pequeña', 'Perro Raza Mediana', 'Perro Raza Grande / Gigante', 'Gato'], required: true },
      { id: 'petBreed', label: 'Raza o cruce', type: 'text', placeholder: 'Ej. Poodle, Golden, Criollo', required: true },
      { id: 'petAge', label: 'Edad aproximada (años)', type: 'number', placeholder: 'Ej. 3', required: false },
      { id: 'petBehavior', label: 'Comportamiento durante el baño', type: 'select', options: ['Muy dócil y tranquilo', 'Nervioso pero manejable', 'Se estresa mucho / Primera vez'], required: true },
      { id: 'specialCare', label: 'Condiciones de salud o alergias', type: 'textarea', placeholder: 'Ej. Alergia a perfumes, dolor en pata trasera', required: false }
    ],
    active: true,
    order: 1
  },
  {
    id: 'srv-gr-02',
    tenantId: 'tenant-grooming-01',
    name: 'Corte de Raza & Estilismo Canino',
    category: 'Estilismo & Peluquería',
    description: 'Corte a tijera o máquina según estándar de raza o estilo asiático/teddy bear, más baño spa completo.',
    price: 75000,
    durationMinutes: 90,
    bufferMinutes: 15,
    modalities: ['presential'],
    staffIds: ['staff-gr-01'],
    dynamicFields: [
      { id: 'petName', label: 'Nombre de la mascota', type: 'text', placeholder: 'Ej. Toby', required: true },
      { id: 'petBreed', label: 'Raza', type: 'text', placeholder: 'Ej. Schnauzer, Shih Tzu, Caniche', required: true },
      { id: 'cutPreference', label: 'Estilo de corte deseado', type: 'select', options: ['Estándar de raza', 'Corte cachorro / Teddy Bear', 'Rapado higiénico corto', 'Solo retoque y vaciado'], required: true },
      { id: 'hasKnots', label: '¿Tiene nudos pronunciados?', type: 'select', options: ['No, está cepillado', 'Algunos nudos leves', 'Muy anudado (requiere desenredo especial)'], required: true }
    ],
    active: true,
    order: 2
  },
  {
    id: 'srv-gr-03',
    tenantId: 'tenant-grooming-01',
    name: 'Grooming a Domicilio (Van Móvil)',
    category: 'Servicio Móvil',
    description: 'Atención en la puerta de tu casa con nuestra unidad móvil completamente equipada con agua tibia y energía autónoma.',
    price: 90000,
    durationMinutes: 75,
    bufferMinutes: 30,
    modalities: ['home'],
    staffIds: ['staff-gr-02'],
    dynamicFields: [
      { id: 'petName', label: 'Nombre de la mascota', type: 'text', placeholder: 'Ej. Milo', required: true },
      { id: 'petWeight', label: 'Peso aproximado (kg)', type: 'number', placeholder: 'Ej. 12', required: true },
      { id: 'parkingInfo', label: '¿Hay espacio para parquear la van?', type: 'select', options: ['Sí, frente a la casa / bahía', 'Parqueadero de visitantes', 'Calle amplia'], required: true }
    ],
    active: true,
    order: 3
  },

  // Barber services
  {
    id: 'srv-br-01',
    tenantId: 'tenant-barber-02',
    name: 'Corte Clásico & Fade Master',
    category: 'Cortes',
    description: 'Corte personalizado con máquina y tijera, lavado refrescante, peinado con cera mate y toalla fría estimulante.',
    price: 35000,
    durationMinutes: 45,
    bufferMinutes: 10,
    modalities: ['presential'],
    staffIds: ['staff-br-01', 'staff-br-02'],
    dynamicFields: [
      { id: 'cutStyle', label: 'Estilo deseado', type: 'select', options: ['Fade Skin / Degradado al cero', 'Corte clásico con tijera', 'Mullet / Wolf cut', 'Buzz cut'], required: true },
      { id: 'courtesyDrink', label: 'Bebida de cortesía preferida', type: 'select', options: ['Café expresso', 'Cerveza artesanal bien fría', 'Agua con gas y limón', 'Ninguna, gracias'], required: false }
    ],
    active: true,
    order: 1
  },
  {
    id: 'srv-br-02',
    tenantId: 'tenant-barber-02',
    name: 'Ritual de Barba Royal',
    category: 'Barba & Afeitado',
    description: 'Perfilado con navaja tradicional, exfoliación facial, toalla caliente con aceites esenciales y bálsamo hidratante.',
    price: 30000,
    durationMinutes: 30,
    bufferMinutes: 10,
    modalities: ['presential'],
    staffIds: ['staff-br-01'],
    dynamicFields: [
      { id: 'beardLength', label: 'Longitud actual de la barba', type: 'select', options: ['Barba de 3 días', 'Media', 'Larga / Espesa'], required: true }
    ],
    active: true,
    order: 2
  },

  // Dental services
  {
    id: 'srv-dt-01',
    tenantId: 'tenant-dental-03',
    name: 'Valoración Odontológica y Diagnóstico Digital',
    category: 'Diagnóstico',
    description: 'Revisión clínica completa, cámara intraoral, examen periodontal y formulación de plan de tratamiento personalizado.',
    price: 60000,
    durationMinutes: 45,
    bufferMinutes: 15,
    modalities: ['presential', 'virtual'],
    staffIds: ['staff-dt-01', 'staff-dt-02'],
    dynamicFields: [
      { id: 'reasonConsult', label: 'Motivo principal de consulta', type: 'select', options: ['Revisión general / Chequeo', 'Dolor o molestia aguda', 'Deseo estética / Carillas / Blanqueamiento', 'Ortodoncia / Brackets / Alineadores', 'Implantes dentales'], required: true },
      { id: 'hasPain', label: '¿Presenta dolor actualmente?', type: 'select', options: ['No', 'Dolor leve al masticar o con frío', 'Dolor moderado a severo constante'], required: true },
      { id: 'medicalInsurance', label: 'Aseguradora o Plan prepagado (si aplica)', type: 'text', placeholder: 'Ej. Colmédica, Sura o Particular', required: false }
    ],
    active: true,
    order: 1
  },
  {
    id: 'srv-dt-02',
    tenantId: 'tenant-dental-03',
    name: 'Profilaxis Profunda con Ultrasonido',
    category: 'Higiene & Prevención',
    description: 'Remoción de placa bacteriana y sarro supra/subgingival, pulido con pasta fluorada y aplicación de flúor barniz.',
    price: 110000,
    durationMinutes: 60,
    bufferMinutes: 15,
    modalities: ['presential'],
    staffIds: ['staff-dt-01'],
    dynamicFields: [
      { id: 'lastCleaning', label: '¿Cuándo fue su última limpieza?', type: 'select', options: ['Hace menos de 6 meses', 'Entre 6 y 12 meses', 'Hace más de 1 año', 'Nunca me he realizado una'], required: true }
    ],
    active: true,
    order: 2
  }
];

export const initialStaff: Staff[] = [
  // Grooming Staff
  {
    id: 'staff-gr-01',
    tenantId: 'tenant-grooming-01',
    name: 'Valentina Gómez',
    email: 'valentina@huellitasgrooming.com',
    phone: '+57 300 234 5678',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
    roleTitle: 'Estilista Canina Master & Certificada',
    serviceIds: ['srv-gr-01', 'srv-gr-02'],
    schedule: initialSchedule,
    active: true
  },
  {
    id: 'staff-gr-02',
    tenantId: 'tenant-grooming-01',
    name: 'Carlos Ruiz',
    email: 'carlos@huellitasgrooming.com',
    phone: '+57 300 876 5432',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    roleTitle: 'Especialista en Razas Grandes & Groomer Móvil',
    serviceIds: ['srv-gr-01', 'srv-gr-03'],
    schedule: initialSchedule,
    active: true
  },

  // Barber Staff
  {
    id: 'staff-br-01',
    tenantId: 'tenant-barber-02',
    name: 'Mateo Salcedo',
    email: 'mateo@royalkingbarber.com',
    phone: '+57 311 333 4444',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    roleTitle: 'Barbero Principal & Master Shaver',
    serviceIds: ['srv-br-01', 'srv-br-02'],
    schedule: initialSchedule,
    active: true
  },
  {
    id: 'staff-br-02',
    tenantId: 'tenant-barber-02',
    name: 'Andrés Morales',
    email: 'andres@royalkingbarber.com',
    phone: '+57 311 555 6666',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80',
    roleTitle: 'Estilista Urbano & Fade Specialist',
    serviceIds: ['srv-br-01'],
    schedule: initialSchedule,
    active: true
  },

  // Dental Staff
  {
    id: 'staff-dt-01',
    tenantId: 'tenant-dental-03',
    name: 'Dra. Camila Restrepo',
    email: 'camila@odontosaludintegral.com',
    phone: '+57 315 777 8888',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&h=150&q=80',
    roleTitle: 'Odontóloga General & Estética Dental',
    serviceIds: ['srv-dt-01', 'srv-dt-02'],
    schedule: initialSchedule,
    active: true
  },
  {
    id: 'staff-dt-02',
    tenantId: 'tenant-dental-03',
    name: 'Dr. Santiago Vega',
    email: 'santiago@odontosaludintegral.com',
    phone: '+57 315 999 1111',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&h=150&q=80',
    roleTitle: 'Especialista en Rehabilitación Oral',
    serviceIds: ['srv-dt-01'],
    schedule: initialSchedule,
    active: true
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-01',
    tenantId: 'tenant-grooming-01',
    name: 'Carolina Osorio',
    phone: '+57 310 987 6543',
    email: 'carolina.osorio@gmail.com',
    notes: 'Mamá de "Max" (Golden Retriever). Muy puntual y cariñosa.',
    totalBookings: 3,
    lastBookingAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'cust-02',
    tenantId: 'tenant-grooming-01',
    name: 'Juan Felipe Mendoza',
    phone: '+57 312 456 7890',
    email: 'juanfe.mendoza@hotmail.com',
    notes: 'Dueño de "Luna" (Poodle). Requiere corte bajito en patas.',
    totalBookings: 1,
    lastBookingAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 'cust-03',
    tenantId: 'tenant-barber-02',
    name: 'David Alejandro Castro',
    phone: '+57 301 222 3344',
    email: 'david.castro@empresa.co',
    notes: 'Cliente frecuente de corte degradado y café expresso.',
    totalBookings: 5,
    lastBookingAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  }
];

// Helper to format date YYYY-MM-DD
function getIsoDate(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const initialAppointments: Appointment[] = [
  {
    id: 'apt-gr-01',
    tenantId: 'tenant-grooming-01',
    bookingCode: 'HUE-8492',
    customerName: 'Carolina Osorio',
    customerPhone: '+57 310 987 6543',
    customerEmail: 'carolina.osorio@gmail.com',
    serviceId: 'srv-gr-01',
    serviceName: 'Baño Completo & Deslanado Spa',
    servicePrice: 48000,
    serviceDuration: 60,
    serviceBuffer: 15,
    staffId: 'staff-gr-01',
    staffName: 'Valentina Gómez',
    date: getIsoDate(0), // Today
    startTime: '10:00',
    endTime: '11:00',
    timezone: 'America/Bogota',
    modality: 'presential',
    customAnswers: {
      petName: 'Max',
      petSpecies: 'Perro Raza Grande / Gigante',
      petBreed: 'Golden Retriever',
      petAge: '4',
      petBehavior: 'Muy dócil y tranquilo'
    },
    status: 'confirmed',
    source: 'public_web',
    internalNotes: 'Trae toalla especial por piel sensible.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    history: [
      { id: 'aud-1', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), action: 'Solicitud creada vía web pública', performedBy: 'Cliente (Carolina Osorio)' },
      { id: 'aud-2', timestamp: new Date(Date.now() - 86400000).toISOString(), action: 'Estado cambiado a CONFIRMADA', performedBy: 'Admin Valentina' }
    ]
  },
  {
    id: 'apt-gr-02',
    tenantId: 'tenant-grooming-01',
    bookingCode: 'HUE-9231',
    customerName: 'Juan Felipe Mendoza',
    customerPhone: '+57 312 456 7890',
    customerEmail: 'juanfe.mendoza@hotmail.com',
    serviceId: 'srv-gr-02',
    serviceName: 'Corte de Raza & Estilismo Canino',
    servicePrice: 75000,
    serviceDuration: 90,
    serviceBuffer: 15,
    staffId: 'staff-gr-01',
    staffName: 'Valentina Gómez',
    date: getIsoDate(0), // Today
    startTime: '14:30',
    endTime: '16:00',
    timezone: 'America/Bogota',
    modality: 'presential',
    customAnswers: {
      petName: 'Luna',
      petBreed: 'Poodle Toy',
      cutPreference: 'Corte cachorro / Teddy Bear',
      hasKnots: 'No, está cepillado'
    },
    status: 'pending',
    source: 'public_web',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    history: [
      { id: 'aud-3', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), action: 'Solicitud recibida pendiente de revisión', performedBy: 'Cliente (Juan Felipe)' }
    ]
  },
  {
    id: 'apt-gr-03',
    tenantId: 'tenant-grooming-01',
    bookingCode: 'HUE-3310',
    customerName: 'Mariana Duque',
    customerPhone: '+57 318 666 7788',
    serviceId: 'srv-gr-03',
    serviceName: 'Grooming a Domicilio (Van Móvil)',
    servicePrice: 90000,
    serviceDuration: 75,
    serviceBuffer: 30,
    staffId: 'staff-gr-02',
    staffName: 'Carlos Ruiz',
    date: getIsoDate(1), // Tomorrow
    startTime: '09:00',
    endTime: '10:15',
    timezone: 'America/Bogota',
    modality: 'home',
    address: 'Calle 140 # 19-45 Apto 502, Cedritos',
    customAnswers: {
      petName: 'Milo',
      petWeight: 14,
      parkingInfo: 'Sí, frente a la casa / bahía'
    },
    status: 'confirmed',
    source: 'manual_admin',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    history: [
      { id: 'aud-4', timestamp: new Date(Date.now() - 86400000).toISOString(), action: 'Cita agendada manualmente por recepcionista', performedBy: 'Admin Huellitas' }
    ]
  },
  {
    id: 'apt-br-01',
    tenantId: 'tenant-barber-02',
    bookingCode: 'ROY-1102',
    customerName: 'David Alejandro Castro',
    customerPhone: '+57 301 222 3344',
    serviceId: 'srv-br-01',
    serviceName: 'Corte Clásico & Fade Master',
    servicePrice: 35000,
    serviceDuration: 45,
    serviceBuffer: 10,
    staffId: 'staff-br-01',
    staffName: 'Mateo Salcedo',
    date: getIsoDate(0),
    startTime: '11:00',
    endTime: '11:45',
    timezone: 'America/Bogota',
    modality: 'presential',
    customAnswers: {
      cutStyle: 'Fade Skin / Degradado al cero',
      courtesyDrink: 'Café expresso'
    },
    status: 'confirmed',
    source: 'public_web',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [
      { id: 'aud-br-1', timestamp: new Date().toISOString(), action: 'Reserva confirmada automáticamente', performedBy: 'Sistema Automático' }
    ]
  }
];

export const initialBlockedSlots: BlockedSlot[] = [
  {
    id: 'blk-01',
    tenantId: 'tenant-grooming-01',
    staffId: 'staff-gr-01',
    title: 'Mantenimiento de máquinas de corte',
    date: getIsoDate(2),
    startTime: '13:00',
    endTime: '15:00',
    allDay: false,
    reason: 'Afilado y desinfección profunda de cuchillas Oster'
  }
];

export const initialUsers: AppUser[] = [
  {
    id: 'user-superadmin',
    name: 'Superadmin Plataforma NOVA',
    email: 'superadmin@novasaas.com',
    role: 'superadmin'
  },
  {
    id: 'user-grooming-admin',
    tenantId: 'tenant-grooming-01',
    name: 'Valentina Gómez (Admin Huellitas)',
    email: 'valentina@huellitasgrooming.com',
    role: 'tenant_admin',
    staffId: 'staff-gr-01'
  },
  {
    id: 'user-grooming-staff',
    tenantId: 'tenant-grooming-01',
    name: 'Carlos Ruiz (Empleado)',
    email: 'carlos@huellitasgrooming.com',
    role: 'staff',
    staffId: 'staff-gr-02'
  },
  {
    id: 'user-barber-admin',
    tenantId: 'tenant-barber-02',
    name: 'Mateo Salcedo (Admin Royal King)',
    email: 'mateo@royalkingbarber.com',
    role: 'tenant_admin',
    staffId: 'staff-br-01'
  },
  {
    id: 'user-dental-admin',
    tenantId: 'tenant-dental-03',
    name: 'Dra. Camila Restrepo (Admin OdontoSalud)',
    email: 'camila@odontosaludintegral.com',
    role: 'tenant_admin',
    staffId: 'staff-dt-01'
  }
];
