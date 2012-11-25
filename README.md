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

Nota importante: Los ejemplos simulan la ejecución de una llamada AJAX mediante un "timer" de Javascript. De esta forma, evitamos tener que configurar un servidor Web para probar la librería. Ver la sección "Integración con AJAX".

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
Al llamar a la función *doWork* la primera vez, se añadirá el objeto *lock* a la lista de bloqueos y, al intentar lo mismo con la siguiente función, no se podrá hacer ya que el *lock* de la primera llamada define un bloqueo total.

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

Pero también hemos impedido que se efectúe cualquier otra llamada a la función *doWork*.

Estamos produciendo un bloqueo total de cualquier función que utilice la librería LockRules.

Veamos un ejemplo:

Supongamos que hay una función que devuelve el precio de la cesta de la compra:

```js
function getCost() {
 alert("40,6€");
}
```

Y que intentamos realizar de forma simultanea estas llamadas:

```js
doWork(getProducts, lock, 1);
doWork(getCost, {}); //la primera llamada bloquea la segunda
```

Esta situación no es probablemente deseable; en principio, no hay ninguna razón para impedir que el usuario conozca el valor de la cesta de la compra mientras se cargan los productos de una categoría.

Afortunadamente [LockRules.js](https://github.com/surtich/lockRules.js) está diseñado para lidiar con estas situaciones y otras mucho más complejas.

Para ello debemos cambiar la definición de nuestro objeto *lock*.

```js
var lock = {
 lockWord: "getProducts",
 lockRules: {
  allow: false,
  regExpLock: /getProducts/
 }
};
```
Observe que la regla de bloqueo incluye un nuevo atributo llamado *regExpLock* y que el objeto *lock* también tiene un atributo nuevo, *lockWord*.

Veamos que ocurre ahora al intentar ejecutar las llamadas anteriores:

```js
doWork(getProducts, lock, 1); //Se ejecutará, no hay ningún bloqueo añadido que lo impida
doWork(getProducts, lock, 1); //No se ejecutará, la llamada anterior, ha incluido un bloqueo que impide la adición de bloqueos en los que haya casamiento entre el atributo lockWord del bloqueo que se quiere añadir y la expresión regular definida en su atributo regExpLock
doWork(getProducts, {lockWord: "getProducts"}, 1); //No se ejecutará por la misma razón anterior
doWork(getProducts, {}, 1); //Se ejecutará ya que no hay un atributo lockWord que lo impida
```

Es decir, según lo visto hasta ahora, el funcionamiento de LockRules podría definir así:

> Una función se podrá ejecutar siempre y cuando el atributo *lockWord* del objeto *lock* asociado no coincida (case) con las expresiones regulares definidas en el atributo *regExpLock* de los objetos *lock* asociados a funciones en ejecución.

**Podemos hacerlo todavía mejor**

Supongamos la siguiente situación:

```js
doWork(getProducts, lock, 1);
doWork(getProducts, lock, 2);
```

Con el *lock* anterior, la segunda función no se ejecutará.

Esta situación puede no ser deseable ya que puede que queramos permitir que se carguen los productos de la categoría 2 mientras lo están haciendo los de la categoría 1.

La solución es sencilla:

Primero creemos la siguiente función:

```js
function createCategoryLock(numCategory) {
 return {
  lockWord: "getProducts" + numCategory,
  lockRules: {
   allow: false,
   regExpLock: new RegExp("getProducts"+numCategory)
  }
 }; 
}
```

Y luego llamemos a:

```js
doWork(getProducts, createCategoryLock(1), 1);
doWork(getProducts, createCategoryLock(2), 2);
```

### Cadenas de reglas

**Supongamos la siguiente situación:**

Tenemos una función para realizar la compra de productos.

Mientras se están comprando productos no queremos que se pueda modificar la cesta. Por ejemplo, no queremos ni que se puedan añadir ni eliminar productos.

Puede, sin embargo, que no nos importe que el usuario pueda consultar el importe de la cesta ya que este no se va a modificar durante el proceso de compra.

Supongamos que estas son las funciones:

```js
function checkOut() {
 alert("Buying...");
}
            
function addItem(numProduct, quantity, price) {
 alert("addItem " + numProduct); 
}
            
function deleteItem(numProduct) {
 alert("deleteItem " + numProduct);
}

function getCost() {
 alert("40,6€");
}
```
Supongamos que se efectúan las siguientes llamadas:

```js
doWork(checkOut, lock);
doWork(checkOut, lock);
doWork(addItem, {lockWord:'addItem'}, 2, 3, 5.6);
doWork(deleteItem, {lockWord:'deleteItem'}, 2);
doWork(getCost, {lockWord:'getCost'});
```

Vamos a proponer dos posibles definiciones de la variable *lock* que permitan la ejecución de la primera y de la última llamadas e impida las segunda, tercera y cuarta.

Vamos con la primera:

```js
lock = {
    lockWord: 'checkOut',
    lockRules: [
        {
            allow:false,
            regExpLock: /checkOut/
        },
        {
            allow:false,
            regExpLock: /Item$/
        },
    ]
};
```

Observe que en esta solución el atributo *lockRules* ha cambiado para convertirse en un *array* de reglas en vez de ser una única regla.

La primera regla impide que se pueda llamar a comprar dos veces simultaneas.
La segunda regla impide que se puedan añadir o eliminar productos de la cesta.

Veamos la segunda:

```js
lock = {
    lockWord: 'checkOut',
    lockRules: [
        {
            allow:false
        },
        {
            allow:true,
            regExpLock: /getCost/
        },
    ]
};
```

La primera regla impide la ejecución de cualquier otra función a través de LockRules.
La segunda permite la ejecución de la función que consulta el valor de la cesta.
Ambas reglas son contradictorias.

Este es otro de los principios de funcionamiento de LockRules:

> Las cadenas de reglas se aplican en **cascada**. La última regla que casa en la cadena es la que determina si se puede o no ejecutar una función.


### Inversión de reglas

> La comprobación de la situación de bloqueo, se realiza sobre los objectos *lock* asociados a funciones en ejecución y también sobre el objeto *lock* de la función que se pretende ejecutar.`

Esto permite mayor flexibilidad a la hora de definir las reglas de bloqueo.

Modifiquemos el ejemplo del apartado anterior para conseguir un resultado similar reducido únicamente a las funciones de comprar y añadir un artículo:

```js
doWork(checkOut, {lockWord:'checkOut'}); //Ahora no define cadena de reglas de bloqueo
doWork(addItem, {
        lockWord:'addItem',    
        lockRules: {
            allow: false,
            regExpLock: /checkOut/
        }
    }
    , 2, 3, 5.6); //Se define una regla de bloqueo que impide que se puedan añadir artculos mientras se est comprando
```

## Integración con AJAX

La integración con llamadas a funciones de AJAX si utlizamos jQuery hace que el uso de LockRules sea muy sencillo. Veamos un ejemplo.


La llamada a AJAX con jQuery la podríamos hacer de la siguiente manera:

```js
$.ajax({
 url:"./php/getProducts.php",
 data: numCategory,
 dataType: "json",
 type:"GET",
 lock:{
  lockWord: "getCategory" + numCategory,
  lockRules: {
   allow: false,
   regExpLock: new RegExp("getCategory" + numCategory)
  }                         
 } 
}).done(...);
```

Observe que en el objeto *settings* que le pasamos a la función *ajax* de jQuery, hemos incluido un atributo *lock*.

Una forma de procesar genéricamente estos atributos *lock* es utilizar la función de jQuery *ajaxPrefilter* que se efectúa antes de llamar cualquier llamada de AJAX y que nos brinda la oportunidad de gestionar los bloqueos y decidir si efectuar o no la llamada a la función.


Veamos como podríamos hacerlo:

```js
$(document).ready(
 function () {
  $.ajaxPrefilter(function( options, originalOptions, jqXHR ) {  
   if (options.hasOwnProperty("lock")) {
    if (!$.lockRules('addLock', options.lock)) { //La función addLock realiza una comprobación previa llamando a checkLock. El lock no se añadiría si hubiera bloqueo.
     jqXHR.abort();
    } else {
     jqXHR.always(
      function() {
       $.lockRules('removeLock', options.lock);      
      }      
     )
    }
   }
  });
 }
);
```