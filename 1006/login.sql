-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 04, 2023 at 08:37 AM
-- Server version: 5.7.24
-- PHP Version: 8.0.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `login`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateResourceRate` (IN `userId` INT)   BEGIN
    DECLARE totalRate FLOAT DEFAULT 0;  -- Set default value to 0
    
 SELECT COALESCE(SUM(m.quantity * c.bonus), 0) INTO totalRate
    FROM mining_area m
    JOIN cards c ON m.card_type = c.card_type
    WHERE m.user_id = userId;
    
    -- If totalRate is NULL, set it to 0
    IF totalRate IS NULL THEN
        SET totalRate = 0;
    END IF;
    
    UPDATE users SET totalResourceRate = totalRate WHERE user_id = userId;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `attributes`
--

CREATE TABLE `attributes` (
  `card_type` char(10) NOT NULL,
  `health` int(11) NOT NULL,
  `agility` int(11) NOT NULL,
  `strength` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `attributes`
--

INSERT INTO `attributes` (`card_type`, `health`, `agility`, `strength`) VALUES
('A', 100, 50, 50),
('B', 120, 40, 60),
('C', 80, 60, 40),
('D', 100, 50, 50),
('E', 120, 40, 60),
('F', 100, 50, 50),
('G', 120, 40, 60),
('H', 80, 60, 40),
('I', 100, 50, 50),
('J', 120, 40, 60),
('K', 100, 50, 50),
('L', 120, 40, 60),
('M', 80, 60, 40),
('M', 100, 50, 50),
('O', 120, 40, 60),
('P', 100, 50, 50),
('Q', 120, 40, 60),
('R', 80, 60, 40),
('S', 100, 50, 50),
('T', 120, 40, 60),
('U', 100, 50, 50),
('V', 120, 40, 60),
('W', 80, 60, 40),
('X', 100, 50, 50),
('Y', 120, 40, 60),
('Z', 100, 50, 50),
('AA', 120, 40, 60),
('AB', 80, 60, 40),
('AC', 100, 50, 50),
('AD', 120, 40, 60),
('AE', 100, 50, 50),
('AF', 120, 40, 60),
('AG', 80, 60, 40),
('AH', 100, 50, 50),
('AI', 120, 40, 60),
('AJ', 100, 50, 50),
('AK', 120, 40, 60),
('AL', 80, 60, 40),
('AM', 100, 50, 50),
('AN', 80, 60, 40),
('AO', 100, 50, 50);

-- --------------------------------------------------------

--
-- Table structure for table `battles`
--

CREATE TABLE `battles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `character1_health` int(11) NOT NULL,
  `character2_health` int(11) NOT NULL,
  `status` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `cards`
--

