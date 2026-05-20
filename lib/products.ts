export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
}

export const PRODUCTS: Product[] = [
  {
    id: 'mystika-orbe',
    name: 'Orbe Mistico - Mystika',
    description: 'Gira el Orbe Mistico y descubre tu destino. Incluye galleta mistica garantizada.',
    priceInCents: 100, // $1.00
  },
  {
    id: 'mystika-galleta',
    name: 'Galleta de la Fortuna - Mystika',
    description: 'Rompe la galleta mistica y recibe tu mensaje personalizado del destino.',
    priceInCents: 100, // $1.00
  },
  {
    id: 'mystika-ruleta',
    name: 'Ruleta del Destino - Mystika',
    description: 'Gira la ruleta mistica y descubre el tema dominante de tu destino.',
    priceInCents: 100, // $1.00
  },
  {
    id: 'mystika-ruleta-tercera',
    name: 'Ruleta — 3ra vuelta (Gran Fortuna) - Mystika',
    description:
      'Desbloquea la tercera vuelta de la Ruleta del Destino: pago unico para revelar tu Gran Fortuna.',
    priceInCents: 100, // $1.00
  },
  {
    id: 'clawzone-access',
    name: 'Acceso Completo - Clawzone',
    description: 'Desbloquea Caja, Galleta y Ruleta de Clawzone con pago unico.',
    priceInCents: 100, // $1.00
  },
  {
    id: 'mystika-llave-1',
    name: 'Llave Cosmica Cobre - Mystika',
    description:
      'Llave digital USD 1: insertala en el cofre y recibi galleta de la fortuna o mensaje del universo.',
    priceInCents: 100,
  },
  {
    id: 'mystika-llave-5',
    name: 'Llave Cosmica Plata - Mystika',
    description:
      'Llave digital USD 5: insertala en el cofre y recibi galleta de la fortuna o mensaje del universo.',
    priceInCents: 500,
  },
  {
    id: 'mystika-llave-20',
    name: 'Llave Cosmica Aurum - Mystika',
    description:
      'Llave digital USD 20: insertala en el cofre y recibi galleta de la fortuna o mensaje del universo.',
    priceInCents: 2000,
  },
]
