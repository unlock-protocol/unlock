const es = {
  common: {
    welcome: 'Hola a Unlock Protocol',
    free: 'GRATIS',
    continue: 'Continuar',
    continuing: 'Continuando',
    next: 'Siguiente',
    sign_message: 'Firmar el mensaje',
    email: 'Correo electrónico',
    wallet: 'Billetera',
    change: 'Cambiar',
    description: {
      enter_email:
        'Introduzca el correo electrónico que recibirá el NFT de membresía',
      enter_wallet:
        'Introduzca la dirección de la billetera que recibirá el NFT de membresía',
      email:
        'La dirección de correo electrónico que recibirá el NFT de membresía',
      wallet: 'La dirección de la billetera que recibirá el NFT de membresía',
    },
    pay_via_card: 'Pagar con tarjeta',
    payment_method: 'Usa tarjetas, Google Pay o Apple Pay.',
    additional_fees: 'Pueden aplicarse tarifas adicionales.',
    pay_with: 'Pagar con',
    your_balance: 'Tu saldo de',
    on: 'en',
    use_your_card: 'Usa tu tarjeta con Crossmint.',
    pay_via_stripe: 'Pagar con Stripe',
    swap: 'Intercambiar',
    for: 'por',
    and: 'y',
    pay: 'pagar',
    decent: 'Decente',
    ready_to_get_wallet:
      ' ¿Listo para obtener tu propia billetera para comprar esta membresía con criptomoneda?',
    click_here: 'Haz clic aquí',
    skip: 'Saltar',
    quantity: 'Cantidad',
    duration: 'Duración',
    sold_out: 'Agotado',
    buy: 'Comprar',
    memberships: 'membresías',
    memberships_at_once: 'membresías a la vez',
    buy_more: 'Comprar más',
    credit_card_fees: 'Credit Card Fees',
    learn_more: 'Learn more',
    claiming: 'Reclamando',
    claim: 'Reclamar',
    pay_using_crypto: 'Pagar usando cripto',
    paying_using_crypto: 'Pagando con cripto',
    confirming_payment: 'Confirmando pago',
    restart: 'Reiniciar',
  },
  warnings: {
    email_required: 'Se requiere correo electrónico',
    wallet_required: 'Se requiere dirección de billetera',
    address_max: 'La dirección ya tiene el número máximo de membresías.',
  },
  errors: {
    problem_address: 'Hay un problema con esta dirección. Prueba otra.',
    no_wallet: '¿No tienes dirección de billetera?',
    transaction_failed: 'Transacción fallida',
    transaction_error: 'Hubo un error al preparar la transacción.',
    wrong_password: 'Contraseña incorrecta...',
    gas_not_enough: `No tienes suficiente`,
    for_gas_fee: 'para la tarifa de gas',
    credit_card_not_enabled:
      'La tarjeta de crédito no está habilitada para esta membresía',
    purchase_more_fail: 'No puedes comprar más de',
    purchase_less_fail: 'No puedes comprar menos de',
    payment_error:
      'Hubo un error al intentar capturar tu pago. Por favor, verifica con tu institución financiera.',
    payment_failure: 'No se pudo confirmar el pago',
    payment_intent_missing:
      'Falta la intención de pago. Por favor, inténtalo de nuevo.',
    stripe_loading_fail: 'Hubo un problema al cargar Stripe',
    creating_payment_failed: 'Falló la creación de la intención de pago',
    claiming_failed:
      'No se devolvió el hash de la transacción. No se pudo reclamar la membresía.',
    transaction_rejected: 'Transacción rechazada',
    insufficient_funds_1: 'No tienes suficiente',
    insufficient_funds_2: 'para pagar tarifas de transacción',
    insufficient_funds_3: 'para completar esta compra',
  },
  captcha: {
    Solve_the_captcha: 'Resuelve el captcha para continuar',
    Captcha: 'Captcha',
  },
  guild: {
    wallet_warning_1: 'Tu dirección de billetera ',
    wallet_warning_2: 'no está en la lista de asistentes aprobados para esta',
    farcon: 'FarCon',
    class_of_tickets: 'clase de entradas.',
    check:
      '   Por favor, verifica que has sido aprobado y usa la dirección vinculada a tu cuenta de Farcaster.',
    check_again: 'Verificar de nuevo',
    wallet_approve: '¡Tu billetera está en la lista de asistentes aprobados!',
    membership_restrict:
      'Las membresías a este candado están restringidas a direcciones que pertenecen a la',
    recipient_restrict:
      ' Algunos de los destinatarios que has seleccionado no son miembros del Gremio.',
    guild: 'gremio',
    join: 'Unirse al Gremio',
  },
  minting: {
    minting_nft: 'Acuñando NFT',
    airdrop: '   ¡Te enviaremos por aire esta membresía gratuita!',
    claim_membership: 'Reclamar membresía gratis',
  },
  password: {
    enter_password: 'Introducir contraseña',
    description:
      'Necesitas introducir la contraseña para comprar la llave. Si la contraseña es incorrecta, la compra fallará.',
    submit_password: 'Enviar contraseña',
  },
  loading: {
    loading_more: 'Cargando más opciones de pago...',
  },
  promo: {
    discount: 'Descuento',
    code_expired: 'Código caducado',
    enter_promo_code: 'Introducir código promocional',
    enter_promo_code_description:
      'Si tienes un código promocional, introdúcelo aquí. Los códigos promocionales pueden ser usados para obtener descuentos en membresías.',
    promo_code: 'Código promocional',
  },
  success: {
    viola: ' ¡Voilà! ¡Esto está desbloqueado!',
    block_explorer: 'Ver en el explorador de bloques',
    add_to_google_wallet: 'Agregar a Google Wallet',
    add_to_apple_wallet: 'Agregar a Apple Wallet',
    apple_wallet: 'Apple Wallet',
    google_wallet: 'Google Wallet',
  },
}
export default es
export type Translations = typeof es
