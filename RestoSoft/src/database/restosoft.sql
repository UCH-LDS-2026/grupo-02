-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 30-05-2026 a las 01:04:38
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
  `metodo_pago` enum('EFECTIVO','TARJETA','TRANSFERENCIA') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `comanda`
--
ALTER TABLE `comanda`
  MODIFY `id_comanda` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `factura`
--
ALTER TABLE `factura`
  MODIFY `id_factura` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `instancia_mesa`
--
ALTER TABLE `instancia_mesa`
  MODIFY `id_instancia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `item_comanda`
--
ALTER TABLE `item_comanda`
  MODIFY `id_item` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mesa`
--
ALTER TABLE `mesa`
  MODIFY `id_mesa` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT;

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
