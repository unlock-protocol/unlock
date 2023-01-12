![Unlock](/unlock-app/public/images/unlock-word-mark.png)

---

Este repositorio incluye todo el código implementado por Unlock, incluyendo los contratos inteligentes y la aplicación web que se encuentra en https://unlock-protocol.com.

> Unlock es un protocolo de control de acceso construido sobre la blockchain. Permite a los consumidores gestionar todas sus suscripciones de forma coherente, así como obtener descuentos cuando comparten buen contenido y las aplicaciones que utilizan.

Lea más sobre [por qué estamos construyendo Unlock](https://medium.com/unlock-protocol/its-time-to-unlock-the-web-b98e9b94add1).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Build Status](https://circleci.com/gh/unlock-protocol/unlock.svg?style=svg)](https://circleci.com/gh/unlock-protocol/unlock)

## Demo

Grabamos un ejemplo de uso para mostrar cómo funciona Unlock para un paywall.

[![Demo Unlock](https://img.youtube.com/vi/wktotzmea0E/0.jpg)](https://www.youtube.com/watch?v=wktotzmea0E)

## Contribución

Recomendamos encarecidamente que la comunidad nos ayude a hacer mejoras y determinar la dirección del proyecto. Para reportar errores dentro de este proyecto, por favor cree una issue en el repositorio

## Código

### Smart Contract

Incluye el código para los contratos inteligentes: Bloquear y desbloquear.

### unlock-protocol.com

Un sitio web estático para unlock-protocol.com. Eventualmente estará obsoleto a favor del código desplegado desde unlock-app.

### unlock-app

El código para la aplicación React, que interactúa con los contratos inteligentes desplegados.

## Ejecutando tests/ci

Despliegue con docker/docker-compose:

```
docker-compose -f docker/docker-compose.ci.yml build
docker-compose -f docker/docker-compose.ci.yml up --abort-on-container-exit
```
