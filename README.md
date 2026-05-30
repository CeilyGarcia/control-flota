Proyecto Fase 2 



**Como instalar y correr localmente**

Para instalar el proyecto se en Visual CODE se debe abrir la carpeta control-flota ya que esta contiene todo el proyecto unificado.



Los pasos a seguir para ejecutar correctamente el código ya con la carpeta abierta son:



1. Ingresar a server.js y presionar las teclas Ctrl + Ñ se abrirá una terminal 

2. en la terminal colocar el siguiente comando: node server.js

3. En el saldrá un mensaje indicando que el servidor se esta corriendo en el siguiente link: http://localhost:3000/

4. Este Link debe correrse en el navegador de su preferencia, ya adentro se encontrara con el inicio de sesión en donde deberá colocar las siguiente credenciales para poder entrar a la pagina principal.

&#x09;

&#x09;Usuario: admin

&#x09;Contraseña: 123456



5\. Ya ingresado en la pagina se encontrara un mapa que muestra la cuidad de Guatemala y tambien unos cuadros de texto que se podrán llenar cuando se necesite.



6\. Si se llena un registro indicando la placa del vehículo que se va a utilizar y el modelo al darle al botón registrar unidad en el mapa de manera aleatoria aparecerá la ubicación de dicho vehículo y abajo en unidades registradas se mostrara que unidades estan disponibles para utilizar y en que dirección especifica se encuentran.



7\. En la terminal de la misma manera saldrá un mensaje de que la unidad fue registrada exitosamente.



8\. Si se desea ver la base de datos primero si el servidor sigue corriendo darle un Ctrl + C.



9\. Despues colocar el siguiente comando: sqlite3 flota.db 

Esto hará que se ingrese a la base de datos nombrada flota.db



10\. Ya adentro de la base se coloca el siguiente comando para ver los registros hasta el momento: SELECT \* FROM unidades;



11\. Para salir de la base de datos se coloca el siguiente comando: .quit



12\. Para poder ejecutar las pruebas de test que se necesitan siguiendo la linea de comandos se debe agregar el siguiente: npm test



Esto mostrara que se esta haciendo un test tanto en el archivo unidades.test como en el archivo intregacion.text y deben de ejecutarse correctamente.



13\. En GitHub si se desea ver las pruebas del Pipeline CI/CD solo se debe abrir el repositorio y en la pestaña de Actions la prueba se ejecutara automáticamente.



**Tecnologías usadas**

* Frontend: HTML
* Backend: JavaScript, Node.js
* Test: JavaScript
* Mapas: Leaflet
* BD: SQLite
* Herramienta DevOps: GitHub y GitHub Actions



