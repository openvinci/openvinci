SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
DROP TABLE IF EXISTS `tbl_balance` CASCADE;

CREATE TABLE `tbl_balance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contabilidad` int(11) NOT NULL,
  `periodo` int(11) NOT NULL,
  PRIMARY KEY (`id`,`contabilidad`,`periodo`),
  KEY `fk_tbl_balance_tbl_contabilidad1_idx` (`contabilidad`),
  KEY `fk_tbl_balance_tbl_periodo1_idx` (`periodo`),
  CONSTRAINT `fk_tbl_balance_tbl_contabilidad1` FOREIGN KEY (`contabilidad`) REFERENCES `tbl_contabilidad` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_tbl_balance_tbl_periodo1` FOREIGN KEY (`periodo`) REFERENCES `tbl_periodo` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `tbl_balance_detalle` CASCADE;

CREATE TABLE `tbl_balance_detalle` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `balance` int(11) NOT NULL,
  `catalogo` int(11) NOT NULL,
  `cuenta` varchar(20) NOT NULL,
  `ini_debe` double DEFAULT NULL,
  `ini_haber` double DEFAULT NULL,
  `per_debe` double DEFAULT NULL,
  `per_haber` double DEFAULT NULL,
  `fin_debe` double DEFAULT NULL,
  `fin_haber` double DEFAULT NULL,
  PRIMARY KEY (`id`,`balance`,`catalogo`,`cuenta`),
  KEY `fk_tbl_balance_detalle_tbl_balance1_idx` (`balance`),
  KEY `fk_tbl_balance_detalle_tbl_cuenta1_idx` (`cuenta`,`catalogo`),
  CONSTRAINT `fk_tbl_balance_detalle_tbl_balance1` FOREIGN KEY (`balance`) REFERENCES `tbl_balance` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tbl_balance_detalle_tbl_cuenta1` FOREIGN KEY (`cuenta`, `catalogo`) REFERENCES `tbl_cuenta` (`id`, `catalogo`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `tbl_catalogo` CASCADE;

CREATE TABLE `tbl_catalogo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` tinytext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

INSERT INTO `tbl_catalogo` ( ID, NOMBRE ) VALUES
 ( 1, 'catalogo 1' );

DROP TABLE IF EXISTS `tbl_consolidados` CASCADE;

CREATE TABLE `tbl_consolidados` (
  `contabilidad` int(11) NOT NULL,
  `origen` int(11) NOT NULL,
  PRIMARY KEY (`contabilidad`,`origen`),
  UNIQUE KEY `UNIQUE` (`contabilidad`,`origen`),
  KEY `fk_tbl_origenes_tbl_contabilidad2_idx` (`origen`),
  CONSTRAINT `fk_tbl_origenes_tbl_contabilidad1` FOREIGN KEY (`contabilidad`) REFERENCES `tbl_contabilidad` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_tbl_origenes_tbl_contabilidad2` FOREIGN KEY (`origen`) REFERENCES `tbl_contabilidad` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `tbl_contabilidad` CASCADE;

CREATE TABLE `tbl_contabilidad` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `tipo_cierre` varchar(10) NOT NULL,
  `cuenta_cierre` varchar(20) NOT NULL,
  `catalogo` int(11) NOT NULL,
  `tipo_numeracion` varchar(10) NOT NULL,
  `prefijo_partida` varchar(10) DEFAULT NULL,
  `numero_partida` int(11) DEFAULT NULL,
  `lugares_partida` int(11) DEFAULT NULL,
  `consolidada` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`,`cuenta_cierre`,`catalogo`),
  KEY `fk_tbl_contabilidad_tbl_cuenta1_idx` (`cuenta_cierre`,`catalogo`),
  CONSTRAINT `fk_tbl_contabilidad_tbl_cuenta1` FOREIGN KEY (`cuenta_cierre`, `catalogo`) REFERENCES `tbl_cuenta` (`id`, `catalogo`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `tbl_cuenta` CASCADE;

CREATE TABLE `tbl_cuenta` (
  `id` varchar(20) NOT NULL,
  `catalogo` int(11) NOT NULL,
  `nombre` tinytext NOT NULL,
  `padre` varchar(20) DEFAULT NULL,
  `detalle` tinyint(1) DEFAULT NULL,
  `grupo` int(11) NOT NULL,
  `nivel` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`,`catalogo`,`grupo`),
  UNIQUE KEY `UNIQUE` (`id`,`catalogo`),
  KEY `fk_tbl_cuenta_tbl_grupo_balance1_idx` (`grupo`),
  KEY `fk_tbl_cuenta_tbl_catalogo1_idx` (`catalogo`),
  CONSTRAINT `fk_tbl_cuenta_tbl_catalogo1` FOREIGN KEY (`catalogo`) REFERENCES `tbl_catalogo` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_tbl_cuenta_tbl_grupo_balance1` FOREIGN KEY (`grupo`) REFERENCES `tbl_grupo` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `tbl_grupo` CASCADE;

CREATE TABLE `tbl_grupo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `debe` tinyint(1) DEFAULT NULL COMMENT 'comportamiento de la cuenta:\ndebe = 1, haber = 0',
  `editable` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

INSERT INTO `tbl_grupo` ( ID, NOMBRE, DEBE, EDITABLE ) VALUES
 ( 1, 'Activos', 1, 0 ),
 ( 2, 'Capital', 0, 0 ),
 ( 3, 'Gastos', 1, 0 ),
 ( 4, 'Ingresos', 0, 0 ),
 ( 5, 'Otros CR', 1, 0 ),
 ( 6, 'Otros DB', 0, 0 ),
 ( 7, 'Pasivos', 0, 0 );

DROP TABLE IF EXISTS `tbl_libro` CASCADE;

CREATE TABLE `tbl_libro` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contabilidad` int(11) NOT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `tipo` varchar(8) DEFAULT NULL,
  `editable` tinyint(1) DEFAULT '1',
  `prefijo_partida` varchar(10) DEFAULT NULL,
  `numero_partida` int(11) DEFAULT NULL,
  `lugares_partida` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`,`contabilidad`),
  KEY `fk_tbl_libro_tbl_contabilidad1_idx` (`contabilidad`),
  CONSTRAINT `fk_tbl_libro_tbl_contabilidad1` FOREIGN KEY (`contabilidad`) REFERENCES `tbl_contabilidad` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `tbl_marcador` CASCADE;

CREATE TABLE `tbl_marcador` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contabilidad` int(11) NOT NULL,
  `nombre` varchar(12) NOT NULL,
  `descrip` tinytext,
  PRIMARY KEY (`id`,`contabilidad`),
  KEY `fk_tbl_marcador_tbl_contabilidad1_idx` (`contabilidad`),
  CONSTRAINT `fk_tbl_marcador_tbl_contabilidad1` FOREIGN KEY (`contabilidad`) REFERENCES `tbl_contabilidad` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `tbl_partida` CASCADE;

CREATE TABLE `tbl_partida` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contabilidad` int(11) NOT NULL,
  `libro` int(11) NOT NULL,
  `periodo` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `tipo_partida` int(11) NOT NULL,
  `numero_partida` tinytext,
  `referencia` tinytext,
  `concepto` tinytext,
  `valor` double DEFAULT NULL,
  `anulada` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`,`contabilidad`,`libro`,`periodo`,`tipo_partida`),
  KEY `fk_tbl_partida_tbl_periodo1_idx` (`periodo`),
  KEY `fk_tbl_partida_tbl_libro1_idx` (`libro`,`contabilidad`),
  KEY `fk_tbl_partida_tbl_tipo_partida1_idx` (`tipo_partida`),
  CONSTRAINT `fk_tbl_partida_tbl_libro1` FOREIGN KEY (`libro`, `contabilidad`) REFERENCES `tbl_libro` (`id`, `contabilidad`) ON UPDATE CASCADE,
  CONSTRAINT `fk_tbl_partida_tbl_periodo1` FOREIGN KEY (`periodo`) REFERENCES `tbl_periodo` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_tbl_partida_tbl_tipo_partida1` FOREIGN KEY (`tipo_partida`) REFERENCES `tbl_tipo_partida` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `tbl_partida_detalle` CASCADE;

CREATE TABLE `tbl_partida_detalle` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `partida` int(11) NOT NULL,
  `catalogo` int(11) NOT NULL,
  `cuenta` varchar(20) NOT NULL,
  `concepto` tinytext,
  `debe` double DEFAULT NULL,
  `haber` double DEFAULT NULL,
  `marcador` int(11) DEFAULT NULL,
  `proveedor` int(11) DEFAULT NULL,
  `tipo_doc` int(11) DEFAULT NULL,
  `serie_doc` varchar(8) DEFAULT NULL,
  `numero_doc` varchar(16) DEFAULT NULL,
  `fecha_doc` date DEFAULT NULL,
  `observaciones` tinytext,
  PRIMARY KEY (`id`,`partida`,`catalogo`,`cuenta`),
  KEY `fk_tbl_partida_detalle_tbl_partida1_idx` (`partida`),
  KEY `fk_tbl_partida_detalle_tbl_marcador1_idx` (`marcador`),
  KEY `fk_tbl_partida_detalle_tbl_cuenta1_idx` (`cuenta`,`catalogo`),
  KEY `fk_tbl_partida_detalle_tbl_proveedor1_idx` (`proveedor`),
  KEY `fk_tbl_partida_detalle_tbl_tipo_documento1_idx` (`tipo_doc`),
  CONSTRAINT `fk_tbl_partida_detalle_tbl_cuenta1` FOREIGN KEY (`cuenta`, `catalogo`) REFERENCES `tbl_cuenta` (`id`, `catalogo`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tbl_partida_detalle_tbl_marcador1` FOREIGN KEY (`marcador`) REFERENCES `tbl_marcador` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_tbl_partida_detalle_tbl_partida1` FOREIGN KEY (`partida`) REFERENCES `tbl_partida` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_tbl_partida_detalle_tbl_proveedor1` FOREIGN KEY (`proveedor`) REFERENCES `tbl_proveedor` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_tbl_partida_detalle_tbl_tipo_documento1` FOREIGN KEY (`tipo_doc`) REFERENCES `tbl_tipo_documento` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `tbl_periodo` CASCADE;

CREATE TABLE `tbl_periodo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `inicio` date NOT NULL,
  `fin` date NOT NULL,
  `ejercicio` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `tbl_proveedor` CASCADE;

CREATE TABLE `tbl_proveedor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` tinytext NOT NULL,
  `NIT` varchar(16) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `tbl_tipo_documento` CASCADE;

CREATE TABLE `tbl_tipo_documento` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` tinytext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `tbl_tipo_partida` CASCADE;

CREATE TABLE `tbl_tipo_partida` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` tinytext NOT NULL,
  `descrip` text,
  `editable` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `tbl_user_contab` CASCADE;

CREATE TABLE `tbl_user_contab` (
  `user` int(11) NOT NULL,
  `contabilidad` int(11) NOT NULL,
  PRIMARY KEY (`user`,`contabilidad`),
  UNIQUE KEY `UNIQUE` (`user`,`contabilidad`),
  KEY `fk_tbl_user_contab_tbl_contabilidad1_idx` (`contabilidad`),
  CONSTRAINT `fk_tbl_user_contab_tbl_contabilidad1` FOREIGN KEY (`contabilidad`) REFERENCES `tbl_contabilidad` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tbl_user_contab_tbl_users1` FOREIGN KEY (`user`) REFERENCES `tbl_users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `tbl_user_permits` CASCADE;

CREATE TABLE `tbl_user_permits` (
  `user` int(11) NOT NULL,
  `permit` varchar(45) NOT NULL,
  PRIMARY KEY (`user`,`permit`),
  CONSTRAINT `fk_tbl_user_permits_tbl_users` FOREIGN KEY (`user`) REFERENCES `tbl_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `tbl_user_permits` ( USER, PERMIT ) VALUES
 ( 1, '1' ),
 ( 1, '10' ),
 ( 1, '103' ),
 ( 1, '104' ),
 ( 1, '105' ),
 ( 1, '106' ),
 ( 1, '11' ),
 ( 1, '13' ),
 ( 1, '14' ),
 ( 1, '15' ),
 ( 1, '17' ),
 ( 1, '18' ),
 ( 1, '19' ),
 ( 1, '2' ),
 ( 1, '21' ),
 ( 1, '22' ),
 ( 1, '24' ),
 ( 1, '3' ),
 ( 1, '37' ),
 ( 1, '4' ),
 ( 1, '5' ),
 ( 1, '6' ),
 ( 1, '7' ),
 ( 1, '8' ),
 ( 1, '9' ),
 ( 2, '1' ),
 ( 2, '10' ),
 ( 2, '103' ),
 ( 2, '104' ),
 ( 2, '105' ),
 ( 2, '106' ),
 ( 2, '11' ),
 ( 2, '13' ),
 ( 2, '14' ),
 ( 2, '15' ),
 ( 2, '17' ),
 ( 2, '18' ),
 ( 2, '19' ),
 ( 2, '2' ),
 ( 2, '21' ),
 ( 2, '22' ),
 ( 2, '24' ),
 ( 2, '3' ),
 ( 2, '37' ),
 ( 2, '4' ),
 ( 2, '5' ),
 ( 2, '6' ),
 ( 2, '7' ),
 ( 2, '8' ),
 ( 2, '9' );

DROP TABLE IF EXISTS `tbl_users` CASCADE;

CREATE TABLE `tbl_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` tinytext NOT NULL,
  `email` tinytext,
  `pass` tinytext,
  `type` int(11) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

INSERT INTO `tbl_users` ( ID, NAME, EMAIL, PASS, TYPE, ACTIVE ) VALUES
 ( 1, 'Administrador', null, null, 0, 1 ),
 ( 2, 'Administrador', 'dont@mail.me', 'root', 1, 1 ),
 ( 3, 'Supervisor', null, null, 0, 1 ),
 ( 4, 'Gerente', null, null, 0, 1 ),
 ( 5, 'Operador Avanzado', null, null, 0, 1 ),
 ( 6, 'Operador Medio', null, null, 0, 1 ),
 ( 7, 'Operador Basico', null, null, 0, 1 ),
 ( 8, 'Operador de Banco', null, null, 0, 1 );

