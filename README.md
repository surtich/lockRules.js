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

[LockRules.js](https://github.com/surtich/lockRules.js) es un plugin de [jQuery](http://http://jquery.com/) que permite resolver el problema planteado de una forma genérica, flexible, potente y configurable para adaptarse a todas las situaciones que se puedan plantear.

[LockRules.js](https://github.com/surtich/lockRules.js) funciona definiendo una serie de reglas que permiten o impiden la ejecución de una función de Javascript. Las reglas se crean utilizando [expresiones regulares](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/RegExp) o [selectores CSS](http://www.w3.org/TR/selectors/).

## Instalación

[LockRules.js](https://github.com/surtich/lockRules.js) requiere [jQuery](http://http://jquery.com/)(pendiente comprobar la versión inferior que soportada).

Para utilizar LockRules debes incluir las siguientes etiquetas en la cabecera de tu página Web:

```html
 <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
 <script src="js/MyLockRules.js"></script> 
```

## Uso básico

Nota importante: Los ejemplos simulan la ejecución de una llamada AJAX mediente un "timer" de Javascript. De esta forma, evitamos tener que configurar un servidor Web para probar la librería. Ver la sección "Integración con AJAX".

### Evitar rellamadas AJAX

**Supongamos la siguiente situación:**

```js
function getProducts(categoryNumber) {
 alert(categoryNumber);
}
                
setTimeout(getProducts, 3000, 1);
setTimeout(getProducts, 1000, 1);
```

El primer "timer" simula una llamada AJAX en la que se pretenden recuperar los productos de la categoría 1.
El segundo "timer" simula una segunda petición de AJAX en la que se vuelven a recuperar los mismos artículos anteriores.

Esta situación se puede plantear si un usuario se cansa de esperar y trata de volver a obtener los productos pensando que de esta forma tendrá una respuesta más rápida. Normalmente querremos evitar situaciones como esta que lo único que van a conseguir es saturar la red. Si no hemos sido cuidadosos al programar la aplicación, es posible que además terminemos teniendo artículos duplicados en la aplicación Web.

Es preferible, que si la red está saturada, se produzca un "timeout" en la petición al servidor y que el usuario intente realizar la operación después de que se le informe del fallo.

**Solución con LockRules:**

Primero definamos la siguiente función:

```js
function doWork(fnWork, lock, params) {                
 if ($.lockRules('checkLock', lock)) {
  $.lockRules('addLock', lock);                    
  setTimeout(function() {
    fnWork(params);
    $.lockRules('removeLock', lock);
   }
 , 1000, params);
 } else {
  alert("Proccessing. Try it later")
 }                
}
```
La función *doWork* recibe la función a ejecutar, el objeto de bloqueo *lock* (ver más adelante) y los parámetros de la función a ejecutar.

El funcionamiento básico de LockRules consiste en lo siguiente:

1. Comprobar si el *lock* es compatible con los bloqueos actuales llamando a *checkLock*.
2. Si el *lock* es compatible, añadir el *lock* a los bloqueos actuales llamando *addLock*.                                             
3. Después llamar a la función.
4. Por último, borrar el *lock*.
5. Si el *lock* no es compatible, evitar la llamada a la función e informar al usuario.

Podemos verlo gráficamente:

![Ordinograma flujo bloqueo](https://github.com/surtich/lockRules.js/blob/master/readme_files/lockFlow.png "Ordinograma flujo bloqueo")

**El objecto lock**

La definición más sencilla que podríamos hacer para el ejemplo anterior sería

```js
var lock = {
 lockRules: {
  allow: false
 }
};
```
Las llamadas a la función *doWork* las podríamos hacer de la siguiente forma:

```js
doWork(getProducts, lock, 1);
doWork(getProducts, lock, 1);
```
Al llamar a la función *doWork* la primera vez, se añadirá el objeto *lock* a la lista de bloqueos y, al intentar lo mismo con la siguente función, no se podrá hacer ya que el *lock* de la primera llamada define un bloqueo total.

De hecho cualquier intento de llamar a *doWork* con cualquier *lock*, incluso uno vacío, impedirá que se ejecute la función pasada como parámetro.

```js
doWork(getProducts, lock, 1);
doWork(getProducts, {}, 1); //No se ejecutará porque el primer lock bloquea esta llamada
```

Tras finalizar la ejecución de la primera llamada, se podrá ejecutar la segunda. Simulémoslo:

```js
doWork(getProducts, lock, 1);
setTimeout(doWork, 2000, getProducts, {}, 1); //Ahora se podrá ejecutar porque la primera llamada habrá finalizado
```

**Mejorando la ejecución**

La solución anterior no es del todo satisfactoria.

Hemos evitado que se hagan dos llamadas simultaneas e impedido que se recuperen dos veces los productos de una categoría.




## Integración con AJAX

