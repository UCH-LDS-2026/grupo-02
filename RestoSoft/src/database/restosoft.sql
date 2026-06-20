-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 20-06-2026 a las 04:18:49
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
  `usuario_responsable` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
(1, 'Pizzas', 'Pizzas a la piedra'),
(2, 'Bebidas', 'Bebidas frías sin alcohol');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comanda`
--

CREATE TABLE `comanda` (
  `id_comanda` int(11) NOT NULL,
  `id_instancia` int(11) NOT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `estado` enum('PENDIENTE','EN_PRODUCCION','LISTO','ENTREGADO') DEFAULT 'PENDIENTE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `comanda`
--

INSERT INTO `comanda` (`id_comanda`, `id_instancia`, `fecha_creacion`, `estado`) VALUES
(3, 1, '2026-06-05 23:29:38', 'EN_PRODUCCION');

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
(9, 'OCUPADA', 'LIBRE', '2026-06-13 01:46:56.000000', 1);

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
  `estado_actual` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `instancia_mesa`
--

INSERT INTO `instancia_mesa` (`id_instancia`, `id_mesa`, `id_mozo`, `fecha_apertura`, `fecha_cierre`, `estado_actual`) VALUES
(1, 1, 1, '2026-06-05 20:28:56', NULL, 'ABIERTA');

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
  `observaciones` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `item_comanda`
--

INSERT INTO `item_comanda` (`id_item`, `id_comanda`, `id_producto`, `cantidad`, `subtotal`, `observaciones`) VALUES
(1, 3, 1, 2, 13000.00, 'Masa a la piedra, bien cocida');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mesa`
--

CREATE TABLE `mesa` (
  `id_mesa` int(11) NOT NULL,
  `numero_mesa` int(11) NOT NULL,
  `capacidad` int(11) NOT NULL,
  `estado` enum('LIBRE','OCUPADA','PEDIDO_EN_CURSO','POR_COBRAR') DEFAULT 'LIBRE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mesa`
--

INSERT INTO `mesa` (`id_mesa`, `numero_mesa`, `capacidad`, `estado`) VALUES
(1, 1, 2, 'LIBRE'),
(2, 2, 2, 'LIBRE'),
(3, 3, 4, 'OCUPADA'),
(4, 4, 4, 'LIBRE'),
(5, 5, 6, 'PEDIDO_EN_CURSO'),
(6, 6, 8, 'OCUPADA');

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
(1, 1, 'Pizza Especial', 'Muzzarella, jamón y morrones', 6500.00, 1),
(2, 1, 'Pizza Margarita', 'Muzzarella, albahaca y tomate', 5500.00, 1),
(3, 2, 'Coca Cola 1.5L', 'Gaseosa linea Coca Cola', 2000.00, 1);

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
(1, 'Mozo', 'Prueba', 'mozo@restosoft.com', '1234', 'MOZO', 1),
(2, 'Milagros', 'Gerente', 'admin@restosoft.com', 'admin123', 'ADMIN', 1),
(3, 'Carlos', 'Chef', 'cocina@restosoft.com', 'cocina123', '', 1),
(5, 'Juan', 'Mozo', 'juan@restosoft.com', '1234', 'MOZO', 1);

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
-- Indices de la tabla `comanda`
--
ALTER TABLE `comanda`
  ADD PRIMARY KEY (`id_comanda`),
  ADD KEY `id_instancia` (`id_instancia`);

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
  MODIFY `id_auditoria` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categoria_producto`
--
ALTER TABLE `categoria_producto`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `comanda`
--
ALTER TABLE `comanda`
  MODIFY `id_comanda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `factura`
--
ALTER TABLE `factura`
  MODIFY `id_factura` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `historial_mesa`
--
ALTER TABLE `historial_mesa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `instancia_mesa`
--
ALTER TABLE `instancia_mesa`
  MODIFY `id_instancia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `item_comanda`
--
ALTER TABLE `item_comanda`
  MODIFY `id_item` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `mesa`
--
ALTER TABLE `mesa`
  MODIFY `id_mesa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
