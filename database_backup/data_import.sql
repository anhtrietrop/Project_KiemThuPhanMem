-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: mysql-113d396c-anhtrietrop-c340.j.aivencloud.com    Database: defaultdb
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '42d1339c-cff7-11f0-b361-167233615d7b:1-282';

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Cart_userId_key` (`userId`),
  KEY `Cart_userId_idx` (`userId`),
  CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES ('11b1f6e0-d663-40eb-a8dc-630c4bab8fcc','bd60812f-6f64-4e72-a33a-3e7f4b465a2f','2025-12-09 11:57:28.675','2025-12-09 11:57:28.674'),('71636b1f-adea-49b6-a8b3-ccc792609d90','d683b7f7-92b1-4216-931f-43daf6851aad','2025-11-25 11:21:31.762','2025-11-25 11:21:31.761'),('a9a8270a-4764-407b-ac95-3badd763d09b','d030b483-cdbf-4fad-b209-6f63deea670a','2025-12-09 08:40:37.233','2025-12-09 08:40:37.232');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cartitem`
--

DROP TABLE IF EXISTS `cartitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cartitem` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cartId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CartItem_cartId_productId_key` (`cartId`,`productId`),
  KEY `CartItem_cartId_idx` (`cartId`),
  KEY `CartItem_productId_idx` (`productId`),
  CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `cart` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cartitem`
--

