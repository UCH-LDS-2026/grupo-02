-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-06-2026 a las 08:10:49
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `restosoft`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria_estado`
--

CREATE TABLE `auditoria_estado` (
  `id_auditoria` int(11) NOT NULL,
  `id_instancia` int(11) NOT NULL,
  `estado_anterior` varchar(50) DEFAULT NULL,
  `estado_nuevo` varchar(50) DEFAULT NULL,
  `fecha_cambio` datetime DEFAULT current_timestamp(),
  `usuario_responsable` int(11) DEFAULT NULL,
  `motivo_contingencia` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `auditoria_estado`
--

INSERT INTO `auditoria_estado` (`id_auditoria`, `id_instancia`, `estado_anterior`, `estado_nuevo`, `fecha_cambio`, `usuario_responsable`, `motivo_contingencia`) VALUES
(1, 2, 'ITEM: Coca Cola 1.5L (x1)', 'CANCELADO LÓGICAMENTE', NULL, 5, 'Duplicado accidental');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria_producto`
--

CREATE TABLE `categoria_producto` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria_producto`
--

INSERT INTO `categoria_producto` (`id_categoria`, `nombre`, `descripcion`) VALUES
(1, 'Combos', 'Combos de comida'),
(2, 'Comidas', 'Comidas sin bebidas'),
(3, 'Bebidas', 'Bebidas frias para tomar'),
(4, 'Postre', 'Postres para acompañar despues de la comida o para comer solo'),
(5, 'Otro', 'Otras opciones de comida o bebida que no se encuentran en las anteriores opciones');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id_cliente` int(11) NOT NULL,
  `activo` bit(1) DEFAULT NULL,
  `nombre_completo` varchar(255) DEFAULT NULL,
  `porcentaje_descuento` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id_cliente`, `activo`, `nombre_completo`, `porcentaje_descuento`) VALUES
(1, b'1', 'Elio (Dueño)', 100),
(2, b'1', 'Juan (Descuento Empleado)', 30),
(3, b'1', 'Milagros (Descuento Empleado)', 30),
(4, b'1', 'Marcos (Descuento Empleado)', 30);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comanda`
--

