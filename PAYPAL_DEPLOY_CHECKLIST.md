# PayPal deployment checklist (Vercel / Hostinger / VPS)

Usá esta guía para que PayPal no falle al mover la web entre plataformas.

## 1) Variables obligatorias

- `PAYPAL_CLIENT_ID`
- `PAYPAL_SECRET`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` (igual a `PAYPAL_CLIENT_ID`)

## 2) Elegir entorno correcto

- **Sandbox (pruebas):** `PAYPAL_SANDBOX=true`
- **Live (producción real):** no poner `PAYPAL_SANDBOX=true`

Nunca mezclar Client ID/Secret de Sandbox con API Live (o viceversa).

## 3) Verificación rápida antes de abrir tráfico

Una vez desplegado, probá:

- `GET /api/paypal/health`

Esperado:

- `"ok": true`
- `"tokenReachable": true`
- `mode` correcto (`sandbox` o `live`)

Si da `invalid_client`, regenerá `PAYPAL_SECRET` en la misma app del Client ID.

## 4) Cambios en variables

Después de cambiar cualquier variable PayPal:

- reiniciar servidor o redeploy
- volver a correr `GET /api/paypal/health`

## 5) Webhook PayPal (obligatorio en producción)

Configurá un webhook en [developer.paypal.com](https://developer.paypal.com) apuntando a:

- `https://TU-DOMINIO/api/paypal/webhook`

Eventos recomendados:

- `PAYMENT.CAPTURE.COMPLETED`
- `CHECKOUT.ORDER.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.DECLINED`
- `PAYMENT.CAPTURE.REFUNDED`

Copiá el **Webhook ID** y agregalo como variable:

- `PAYPAL_WEBHOOK_ID`

Así el servidor confirma cada pago aunque el usuario cierre el navegador antes del capture, y nadie puede jugar sin un pago verificado.

## 6) Hostinger / VPS (Node)

- Cargar variables en `.env` del servidor (no solo local).
- Ejecutar app con proceso persistente (PM2/systemd).
- Configurar HTTPS y dominio antes de cobro real.

