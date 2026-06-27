import { fortuneCategories } from '@/lib/mystika-data'
import { STIKERS } from '@/lib/stikers-data'

export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
}

const GALLET_PRODUCTS: Product[] = fortuneCategories.flatMap((cat) =>
  cat.subcategories.map((sub) => ({
    id: `mystika-galleta-${sub.key}`,
    name: `Galleta ${sub.name} - Mystika`,
    description: `Rompe la galleta mística y recibe tu mensaje de ${sub.name} del destino.`,
    priceInCents: Math.round(sub.price * 100),
  })),
)

const CORE_PRODUCTS: Product[] = [
  {
    id: 'mystika-orbe',
    name: 'Orbe Mistico - Mystika',
    description: 'Gira el Orbe Mistico y descubre tu destino. Incluye galleta mistica garantizada.',
    priceInCents: 100,
  },
  {
    id: 'mystika-galleta',
    name: 'Galleta de la Fortuna - Mystika',
    description: 'Rompe la galleta mistica y recibe tu mensaje personalizado del destino.',
    priceInCents: 100,
  },
  {
    id: 'mystika-ruleta',
    name: 'Ruleta del Destino - Mystika',
    description: 'Gira la ruleta mistica y descubre el tema dominante de tu destino.',
    priceInCents: 100,
  },
  {
    id: 'mystika-ruleta-tercera',
    name: 'Ruleta — 3ra vuelta (Gran Fortuna) - Mystika',
    description:
      'Desbloquea la tercera vuelta de la Ruleta del Destino: pago unico para revelar tu Gran Fortuna.',
    priceInCents: 100,
  },
  {
    id: 'mystika-jackpot',
    name: 'Jackpot Mystika — 3 giros',
    description:
      'Por $1 USD: 1.º giro ganás $50, 2.º perdés el acumulado, 3.º galleta de la fortuna.',
    priceInCents: 100,
  },
  {
    id: 'clawzone-access',
    name: 'Acceso Completo - Clawzone',
    description: 'Desbloquea Caja, Galleta y Ruleta de Clawzone con pago unico.',
    priceInCents: 100,
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
  {
    id: 'mystika-cofres-1',
    name: 'Cofre 1 - Mystika',
    description: 'Abre el Cofre 1 y revela tu premio digital.',
    priceInCents: 100,
  },
  {
    id: 'mystika-cofres-2',
    name: 'Cofre 2 - Mystika',
    description: 'Abre el Cofre 2 y revela tu premio digital.',
    priceInCents: 500,
  },
  {
    id: 'mystika-cofres-3',
    name: 'Cofre 3 - Mystika',
    description: 'Abre el Cofre 3 y revela tu premio digital.',
    priceInCents: 1000,
  },
  {
    id: 'mystika-jackpot-five',
    name: 'Ganate $5 - Mystika',
    description:
      'Mini juego de buscaminas: $1 USD por partida. 2 excavaciones: la 1.ª no pasa nada, la 2.ª explota.',
    priceInCents: 100,
  },
  {
    id: 'mystika-mensaje-unlock',
    name: 'Desbloqueo Mensaje al Universo - Mystika',
    description:
      'Desbloquea el portal para enviar otro mensaje al universo sin esperar 24 horas.',
    priceInCents: 100,
  },
  {
    id: 'mystika-donacion-3',
    name: 'Donación Chispa - Mystika',
    description:
      'Donación al portal Mystika. Participás por premios diarios de USD 2.000, 500 y 100.',
    priceInCents: 300,
  },
  {
    id: 'mystika-donacion-5',
    name: 'Donación Luna - Mystika',
    description:
      'Donación al portal Mystika. Participás por premios diarios de USD 2.000, 500 y 100.',
    priceInCents: 500,
  },
  {
    id: 'mystika-donacion-10',
    name: 'Donación Orbe - Mystika',
    description:
      'Donación al portal Mystika. Participás por premios diarios de USD 2.000, 500 y 100.',
    priceInCents: 1000,
  },
  {
    id: 'mystika-donacion-20',
    name: 'Donación Señal - Mystika',
    description:
      'Donación al portal Mystika. Participás por premios diarios de USD 2.000, 500 y 100.',
    priceInCents: 2000,
  },
  {
    id: 'mystika-donacion-custom',
    name: 'Donación al Portal - Mystika',
    description:
      'Donación personalizada al portal Mystika. Participás por premios diarios de USD 2.000, 500 y 100.',
    priceInCents: 100,
  },
]

const STIKER_PRODUCTS: Product[] = STIKERS.map((s) => ({
  id: `mystika-stiker-${s.id}`,
  name: `Stiker ${s.name} - Mystika`,
  description: `Fondo de pantalla ${s.type === 'celular' ? 'para celular' : 'de escritorio'}: ${s.tagline}`,
  priceInCents: Math.round(s.priceUsd * 100),
}))

export const PRODUCTS: Product[] = [...CORE_PRODUCTS, ...STIKER_PRODUCTS, ...GALLET_PRODUCTS]

export function findProduct(productId: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === productId)
}

export function productPriceUsd(productId: string): number | null {
  const product = findProduct(productId)
  return product ? product.priceInCents / 100 : null
}