CREATE TABLE `comanda` (
  `id_comanda` int(11) NOT NULL,
  `id_instancia` int(11) NOT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `estado` enum('PENDIENTE','EN_PRODUCCION','LISTO','ENTREGADO') DEFAULT 'PENDIENTE',
  `id_mesa` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `comanda`
--

INSERT INTO `comanda` (`id_comanda`, `id_instancia`, `fecha_creacion`, `estado`, `id_mesa`, `id_usuario`) VALUES
(9, 2, '2026-06-22 00:04:34', 'ENTREGADO', 1, 5),
(10, 2, '2026-06-22 22:35:21', 'ENTREGADO', 1, 5),
(11, 2, '2026-06-22 23:12:37', 'ENTREGADO', 1, 5),
(12, 2, '2026-06-22 23:28:19', 'ENTREGADO', 1, 5),
(13, 2, '2026-06-22 23:28:41', 'ENTREGADO', 1, 5),
(14, 2, '2026-06-24 13:36:19', 'ENTREGADO', 1, 5),
(15, 3, '2026-06-24 13:49:16', 'PENDIENTE', 2, 5),
(16, 4, '2026-06-24 17:38:13', 'PENDIENTE', 4, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura`
--

CREATE TABLE `factura` (
  `id_factura` int(11) NOT NULL,
  `id_instancia` int(11) NOT NULL,
  `id_cajero` int(11) NOT NULL,
  `fecha_factura` datetime DEFAULT current_timestamp(),
  `total` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_mesa`
--

CREATE TABLE `historial_mesa` (
  `id` int(11) NOT NULL,
  `estado_anterior` enum('LIBRE','OCUPADA','PEDIDO_EN_CURSO','POR_COBRAR') DEFAULT NULL,
  `estado_nuevo` enum('LIBRE','OCUPADA','PEDIDO_EN_CURSO','POR_COBRAR') NOT NULL,
  `timestamp_cambio` datetime(6) NOT NULL,
  `mesa_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial_mesa`
--

INSERT INTO `historial_mesa` (`id`, `estado_anterior`, `estado_nuevo`, `timestamp_cambio`, `mesa_id`) VALUES
(1, 'LIBRE', 'OCUPADA', '2026-06-12 21:53:13.000000', 1),
(2, 'LIBRE', 'OCUPADA', '2026-06-12 21:53:13.000000', 2),
(3, 'OCUPADA', 'LIBRE', '2026-06-12 21:53:16.000000', 4),
(4, 'POR_COBRAR', 'LIBRE', '2026-06-12 21:53:16.000000', 6),
(5, 'OCUPADA', 'LIBRE', '2026-06-13 00:31:01.000000', 2),
(6, 'LIBRE', 'LIBRE', '2026-06-13 00:31:01.000000', 2),
(7, 'LIBRE', 'OCUPADA', '2026-06-13 01:46:53.000000', 3),
(8, 'LIBRE', 'OCUPADA', '2026-06-13 01:46:54.000000', 6),
(9, 'OCUPADA', 'LIBRE', '2026-06-13 01:46:56.000000', 1),
(10, 'LIBRE', 'OCUPADA', '2026-06-21 22:26:30.000000', 1),
(11, 'OCUPADA', 'OCUPADA', '2026-06-22 22:35:27.000000', 1),
(12, 'OCUPADA', 'OCUPADA', '2026-06-22 22:37:52.000000', 1),
(13, 'OCUPADA', 'OCUPADA', '2026-06-22 23:12:27.000000', 1),
(14, 'OCUPADA', 'OCUPADA', '2026-06-22 23:13:11.000000', 1),
(15, 'OCUPADA', 'OCUPADA', '2026-06-22 23:28:36.000000', 1),
(16, 'OCUPADA', 'OCUPADA', '2026-06-22 23:29:06.000000', 1),
(17, 'LIBRE', 'OCUPADA', '2026-06-24 13:04:58.000000', 2),
(18, 'OCUPADA', 'POR_COBRAR', '2026-06-24 14:46:11.000000', 1),
(19, 'LIBRE', 'OCUPADA', '2026-06-24 17:37:28.000000', 4),
(20, 'OCUPADA', 'OCUPADA', '2026-06-24 17:39:26.000000', 2),
(21, 'OCUPADA', 'OCUPADA', '2026-06-24 17:39:31.000000', 4),
(22, 'POR_COBRAR', 'OCUPADA', '2026-06-24 21:36:07.000000', 1),
(23, 'OCUPADA', 'POR_COBRAR', '2026-06-24 21:36:25.000000', 2),
(24, 'POR_COBRAR', 'LIBRE', '2026-06-25 22:48:10.000000', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `instancia_mesa`
--

CREATE TABLE `instancia_mesa` (
  `id_instancia` int(11) NOT NULL,
  `id_mesa` int(11) NOT NULL,
  `id_mozo` int(11) NOT NULL,
  `fecha_apertura` datetime DEFAULT current_timestamp(),
  `fecha_cierre` datetime DEFAULT NULL,
  `estado_actual` enum('LIBRE','OCUPADA','PEDIDO_EN_CURSO','EN_MESA','POR_COBRAR') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `instancia_mesa`
--

INSERT INTO `instancia_mesa` (`id_instancia`, `id_mesa`, `id_mozo`, `fecha_apertura`, `fecha_cierre`, `estado_actual`) VALUES
(1, 1, 1, '2026-06-05 20:28:56', NULL, 'LIBRE'),
(2, 1, 5, '2026-06-21 22:26:30', NULL, 'OCUPADA'),
(3, 2, 5, '2026-06-24 13:04:58', NULL, 'OCUPADA'),
(4, 4, 2, '2026-06-24 17:37:28', NULL, 'OCUPADA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `item_comanda`
--

CREATE TABLE `item_comanda` (
  `id_item` int(11) NOT NULL,
  `id_comanda` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  `comentario` varchar(255) DEFAULT NULL,
  `cancelado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `item_comanda`
--

INSERT INTO `item_comanda` (`id_item`, `id_comanda`, `id_producto`, `cantidad`, `subtotal`, `observaciones`, `comentario`, `cancelado`) VALUES
(3, 9, 1, 2, 13000.00, NULL, '', 0),
(4, 10, 2, 1, 5500.00, NULL, '', 0),
(5, 11, 3, 1, 2000.00, NULL, '', 0),
(6, 12, 3, 1, 2000.00, NULL, '', 0),
(7, 13, 3, 1, 2000.00, NULL, '', 1),
(8, 14, 3, 1, 2000.00, NULL, '', 0),
(9, 15, 3, 1, 2000.00, NULL, '', 0),
(10, 16, 1, 1, 6500.00, NULL, '', 0),
(11, 16, 2, 1, 5500.00, NULL, '', 0),
(12, 16, 3, 3, 6000.00, NULL, '', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mesa`
--

CREATE TABLE `mesa` (
  `id_mesa` int(11) NOT NULL,
  `numero_mesa` int(11) NOT NULL,
  `capacidad` int(11) NOT NULL,
  `estado` enum('LIBRE','OCUPADA','PEDIDO_EN_CURSO','POR_COBRAR') DEFAULT 'LIBRE',
  `posicion_x` int(11) DEFAULT 0,
  `posicion_y` int(11) DEFAULT 0,
  `sector` varchar(50) DEFAULT 'Planta Baja'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mesa`
--

INSERT INTO `mesa` (`id_mesa`, `numero_mesa`, `capacidad`, `estado`, `posicion_x`, `posicion_y`, `sector`) VALUES
(1, 1, 2, 'OCUPADA', 50, 0, 'Planta Baja'),
(2, 2, 2, 'LIBRE', 150, 0, 'Planta Baja'),
(3, 3, 4, 'OCUPADA', 250, 0, 'Planta Baja'),
(4, 4, 4, 'OCUPADA', 350, 0, 'Planta Baja'),
(5, 5, 6, 'PEDIDO_EN_CURSO', 100, 150, 'Planta Baja'),
(6, 6, 8, 'OCUPADA', 300, 150, 'Planta Baja'),
(10, 10, 4, 'LIBRE', 80, 0, 'Planta Alta'),
(11, 11, 4, 'LIBRE', 240, 0, 'Planta Alta'),
(12, 12, 4, 'LIBRE', 400, 0, 'Planta Alta'),
(13, 13, 4, 'LIBRE', 160, 160, 'Planta Alta'),
(14, 20, 4, 'LIBRE', 80, 0, 'Afuera'),
(15, 21, 4, 'LIBRE', 240, 0, 'Afuera'),
(16, 22, 4, 'LIBRE', 400, 0, 'Afuera'),
(17, 23, 4, 'LIBRE', 160, 160, 'Afuera'),
(18, 24, 4, 'LIBRE', 320, 160, 'Afuera'),
(19, 14, 4, 'LIBRE', 320, 160, 'Planta Alta');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id_producto` int(11) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `disponible` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_producto`, `id_categoria`, `nombre`, `descripcion`, `precio`, `disponible`) VALUES
(1, 2, 'Pizza Especial', 'Muzzarella, jamón y morrones', 6500.00, 1),
(2, 2, 'Pizza Margarita', 'Muzzarella, albahaca y tomate', 5500.00, 1),
(3, 3, 'Coca Cola 1.5L', 'Gaseosa linea Coca Cola', 4000.00, 1),
(4, 1, 'Hamburguesa + Papas + Gaseosa 1.5L', NULL, 12000.00, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('MOZO','COCINA','CAJERO','ADMIN') NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre`, `apellido`, `email`, `password`, `rol`, `activo`) VALUES
(1, 'Mozo', 'Prueba', 'mozo@restosoft.com', '1234', 'MOZO', 0),
(2, 'Milagros', 'Nievas', 'milagros@restosoft.com', 'admin123', 'CAJERO', 1),
(3, 'Marcos', 'Chef', 'marcos@restosoft.com', 'cocina123', 'COCINA', 1),
(5, 'Juan', 'Mozo', 'juan@restosoft.com', 'mozo123', 'MOZO', 1),
(6, 'Elio', '', 'elio@restosoft.com', 'elio123', 'ADMIN', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `auditoria_estado`
--
ALTER TABLE `auditoria_estado`
  ADD PRIMARY KEY (`id_auditoria`),
  ADD KEY `id_instancia` (`id_instancia`),
  ADD KEY `usuario_responsable` (`usuario_responsable`);

--
-- Indices de la tabla `categoria_producto`
--
ALTER TABLE `categoria_producto`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`);

--
-- Indices de la tabla `comanda`
--
ALTER TABLE `comanda`
  ADD PRIMARY KEY (`id_comanda`),
  ADD KEY `id_instancia` (`id_instancia`),
  ADD KEY `FKdysjuh9mxdsspefp3dqh9csra` (`id_mesa`),
  ADD KEY `FKsdwoudan60ymltuh0p0brcduf` (`id_usuario`);

--
-- Indices de la tabla `factura`
--
ALTER TABLE `factura`
  ADD PRIMARY KEY (`id_factura`),
  ADD UNIQUE KEY `id_instancia` (`id_instancia`),
  ADD KEY `id_cajero` (`id_cajero`);

--
-- Indices de la tabla `historial_mesa`
--
ALTER TABLE `historial_mesa`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK3jgypuiyipmttpc9jyodsk9fj` (`mesa_id`);

--
-- Indices de la tabla `instancia_mesa`
--
ALTER TABLE `instancia_mesa`
  ADD PRIMARY KEY (`id_instancia`),
  ADD KEY `id_mesa` (`id_mesa`),
  ADD KEY `id_mozo` (`id_mozo`);

--
-- Indices de la tabla `item_comanda`
--
ALTER TABLE `item_comanda`
  ADD PRIMARY KEY (`id_item`),
  ADD KEY `id_comanda` (`id_comanda`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `mesa`
--
ALTER TABLE `mesa`
  ADD PRIMARY KEY (`id_mesa`),
  ADD UNIQUE KEY `numero_mesa` (`numero_mesa`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `id_categoria` (`id_categoria`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `auditoria_estado`
--
ALTER TABLE `auditoria_estado`
  MODIFY `id_auditoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `categoria_producto`
--
ALTER TABLE `categoria_producto`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `comanda`
--
ALTER TABLE `comanda`
  MODIFY `id_comanda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `factura`
--
ALTER TABLE `factura`
  MODIFY `id_factura` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `historial_mesa`
--
ALTER TABLE `historial_mesa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `instancia_mesa`
--
ALTER TABLE `instancia_mesa`
  MODIFY `id_instancia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `item_comanda`
--
ALTER TABLE `item_comanda`
  MODIFY `id_item` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `mesa`
--
ALTER TABLE `mesa`
  MODIFY `id_mesa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `auditoria_estado`
--
ALTER TABLE `auditoria_estado`
  ADD CONSTRAINT `auditoria_estado_ibfk_1` FOREIGN KEY (`id_instancia`) REFERENCES `instancia_mesa` (`id_instancia`),
  ADD CONSTRAINT `auditoria_estado_ibfk_2` FOREIGN KEY (`usuario_responsable`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `comanda`
--
ALTER TABLE `comanda`
  ADD CONSTRAINT `FKdysjuh9mxdsspefp3dqh9csra` FOREIGN KEY (`id_mesa`) REFERENCES `mesa` (`id_mesa`),
  ADD CONSTRAINT `FKsdwoudan60ymltuh0p0brcduf` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  ADD CONSTRAINT `comanda_ibfk_1` FOREIGN KEY (`id_instancia`) REFERENCES `instancia_mesa` (`id_instancia`);

--
-- Filtros para la tabla `factura`
--
ALTER TABLE `factura`
  ADD CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`id_instancia`) REFERENCES `instancia_mesa` (`id_instancia`),
  ADD CONSTRAINT `factura_ibfk_2` FOREIGN KEY (`id_cajero`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `historial_mesa`
--
ALTER TABLE `historial_mesa`
  ADD CONSTRAINT `FK3jgypuiyipmttpc9jyodsk9fj` FOREIGN KEY (`mesa_id`) REFERENCES `mesa` (`id_mesa`);

--
-- Filtros para la tabla `instancia_mesa`
--
ALTER TABLE `instancia_mesa`
  ADD CONSTRAINT `instancia_mesa_ibfk_1` FOREIGN KEY (`id_mesa`) REFERENCES `mesa` (`id_mesa`),
  ADD CONSTRAINT `instancia_mesa_ibfk_2` FOREIGN KEY (`id_mozo`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `item_comanda`
--
ALTER TABLE `item_comanda`
  ADD CONSTRAINT `item_comanda_ibfk_1` FOREIGN KEY (`id_comanda`) REFERENCES `comanda` (`id_comanda`),
  ADD CONSTRAINT `item_comanda_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria_producto` (`id_categoria`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
