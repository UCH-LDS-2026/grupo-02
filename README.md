#### Universidad Champagnat - Laboratorio de Desarrollo de Software - 2026

# Proyecto Final
## Grupo N° 2

## Integrantes:
- Nombre: Gorri Juan Nahuel
- Nombre: Nievas Milagros Gianella
- Nombre: Rojas Marcos Agustin
- Nombre: Corvalan Elio

## Problema que resuelve:
El sistema aborda la desorganización común en establecimientos gastronómicos donde la comunicación manual entre mozos y cocina genera errores de pedido, demoras no registradas y falta de visibilidad sobre el estado de las mesas en tiempo real, afectando la calidad del servicio y la rentabilidad.

Descripción del problema.
Este proyecto consiste en una solución de software diseñada para optimizar la gestión operativa de un restaurante, enfocándose en el control de flujo de clientes en el salón y la eficiencia en la comunicación con la cocina.

## Usuarios:
- Mozo:Encargado de la apertura de mesas, carga de pedidos (comandas) y actualización de estados en el salón (ej. "En mesa", "Por cobrar").
- Personal de Cocina: Responsable de recibir las comandas digitales y gestionar el estado de preparación de los platos ("En producción", "Listo").
- Cajero / Administrador: Supervisa el salón, gestiona la facturación, libera las mesas y tiene permisos para forzar cambios de estado ante contingencias.


Quién utilizará el sistema.
Los mismos usuarios. 
## Funcionalidades principales

Gestión de Apertura y Estados de Mesa: Creación de la instancia de mesa y seguimiento visual de su estado (Libre, Ocupada, Pedido en Curso, Por Cobrar).
Módulo de Comandas Electrónicas: Registro de pedidos por parte del mozo y envío instantáneo a la terminal de cocina.
Panel de Control de Cocina: Interfaz para que el personal de cocina gestione la producción, permitiendo cambiar el estado del pedido a "En Producción" y "Listo".
Control de Tiempos y Auditoría: Registro automático de horarios en cada cambio de estado para calcular demoras y tiempos de permanencia.
## Stack tecnológico

Frontend:
Pensabamos utilizar HTML5, CSS3, JavaScript para lo que es diseño web, sino Java para lo que es App
Backend:
Usaremos Java con Spring Boot
Base de datos:
Usaremos MySQL

## Cómo ejecutar el proyecto:
Instrucciones
1. Clonar el repositorio: `git clone [https://github.com/UCH-LDS-2026/grupo-02]`
2. Navegar al directorio del proyecto: `cd [RestoSoft]`
3. Configurar las variables de entorno de la base de datos en el archivo `application.properties` (o equivalente).
4. Ejecutar el script de creación de la base de datos ubicado en `/sql/schema.sql`.
5. Iniciar el servidor local ejecutando: `[COMANDO_DE_EJECUCIÓN_EJ_mvn_spring-boot:run]`
6. Acceder a la aplicación desde el navegador web en `http://localhost:8080`.


Figma: https://www.figma.com/make/f4KomUeF9IHv3zvR4kCyF2/Restaurant-Management-Dashboard?fullscreen=1&t=awKmbso6nbQcPSZl-1