CREATE TABLE `cards` (
  `card_id` int(11) NOT NULL,
  `card_type` varchar(255) NOT NULL,
  `bonus` float DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `cards`
--

INSERT INTO `cards` (`card_id`, `card_type`, `bonus`) VALUES
(1, 'A', 5),
(2, 'B', 4),
(3, 'C', 3),
(4, 'D', 3),
(5, 'E', 3),
(6, 'F', 3),
(7, 'G', 3),
(8, 'H', 3),
(9, 'I', 3),
(10, 'J', 3),
(11, 'K', 3),
(12, 'M', 3),
(13, 'N', 3),
(14, 'L', 3),
(15, 'O', 3),
(16, 'P', 3),
(17, 'Q', 3),
(18, 'R', 3),
(19, 'S', 3),
(20, 'T', 3),
(21, 'U', 3),
(22, 'V', 3),
(23, 'W', 3),
(24, 'X', 3),
(25, 'Y', 3),
(26, 'Z', 3),
(27, 'AA', 3),
(28, 'AB', 3),
(29, 'AC', 3),
(30, 'AD', 3),
(31, 'AE', 3),
(32, 'AF', 3),
(33, 'AG', 3),
(34, 'AH', 3),
(35, 'AI', 3),
(36, 'AJ', 3),
(37, 'AK', 3),
(38, 'AL', 3),
(39, 'AM', 3),
(40, 'AN', 3),
(41, 'AO', 3);

-- --------------------------------------------------------

--
-- Table structure for table `card_images`
--

CREATE TABLE `card_images` (
  `image_id` int(11) NOT NULL,
  `card_type` char(10) NOT NULL,
  `image_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `card_images`
--

INSERT INTO `card_images` (`image_id`, `card_type`, `image_url`) VALUES
(30, 'A', '/images/pok/A.png'),
(31, 'B', '/images/pok/B.png'),
(32, 'C', '/images/pok/C.png'),
(33, 'D', '/images/pok/D.png'),
(34, 'E', '/images/pok/E.png'),
(35, 'F', '/images/pok/F.png'),
(36, 'G', '/images/pok/G.png'),
(37, 'H', '/images/pok/H.png'),
(38, 'I', '/images/pok/I.png'),
(39, 'K', '/images/pok/K.png'),
(40, 'L', '/images/pok/L.png'),
(41, 'M', '/images/pok/M.png'),
(42, 'N', '/images/pok/N.png'),
(43, 'O', '/images/pok/O.png'),
(44, 'P', '/images/pok/P.png'),
(45, 'Q', '/images/pok/Q.png'),
(46, 'R', '/images/pok/R.png'),
(47, 'S', '/images/pok/S.png'),
(48, 'T', '/images/pok/T.png'),
(49, 'U', '/images/pok/U.png'),
(50, 'V', '/images/pok/V.png'),
(51, 'W', '/images/pok/W.png'),
(52, 'X', '/images/pok/X.png'),
(53, 'Y', '/images/pok/Y.png'),
(54, 'Z', '/images/pok/Z.png'),
(55, 'AA', '/images/pok/AA.png'),
(56, 'AB', '/images/pok/AB.png'),
(57, 'AC', '/images/pok/AC.png'),
(58, 'AD', '/images/pok/AD.png'),
(59, 'AE', '/images/pok/AE.png'),
(60, 'AF', '/images/pok/AF.png'),
(61, 'AG', '/images/pok/AG.png'),
(62, 'AH', '/images/pok/AH.png'),
(63, 'AI', '/images/pok/AI.png'),
(64, 'AJ', '/images/pok/AJ.png'),
(65, 'AK', '/images/pok/AK.png'),
(66, 'AL', '/images/pok/AL.png'),
(67, 'AM', '/images/pok/AM.png'),
(68, 'AN', '/images/pok/AN.png'),
(69, 'AO', '/images/pok/AO.png'),
(70, 'J', '/images/pok/J.png');

-- --------------------------------------------------------

--
-- Table structure for table `levels`
--

CREATE TABLE `levels` (
  `levelId` int(11) NOT NULL,
  `health` int(11) NOT NULL,
  `agility` int(11) NOT NULL,
  `strength` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `levels`
--

INSERT INTO `levels` (`levelId`, `health`, `agility`, `strength`) VALUES
(1, 100, 40, 50),
(2, 150, 30, 70),
(3, 90, 70, 30);

-- --------------------------------------------------------

--
-- Table structure for table `mining_area`
--

CREATE TABLE `mining_area` (
  `card_id` char(36) NOT NULL,
  `user_id` int(11) NOT NULL,
  `card_type` char(10) NOT NULL,
  `quantity` int(11) DEFAULT '1',
  `count` int(11) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `transaction_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` float NOT NULL,
  `status` varchar(255) NOT NULL,
  `transactionDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `order_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `date_joined` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_login` datetime DEFAULT NULL,
  `totalResourceRate` float DEFAULT '0',
  `totalResources` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `user_bag`
--

CREATE TABLE `user_bag` (
  `card_id` char(36) NOT NULL,
  `user_id` int(11) NOT NULL,
  `card_type` char(10) NOT NULL,
  `quantity` int(11) DEFAULT '1',
  `count` int(11) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `wallet`
--

CREATE TABLE `wallet` (
  `wallet_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `coins` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attributes`
--
ALTER TABLE `attributes`
  ADD KEY `card_type` (`card_type`);

--
-- Indexes for table `battles`
--
ALTER TABLE `battles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cards`
--
ALTER TABLE `cards`
  ADD PRIMARY KEY (`card_id`),
  ADD UNIQUE KEY `card_type` (`card_type`);

--
-- Indexes for table `card_images`
--
ALTER TABLE `card_images`
  ADD PRIMARY KEY (`image_id`),
  ADD UNIQUE KEY `card_type` (`card_type`);

--
-- Indexes for table `levels`
--
ALTER TABLE `levels`
  ADD PRIMARY KEY (`levelId`);

--
-- Indexes for table `mining_area`
--
ALTER TABLE `mining_area`
  ADD PRIMARY KEY (`card_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `card_type` (`card_type`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_bag`
--
ALTER TABLE `user_bag`
  ADD PRIMARY KEY (`card_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `card_type` (`card_type`);

--
-- Indexes for table `wallet`
--
ALTER TABLE `wallet`
  ADD PRIMARY KEY (`wallet_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `battles`
--
ALTER TABLE `battles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cards`
--
ALTER TABLE `cards`
  MODIFY `card_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `card_images`
--
ALTER TABLE `card_images`
  MODIFY `image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `levels`
--
ALTER TABLE `levels`
  MODIFY `levelId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `wallet`
--
ALTER TABLE `wallet`
  MODIFY `wallet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attributes`
--
ALTER TABLE `attributes`
  ADD CONSTRAINT `attributes_ibfk_1` FOREIGN KEY (`card_type`) REFERENCES `card_images` (`card_type`);

--
-- Constraints for table `mining_area`
--
ALTER TABLE `mining_area`
  ADD CONSTRAINT `mining_area_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mining_area_ibfk_2` FOREIGN KEY (`card_type`) REFERENCES `card_images` (`card_type`);

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_bag`
--
ALTER TABLE `user_bag`
  ADD CONSTRAINT `user_bag_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_bag_ibfk_2` FOREIGN KEY (`card_type`) REFERENCES `card_images` (`card_type`);

--
-- Constraints for table `wallet`
--
ALTER TABLE `wallet`
  ADD CONSTRAINT `wallet_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
