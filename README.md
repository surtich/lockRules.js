## LockRules.js - Bloqueando Javascript en base a reglas.

Con LockRules, puedes bloquear la llamada a una función de javascript en base a reglas previemente definidas.

## Escenario

Cuando se hace una llamada con AJAX hay un tiempo de espera hasta que los datos están disponibles en el cliente. Durante ese tiempo, el usuario puede interaccionar con la aplicación y realizar diversas acciones como nuevas peticiones AJAX o ejecutar funciones de Javascript en el cliente. Algunas de estas acciones pueden ser incompatibles con la llamada de AJAX incial que todavía está en curso.

Ejemplo: Mientras se está procesando la compra de una cesta de productos, se tiene que impedir que el usuario modifique su contenido.

## Posibles Soluciones 



