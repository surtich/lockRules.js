## LockRules.js - Bloqueando Javascript en base a reglas.

Con LockRules, puedes bloquear la llamada a una función de javascript en base a reglas previamente definidas.

## Escenario

Cuando se hace una llamada con AJAX hay un tiempo de espera hasta que los datos están disponibles en el cliente.

Durante ese tiempo, el usuario puede interaccionar con la aplicación y realizar diversas acciones como nuevas peticiones AJAX o ejecutar funciones de Javascript en el cliente.

Algunas de estas acciones pueden ser incompatibles con la llamada de AJAX inicial que todavía está en curso.

Ejemplo: Mientras se está procesando la compra de una cesta de productos, se debe impedir que el usuario modifique su contenido.

## Posibles Soluciones 

### En el servidor

Se podría y, por motivos de seguridad, se debería comprobar en el servidor que durante el procesamiento de una petición AJAX no se efectúe una segunda petición que sea incompatible con la primera.

### En el cliente

La comprobación en el servidor podría no ser suficiente en todas las situaciones.

Las desventajas de la comprobación en el servidor son el excesivo e innecesario tráfico de red y el retardo en la realimentación al usuario.

Algunas de las posibles soluciones de la comprobación en el cliente son:

  * Impedir que se hagan dos llamadas AJAX simultaneas. Solucionaría el problema que describimos pero tendría el inconveniente adicional de limitar drásticamente la usabilidad de la aplicación AJAX para convertirla en algo parecido a una aplicación WEB convencional.
  * Impedir que se hagan dos llamadas AJAX a la misma URL simultáneamente. En muchos casos esta solución resultará completamente insuficiente ya que puede que dos peticiones AJAX sean incompatibles aunque se hagan a dos URLs diferentes; y, por el contrario, puede que dos peticiones AJAX a la misma URL sean perfectamente compatibles porque, por ejemplo, tengan distintos parámetros.
  * Implementar un solución "ad hoc" específica para cada caso. Obviamente, esta solución resolvería perfectamente el problema pero requeriría un mayor esfuerzo que las anteriores y una mayor dificultad de mantenimiento.
 
## ¿Qué es LockRules.js?

[LockRules.js](https://github.com/surtich/lockRules.js) es un plugin de [jQuery](http://http://jquery.com/) que permite resolver el problema planteado sin necesidad de escribir una sola línea de código.

[LockRules.js](https://github.com/surtich/lockRules.js) funciona definiendo una serie de reglas que permiten o impiden la ejecución de una función de Javascript.

[LockRules.js](https://github.com/surtich/lockRules.js) es muy flexible, potente y configurable para adaptarse a todas las situaciones que se puedan plantear.

[LockRules.js](https://github.com/surtich/lockRules.js) utiliza expresiones regulares o selectores CSS en la definición de reglas.

## Instalación

[LockRules.js](https://github.com/surtich/lockRules.js) requiere [jQuery](http://http://jquery.com/) ######(pendiente comprobar la versión inferior que soportada).