LOCK TABLES `cartitem` WRITE;
/*!40000 ALTER TABLE `cartitem` DISABLE KEYS */;
INSERT INTO `cartitem` VALUES ('41dcfec3-c30d-410e-b49f-63ba197bc3ba','a9a8270a-4764-407b-ac95-3badd763d09b','1',1,'2025-12-15 09:39:11.805','2025-12-15 09:39:11.804'),('e572bcb7-ceb1-435e-b1cd-b72906580d1a','11b1f6e0-d663-40eb-a8dc-630c4bab8fcc','1',1,'2025-12-09 12:06:03.447','2025-12-09 12:06:03.446');
/*!40000 ALTER TABLE `cartitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Category_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES ('6667d6ae-0fdf-43f3-8fd1-1e0aa160fc59','Apple'),('659a91b9-3ff6-47d5-9830-5e7ac905b961','cameras'),('1cb9439a-ea47-4a33-913b-e9bf935bc\r\nc0b','earbuds'),('4c2cc9ec-7504-4b7c-8ecd-2379a854a423','headphones'),('8d2a091c-4b90-4d60-b191-114b895f3e54','juice\r\nrs'),('782e7829-806b-489f-8c3a-2689548d7153','laptops'),('6c3b8591-b01e-4842-bce1-2f5585bf3a28','mixer-grinders'),('\r\nd30b85e2-e544-4f48-8434-33fe0b591579','phone-gimbals'),('e467fd3b-3619-47ae-9736-1fb8d7938be3','Samsung'),('3117a1b0-6369-491e-8b8b-9fdd5ad9912e','smart-phones'),('5b4a4ca3-0005-4ac0-b318-1db7a31e3ca4','Sony'),('7a2\r\n41318-624f-48f7-9921-1818f6c20d85','speakers'),('ada699e5-e764-4da0-8d3e-18a8c8c5ed24','tablets'),('26171434-eb1d-44\r\ned-bae1-d4d72c446425','Test \r\nCategory'),('313eee86-bc11-4dc1-8cb0-6b2c2a2a1ccb','trimmers'),('a6896b67-197c-4b2a-b5e2-93954474d8b4','watches');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_order`
--

DROP TABLE IF EXISTS `customer_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_order` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adress` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apartment` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dateTime` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderNotice` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cancelReason` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total` int NOT NULL,
  `payment_status` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `payment_method` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_transaction_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_order_userId_idx` (`userId`),
  CONSTRAINT `customer_order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_order`
--

LOCK TABLES `customer_order` WRITE;
/*!40000 ALTER TABLE `customer_order` DISABLE KEYS */;
INSERT INTO `customer_order` VALUES ('2d88952c-d7ec-4e1e-a36f-fc42b5df93e2',NULL,'Mạnh','Phúc','+84931439171','phucmanhtran08@gmail.com','460/4 Nơ trang long','123','2025-12-09 11:58:18.731','success','Thành phố Hồ Chí Minh','',NULL,3000000,'PENDING',NULL,NULL,NULL),('4c7ac361-8bef-492a-a522-8a999a1cf7bb',NULL,'Anh Triết','Đỗ','0899517129','anhtrietrop@gmail.com','273 An Duong Vuong','DH Sai Gon','2025-12-15 08:59:30.622','shipped','Thanh Pho HCM','s',NULL,2000000,'PENDING',NULL,NULL,NULL),('6d89043d-b386-4eb4-b888-d585410eea00',NULL,'Vo Minh Thu','Đỗ','0899517129','anhtrietrop@gmail.com','273 An Duong Vuong','DH Sai Gon','2025-12-09 08:41:51.617','success','Thanh Pho HCM','',NULL,80000,'PAID',NULL,NULL,NULL),('924654bd-6624-4628-98f9-71c06b0cf9b8',NULL,'Anh Triết','Đỗ','0899517129','anhtrietrop@gmail.com','273 An Duong Vuong','DH Sai Gon','2025-12-15 07:50:41.710','processing','Thanh Pho HCM','',NULL,4000000,'PENDING',NULL,NULL,NULL),('96d1f962-2d7e-4b15-ae2e-86064aafe9f3',NULL,'Anh Triết','Đỗ','0899517129','anhtrietrop@gmail.com','273 An Duong Vuong','DH Sai Gon','2025-12-15 09:38:27.477','processing','Thanh Pho HCM','â',NULL,2000000,'PENDING',NULL,NULL,NULL),('bc87f672-6458-4519-87bf-8d02b33f2254',NULL,'Anh Triết','Đỗ','0899517129','anhtrietrop@gmail.com','273 An Duong Vuong','DH Sai Gon','2025-12-10 02:02:32.703','processing','Thanh Pho HCM','eere',NULL,1000000,'PENDING',NULL,NULL,NULL),('d5a13393-d685-43bc-bd5f-d915e8a4deb9',NULL,'Anh Triết','Đỗ','0899517129','anhtrietrop@gmail.com','273 An Duong Vuong','DH Sai Gon','2025-12-15 09:17:01.621','success','Thanh Pho HCM','ssss',NULL,1000000,'PENDING',NULL,NULL,NULL);
/*!40000 ALTER TABLE `customer_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_order_product`
--

DROP TABLE IF EXISTS `customer_order_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_order_product` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerOrderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_order_product_customerOrderId_fkey` (`customerOrderId`),
  KEY `customer_order_product_productId_fkey` (`productId`),
  CONSTRAINT `customer_order_product_customerOrderId_fkey` FOREIGN KEY (`customerOrderId`) REFERENCES `customer_order` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `customer_order_product_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_order_product`
--

LOCK TABLES `customer_order_product` WRITE;
/*!40000 ALTER TABLE `customer_order_product` DISABLE KEYS */;
INSERT INTO `customer_order_product` VALUES ('5315509e-7eeb-4f48-b274-deef46e28dd2','8cf583a3-9817-4ae0-8634-2022de1\r\n89d74','10',1),('7608601f-7c78-4385-8d4c-df5b5973e40f','bc87f672-6458-4519-87bf-8d02b33f2254','10',1),('761659f8-8ace-49c4-acd0-ff9d8fa7c08f','4c7ac361-8bef-492a-a522-8a999a1cf7bb','1',1),('7c2cc8bc-d843-41b2-a4a3-d85342554825','2d88952c-d7ec-4e1e-a36f-fc42b5df93e2','10',1),('7d5d1aea-43a5-4437-99b9-df22a1c8cdeb','f5e6f544-1d23-406b-a382-d5081ccea42e','12',1),('81ee0f9a-6bf\r\n9-4b17-9f0e-be7bc1d44a13','f21a6b37-b5e9-48b5-9fa5-17aea458c979','11',1),('90aa0bfd-1661-4933-814b-ea4bbcd8bfc2','96d1f962-2d7e-4b15-ae2e-86064aafe9f3','1',1),('a15f50d9-cb9c-43c8-acc7-5801e65ededa','6d89043d-b386-4eb4-b888-d585410eea00','10',1),('ea037d21-22b3-474a-9f1f-7f4d927da72e','2d88952c-d7ec-4e1e-a36f-fc42b5df93e2','1',1),('ed118a64-3b0a-490b-af01-6262fd539f6f','d5a13393-d685-43bc-bd5f-d915e8a4deb9','10',1);
/*!40000 ALTER TABLE `customer_order_product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `image`
--

DROP TABLE IF EXISTS `image`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `image` (
  `imageID` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productID` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`imageID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `image`
--

LOCK TABLES `image` WRITE;
/*!40000 ALTER TABLE `image` DISABLE KEYS */;
/*!40000 ALTER TABLE `image` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `merchant`
--

DROP TABLE IF EXISTS `merchant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `merchant` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `merchant`
--

LOCK TABLES `merchant` WRITE;
/*!40000 ALTER TABLE `merchant` DISABLE KEYS */;
INSERT INTO `merchant` VALUES ('1','Demo Merchant','This is demo merchant description',NULL,'1234567890','123 Demo \r\nSt, Demo City, DM 12345','active','2025-10-19 15:08:38.572','2025-10-19 17:00:44.939'),('test-merchant-id','Test \r\nMerchant','A merchant for testing purposes','merchant@test.com',NULL,NULL,'ACTIVE','2025-10-24 11:16:06.121','2025-10-24 11:16:06.121');
/*!40000 ALTER TABLE `merchant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `momopayment`
--

DROP TABLE IF EXISTS `momopayment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `momopayment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `requestId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` int NOT NULL,
  `orderInfo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `extraData` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deeplink` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qrCodeUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resultCode` int DEFAULT '-1',
  `message` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responseTime` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `MomoPayment_requestId_key` (`requestId`),
  KEY `MomoPayment_orderId_idx` (`orderId`),
  KEY `MomoPayment_resultCode_idx` (`resultCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `momopayment`
--

LOCK TABLES `momopayment` WRITE;
/*!40000 ALTER TABLE `momopayment` DISABLE KEYS */;
INSERT INTO `momopayment` VALUES ('2ea8c3ae-d744-495d-9ec4-02d2da10702a','96d1f962-2d7e-4b15-ae2e-86064aafe9f3','MOMO_1765791518415_2nzulv',2400005,'Thanh toán đơn hàng #96d1f962','{\"source\":\"web\",\"timestamp\":1765791517086}','https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xNT01PXzE3NjU3OTE1MTg0MTVfMm56dWx2&s=08e0bb8479533d9e7ffdf5c5c980adbd0d2c7d0d03d3b227493ee997010c33dc',NULL,NULL,NULL,0,'Thành công.',NULL,NULL,'2025-12-15 09:38:38.417','2025-12-15 09:38:40.956'),('3209f68c-bfad-450e-85a4-a28e7d03e86e','8cf583a3-9817-4ae0-8634-2022de189d74','MOM\r\nO_1760959466010_ivbw49',96005,'Thanh to├ín ─æ╞ín h├áng #8cf583a3','{\"source\":\"web\",\"timestamp\":1760959465973}','https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xNT01PXzE3NjA5NTk0NjYwMTBfaXZidzQ5&s=ce1fa314d17f1facc9b933d54\r\n3d7f5dc3e5185d08d2d7ecc559dad85e9f12817',NULL,NULL,'TEST_1760960837736',0,'Test payment \r\nsuccess',NULL,NULL,'2025-10-20 11:24:26.016','2025-10-20 11:47:17.736'),('60f3b994-6a0c-47d8-a98b-4b7162ad9f17','4c7ac361-8bef-492a-a522-8a999a1cf7bb','MOMO_1765789181684_g6j30z',2400005,'Thanh toán đơn hàng #4c7ac361','{\"source\":\"web\",\"timestamp\":1765789179892}','https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xNT01PXzE3NjU3ODkxODE2ODRfZzZqMzB6&s=ba3bbe3a626236f4852271d4c696b822e3269684b842db3cd7f6b93a719c7562',NULL,NULL,NULL,0,'Thành công.',NULL,NULL,'2025-12-15 08:59:41.686','2025-12-15 08:59:43.735'),('8e360e15-fb37-4fa9-bee5-c8e286f999c5','d5a13393-d685-43bc-bd5f-d915e8a4deb9','MOMO_1765790232279_mfsths',1200005,'Thanh toán đơn hàng #d5a13393','{\"source\":\"web\",\"timestamp\":1765790230886}','https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xNT01PXzE3NjU3OTAyMzIyNzlfbWZzdGhz&s=466230b374d09365dca0d2ae0b8c8befd6e90df0849cb234a688cd431d71d277',NULL,NULL,NULL,0,'Thành công.',NULL,NULL,'2025-12-15 09:17:12.281','2025-12-15 09:17:14.416'),('b1c65c9f-13dd-4b7a-a0ce-305d56c1e3b4','bc87f672-6458-4519-87bf-8d02b33f2254','MOMO_1765332164749_3u0hln',1200005,'Thanh toán đơn hàng #bc87f672','{\"source\":\"web\",\"timestamp\":1765332162549}','https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xNT01PXzE3NjUzMzIxNjQ3NDlfM3UwaGxu&s=da3d63b7b3fe9b13d823b21d474c0ef7e061ac8b9fb6b8c5cfd5e04f8e1a9469',NULL,NULL,NULL,0,'Thành công.',NULL,NULL,'2025-12-10 02:02:44.751','2025-12-10 02:02:47.151'),('c7de9aa6-7eaf-4460-b95d-94ee3854201f','2d88952c-d7ec-4e1e-a36f-fc42b5df93e2','MOMO_1765281525099_ft5958',3600005,'Thanh toán đơn hàng #2d88952c','{\"source\":\"web\",\"timestamp\":1765281521457}','https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xNT01PXzE3NjUyODE1MjUwOTlfZnQ1OTU4&s=8d695df6d3cc8462cd05fd697f92730a2a82102635cac4b5f54baf199e852413',NULL,NULL,NULL,0,'Thành công.',NULL,NULL,'2025-12-09 11:58:45.101','2025-12-09 11:58:47.429'),('dc468d69-5c41-47d9-8f3c-b31c371b6418','f21\r\na6b37-b5e9-48b5-9fa5-17aea458c979','MOMO_1760960624047_htgnp6',62405,'Thanh to├ín ─æ╞ín h├áng #f21a6b37','{\"source\r\n\":\"web\",\"timestamp\":1760960624038}','https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xNT01PXzE3NjA5NjA2MjQwN\r\nDdfaHRnbnA2&s=a4f145e6fc43ddc3645820b1fbd021a678730cc7b8523b1cdccea107090c52fc',NULL,NULL,NULL,0,'Th├ánh \r\nc├┤ng.',NULL,NULL,'2025-10-20 11:43:44.060','2025-10-20 11:43:44.285'),('fc4295f8-a475-4eb3-b1fb-bc09fb57f7e9','6d89043d-b386-4eb4-b888-d585410eea00','MOMO_1765269725101_oi0hil',96005,'Thanh toán đơn hàng #6d89043d','{\"source\":\"web\",\"timestamp\":1765269722635}','https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xNT01PXzE3NjUyNjk3MjUxMDFfb2kwaGls&s=510cc5afa27214da4a7c5d0d832f08a236c5d36b9602a528d80d6875dfe04bab',NULL,NULL,NULL,0,'Thành công.',NULL,NULL,'2025-12-09 08:42:05.103','2025-12-09 08:42:07.252');
/*!40000 ALTER TABLE `momopayment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('ORDER_UPDATE','PAYMENT_STATUS','PROMOTION','SYSTEM_ALERT','INFO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `priority` enum('LOW','NORMAL','HIGH','URGENT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL',
  `metadata` longtext COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Notification_createdAt_idx` (`createdAt`),
  KEY `Notification_userId_idx` (`userId`),
  KEY `Notification_userId_isRead_idx` (`userId`,`isRead`),
  KEY `Notification_userId_type_idx` (`userId`,`type`),
  CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES ('79sbhJyIKpvqtdi5ZeMY6','d030b483-cdbf-4fad-b209-6f63deea670a','Order Shipped','Excellent! Your order #d5a13393-d685-43bc-bd5f-d915e8a4deb9 has been shipped and is on its way to you.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"d5a13393-d685-43bc-bd5f-d915e8a4deb9\",\"status\":\"shipped\",\"totalAmount\":1000000}','2025-12-15 09:29:16.818','2025-12-15 09:29:15.803'),('A9bqeD3mpyAHZWdNH-OmO','d030b483-cdbf-4fad-b209-6f63deea670a','Order Confirmed','Great news! Your order #bc87f672-6458-4519-87bf-8d02b33f2254 has been confirmed and will be prepared for shipping.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"bc87f672-6458-4519-87bf-8d02b33f2254\",\"status\":\"confirmed\",\"totalAmount\":1000000}','2025-12-10 02:02:35.049','2025-12-10 02:02:34.249'),('BdMzzoSZbdV_z8PpZQ5ec','bd60812f-6f64-4e72-a33a-3e7f4b465a2f','Order Shipped','Excellent! Your order #2d88952c-d7ec-4e1e-a36f-fc42b5df93e2 has been shipped and is on its way to you.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"2d88952c-d7ec-4e1e-a36f-fc42b5df93e2\",\"status\":\"shipped\",\"totalAmount\":3000000}','2025-12-09 12:03:52.045','2025-12-09 12:03:52.044'),('FN3bAu5Uo0wKsZGRiDIux','bd60812f-6f64-4e72-a33a-3e7f4b465a2f','Order Confirmed','Great news! Your order #2d88952c-d7ec-4e1e-a36f-fc42b5df93e2 has been confirmed and will be prepared for shipping.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"2d88952c-d7ec-4e1e-a36f-fc42b5df93e2\",\"status\":\"confirmed\",\"totalAmount\":3000000}','2025-12-09 11:58:20.914','2025-12-09 11:58:20.184'),('fNv39Knw3BKHcDRp5bIiA','bd60812f-6f64-4e72-a33a-3e7f4b465a2f','Order Update','Your order #2d88952c-d7ec-4e1e-a36f-fc42b5df93e2 status has been updated to: success','ORDER_UPDATE',0,'NORMAL','{\"orderId\":\"2d88952c-d7ec-4e1e-a36f-fc42b5df93e2\",\"status\":\"success\",\"totalAmount\":3000000}','2025-12-09 12:04:20.635','2025-12-09 12:04:20.634'),('i89gYo0Qk1UcXlGlzkkhh','d030b483-cdbf-4fad-b209-6f63deea670a','Order Shipped','Excellent! Your order #4c7ac361-8bef-492a-a522-8a999a1cf7bb has been shipped and is on its way to you.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"4c7ac361-8bef-492a-a522-8a999a1cf7bb\",\"status\":\"shipped\",\"totalAmount\":2000000}','2025-12-15 09:29:47.085','2025-12-15 09:29:47.084'),('Ido-Oyl9OEuf2aXmN-kaR','d030b483-cdbf-4fad-b209-6f63deea670a','Order Confirmed','Great news! Your order #96d1f962-2d7e-4b15-ae2e-86064aafe9f3 has been confirmed and will be prepared for shipping.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"96d1f962-2d7e-4b15-ae2e-86064aafe9f3\",\"status\":\"confirmed\",\"totalAmount\":2000000}','2025-12-15 09:38:29.863','2025-12-15 09:38:29.009'),('ji_vfiYwNSUlRfCtlTEjU','d030b483-cdbf-4fad-b209-6f63deea670a','Order Confirmed','Great news! Your order #d5a13393-d685-43bc-bd5f-d915e8a4deb9 has been confirmed and will be prepared for shipping.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"d5a13393-d685-43bc-bd5f-d915e8a4deb9\",\"status\":\"confirmed\",\"totalAmount\":1000000}','2025-12-15 09:17:04.033','2025-12-15 09:17:03.216'),('NJXbvjw9cDKk812CKqCTy','d030b483-cdbf-4fad-b209-6f63deea670a','Order Delivered','Your order #d5a13393-d685-43bc-bd5f-d915e8a4deb9 has been successfully delivered. We hope you love your new items!','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"d5a13393-d685-43bc-bd5f-d915e8a4deb9\",\"status\":\"delivered\",\"totalAmount\":1000000}','2025-12-15 09:29:23.652','2025-12-15 09:29:23.652'),('S2PTNyANHkSZlOdcE3PUt','d030b483-cdbf-4fad-b209-6f63deea670a','Order Confirmed','Great news! Your order #4c7ac361-8bef-492a-a522-8a999a1cf7bb has been confirmed and will be prepared for shipping.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"4c7ac361-8bef-492a-a522-8a999a1cf7bb\",\"status\":\"confirmed\",\"totalAmount\":2000000}','2025-12-15 08:59:33.034','2025-12-15 08:59:32.269'),('UXvANhTYKo7ykIPcGWj2f','d030b483-cdbf-4fad-b209-6f63deea670a','Order Confirmed','Great news! Your order #924654bd-6624-4628-98f9-71c06b0cf9b8 has been confirmed and will be prepared for shipping.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"924654bd-6624-4628-98f9-71c06b0cf9b8\",\"status\":\"confirmed\",\"totalAmount\":4000000}','2025-12-15 07:50:48.791','2025-12-15 07:50:46.547'),('VlwSRtByaySKrNMK2ac4A','bd60812f-6f64-4e72-a33a-3e7f4b465a2f','Order Delivered','Your order #2d88952c-d7ec-4e1e-a36f-fc42b5df93e2 has been successfully delivered. We hope you love your new items!','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"2d88952c-d7ec-4e1e-a36f-fc42b5df93e2\",\"status\":\"delivered\",\"totalAmount\":3000000}','2025-12-09 12:04:07.999','2025-12-09 12:04:07.999'),('Y90aCiu6c9d5syW6kWfc3','d030b483-cdbf-4fad-b209-6f63deea670a','Order Confirmed','Great news! Your order #6d89043d-b386-4eb4-b888-d585410eea00 has been confirmed and will be prepared for shipping.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"6d89043d-b386-4eb4-b888-d585410eea00\",\"status\":\"confirmed\",\"totalAmount\":80000}','2025-12-09 08:41:53.852','2025-12-09 08:41:53.067'),('z3nvV_5cmEPn72qQc2yl5','d030b483-cdbf-4fad-b209-6f63deea670a','Order Update','Your order #d5a13393-d685-43bc-bd5f-d915e8a4deb9 status has been updated to: success','ORDER_UPDATE',0,'NORMAL','{\"orderId\":\"d5a13393-d685-43bc-bd5f-d915e8a4deb9\",\"status\":\"success\",\"totalAmount\":1000000}','2025-12-15 09:29:28.947','2025-12-15 09:29:28.946');
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mainImage` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` double DEFAULT '0',
  `costPrice` double DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `rating` int NOT NULL DEFAULT '0',
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `manufacturer` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `merchantId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Product_slug_key` (`slug`),
  KEY `Product_categoryId_fkey` (`categoryId`),
  KEY `Product_merchantId_fkey` (`merchantId`),
  CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Product_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `merchant` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES ('1','smart-phone-demo','Samsung Galaxy S23','https://res.cloudinary.com/dpsiy73bv/image/upload/v1765273209/singitronic/products/main/1765273209140_samsung-galaxy-s23-600x600.jpg',2000000,NULL,47,5,'This is smart \nSamsung Galaxy S23','Samsung','e467fd3b-3619-47ae-9736-1fb8d7938be3','1'),('10','smart-watch-demo','Smart \r\nwatch','https://res.cloudinary.com/dpsiy73bv/image/upload/v1765789060/singitronic/products/main/1765789059805_apple-watch-series-11-vien-nhom-day-the-thao-hong-tb-1-600x600.jpg',1000000,NULL,72,3,'This is smart watch \r\ndescription','Samsung','e467fd3b-3619-47ae-9736-1fb8d7938be3','1'),('11','notebook-horizon-demo','Samsung Galaxy Book','https://res.cloudinary.com/dpsiy73bv/image/upload/v1765789397/singitronic/products/main/1765789396980_Galaxy-Book-Flex-Alpha1-Front-Windows--www.laptopvip.vn-1651825979.jpg',10000000,NULL,0,5,'This is notebook \r\ndescription','HP','e467fd3b-3619-47ae-9736-1fb8d7938be3','1'),('12','mens-trimmer-demo','Mens \r\ntrimmer','https://res.cloudinary.com/dpsiy73bv/image/upload/v1765789536/singitronic/products/main/1765789535613_Trimmer_Updates_LogoEnlarged.jpg',54000,NULL,0,5,'This is trimmer \r\ndescription','Gillete','313eee86-bc11-4dc1-8cb0-6b2c2a2a1ccb','1'),('2','slr-camera-demo','SLR \r\ncamera','https://res.cloudinary.com/dpsiy73bv/image/upload/v1765789712/singitronic/products/main/1765789712023_product_d780.jpg',24000,NULL,1,0,'This is slr \r\ndescription','Canon','659a91b9-3ff6-47d5-9830-5e7ac905b961','1'),('3','mixed-grinder-demo','Mixer \r\ngrinder','https://res.cloudinary.com/dpsiy73bv/image/upload/v1765789840/singitronic/products/main/1765789840528_images.jpg',25000,NULL,1,4,'This is mixed grinder \r\ndescription','ZunVolt','6c3b8591-b01e-4842-bce1-2f5585bf3a28','1'),('4','phone-gimbal-demo','Phone \r\ngimbal','https://res.cloudinary.com/dpsiy73bv/image/upload/v1765790092/singitronic/products/main/1765790092005_gimbal-dji-osmo-mobile-se.jpg',21,NULL,1,5,'This is phone gimbal \r\ndescription','Samsung','659a91b9-3ff6-47d5-9830-5e7ac905b961','1'),('5','tablet-keyboard-demo','Tablet \r\nkeyboard','https://res.cloudinary.com/dpsiy73bv/image/upload/v1765792660/singitronic/products/main/1765792659865_img_20150101_000941.jpg',52000,NULL,1,4,'This is tablet keyboard \r\ndescription','Samsung','ada699e5-e764-4da0-8d3e-18a8c8c5ed24','1'),('6','wireless-earbuds-demo','Wireless \r\nearbuds','https://res.cloudinary.com/dpsiy73bv/image/upload/v1765792719/singitronic/products/main/1765792719101_JBL_Tune%20Flex_Product%20Image_Hero_Black.jpg',640000,NULL,1,3,'This is earbuds \r\ndescription','Samsung','659a91b9-3ff6-47d5-9830-5e7ac905b961','1'),('7','party-speakers-demo','Party \r\nspeakers','https://res.cloudinary.com/dpsiy73bv/image/upload/v1765793825/singitronic/products/main/1765793825207_71h2c%2BbB-fL.jpg',35000,NULL,1,5,'This is party speakers \r\ndescription','SOWO','659a91b9-3ff6-47d5-9830-5e7ac905b961','1'),('8','slow-juicer-demo','Slow \r\njuicer','https://res.cloudinary.com/dpsiy73bv/image/upload/v1765793948/singitronic/products/main/1765793948195_may-ep-cham-slow-juicer-1.jpg',69000,NULL,10,5,'Slow juicer \r\ndesc','Bosch','8d2a091c-4b90-4d60-b191-114b895f3e54','1'),('86f63438-162b-45f3-b517-2a754aeb6112',NULL,'Iphone 15','https://res.cloudinary.com/dpsiy73bv/image/upload/v1765787081/singitronic/products/main/1765787081162_iphone-15-plus-256gb_3.jpg',22000000,NULL,2,5,'Iphone 15 256gb màu hồng nữ tính dịu dàng','','6667d6ae-0fdf-43f3-8fd1-1e0aa160fc59','test-merchant-id'),('9','wireless-headphones-demo','Sony WH-1000XM5','https://res.cloudinary.com/dpsiy73bv/image/upload/v1765793990/singitronic/products/main/1765793989844_tai-nghe-bluetooth-chup-tai-sony-wh1000xm5-den-1-750x500.jpg',2000000,NULL,100,3,'This is wireless headphones \r\ndescription','Sony','5b4a4ca3-0005-4ac0-b318-1db7a31e3ca4','1');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratelimitlog`
--

DROP TABLE IF EXISTS `ratelimitlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratelimitlog` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `RateLimitLog_key_timestamp_idx` (`key`,`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratelimitlog`
--

LOCK TABLES `ratelimitlog` WRITE;
/*!40000 ALTER TABLE `ratelimitlog` DISABLE KEYS */;
/*!40000 ALTER TABLE `ratelimitlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review`
--

DROP TABLE IF EXISTS `review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `comment` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `review_productId_idx` (`productId`),
  KEY `review_userId_idx` (`userId`),
  KEY `review_orderId_idx` (`orderId`),
  CONSTRAINT `review_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review`
--

LOCK TABLES `review` WRITE;
/*!40000 ALTER TABLE `review` DISABLE KEYS */;
/*!40000 ALTER TABLE `review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `securitylog`
--

DROP TABLE IF EXISTS `securitylog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `securitylog` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userAgent` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `SecurityLog_event_idx` (`event`),
  KEY `SecurityLog_severity_idx` (`severity`),
  KEY `SecurityLog_timestamp_idx` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `securitylog`
--

LOCK TABLES `securitylog` WRITE;
/*!40000 ALTER TABLE `securitylog` DISABLE KEYS */;
/*!40000 ALTER TABLE `securitylog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deletedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('bd60812f-6f64-4e72-a33a-3e7f4b465a2f','phucmanhtran08@gmail.com','$2a$14$l3hy73BoyvTIOC5IP8rZFeMKOzxIvZbhp4uV6v5SOjsacWuGqLbFy','admin','ACTIVE',NULL,NULL,NULL),('d030b483-cdbf-4fad-b209-6f63deea670a','anhtrietrop@gmail.com','$2a$14$porhS6OLEk9NywXbk93tXe6fY3hrpMvd088B4m7owd4n07M91OLUK','user','ACTIVE',NULL,NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist`
--

DROP TABLE IF EXISTS `wishlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Wishlist_productId_fkey` (`productId`),
  KEY `Wishlist_userId_fkey` (`userId`),
  CONSTRAINT `Wishlist_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Wishlist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist`
--

LOCK TABLES `wishlist` WRITE;
/*!40000 ALTER TABLE `wishlist` DISABLE KEYS */;
INSERT INTO `wishlist` VALUES ('fc1d6161-b736-4373-8474-0477bae2688b','1','d030b483-cdbf-4fad-b209-6f63deea670a');
/*!40000 ALTER TABLE `wishlist` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-16 15:17:02
