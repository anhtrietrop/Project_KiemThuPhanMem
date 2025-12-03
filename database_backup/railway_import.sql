-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: railway
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `railway`
--

/*!40000 `*/;



USE `railway`;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('1a80ea11-fd24-43fb-8cb5-141ce544efd2','247c4aa650984757c733671179039075da673a5ab2f7744d8d42a5d5dae8b3b2','2025-10-19 15:33:42.350','20251019153342_remove_instock_field',NULL,NULL,'2025-10-19 15:33:42.331',1),('23949289-afd0-45a1-9c9c-d21fa6913aae','24206c689bfa5df72e16679b43456af249643e1e75cddac84bcf03e52380f7e6','2025-10-20 11:52:00.478','20251020115155_remove_momo_payment_status',NULL,NULL,'2025-10-20 11:52:00.429',1),('2ee62584-9fa7-41ad-9a3a-f31901e179db','059b5f609823e8fa529dbd65bbb239f471a3542013494b945bf0aebe2ff0c7e6','2025-10-24 10:47:49.159','20251024104748_add_cart_tables',NULL,NULL,'2025-10-24 10:47:48.944',1),('5e7f733d-3bea-4058-81ee-b423b28bfadc','def7f5ba58b9f6108350dc0164e69717b4f309b647cc4e74e67b2f44489de1b8','2025-10-19 15:06:15.047','20251019150614_init',NULL,NULL,'2025-10-19 15:06:14.413',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

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
INSERT INTO `cart` VALUES ('71636b1f-adea-49b6-a8b3-ccc792609d90','d683b7f7-92b1-4216-931f-43daf6851aad','2025-11-25 11:21:31.762','2025-11-25 11:21:31.761');
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
INSERT INTO `category` VALUES ('659a91b9-3ff6-47d5-9830-5e7ac905b961','cameras'),('1cb9439a-ea47-4a33-913b-e9bf935bcc0b','earbuds'),('4c2cc9ec-7504-4b7c-8ecd-2379a854a423','headphones'),('8d2a091c-4b90-4d60-b191-114b895f3e54','juicers'),('782e7829-806b-489f-8c3a-2689548d7153','laptops'),('6c3b8591-b01e-4842-bce1-2f5585bf3a28','mixer-grinders'),('d30b85e2-e544-4f48-8434-33fe0b591579','phone-gimbals'),('3117a1b0-6369-491e-8b8b-9fdd5ad9912e','smart-phones'),('7a241318-624f-48f7-9921-1818f6c20d85','speakers'),('ada699e5-e764-4da0-8d3e-18a8c8c5ed24','tablets'),('26171434-eb1d-44ed-bae1-d4d72c446425','Test Category'),('313eee86-bc11-4dc1-8cb0-6b2c2a2a1ccb','trimmers'),('a6896b67-197c-4b2a-b5e2-93954474d8b4','watches');
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
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `customer_order` VALUES ('8cf583a3-9817-4ae0-8634-2022de189d74','Trﬂ¶∫n','Mﬂ¶Ình','+84931439171','phucmanhtran08@gmail.com','460/4 N¶Ì trang long',NULL,'2025-10-20 09:36:18.947','processing','Th+·nh phﬂ+Ê Hﬂ+Ù Ch+° Minh','',NULL,80000,'PAID','MOMO','TEST_1760960837754','2025-10-20 11:47:17.754',NULL),('f21a6b37-b5e9-48b5-9fa5-17aea458c979','Trﬂ¶∫n','Mﬂ¶Ình','+84931439171','phucmanhtran08@gmail.com','460/4 N¶Ì trang long',NULL,'2025-10-20 11:43:42.976','success','Th+·nh phﬂ+Ê Hﬂ+Ù Ch+° Minh','',NULL,52000,'PENDING',NULL,NULL,'2025-11-03 12:56:56.810',NULL),('f5e6f544-1d23-406b-a382-d5081ccea42e','Mﬂ¶Ình','Ph+¶c','+84931439171','3122411121@sv.sgu.edu.vn','460/4 N¶Ì trang long',NULL,'2025-11-25 12:02:37.386','processing','Th+·nh phﬂ+Ê Hﬂ+Ù Ch+° Minh','',NULL,54000,'PENDING',NULL,NULL,NULL,NULL);
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
INSERT INTO `customer_order_product` VALUES ('5315509e-7eeb-4f48-b274-deef46e28dd2','8cf583a3-9817-4ae0-8634-2022de189d74','10',1),('7d5d1aea-43a5-4437-99b9-df22a1c8cdeb','f5e6f544-1d23-406b-a382-d5081ccea42e','12',1),('81ee0f9a-6bf9-4b17-9f0e-be7bc1d44a13','f21a6b37-b5e9-48b5-9fa5-17aea458c979','11',1);
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
INSERT INTO `merchant` VALUES ('1','Demo Merchant','This is demo merchant description',NULL,'1234567890','123 Demo St, Demo City, DM 12345','active','2025-10-19 15:08:38.572','2025-10-19 17:00:44.939'),('test-merchant-id','Test Merchant','A merchant for testing purposes','merchant@test.com',NULL,NULL,'ACTIVE','2025-10-24 11:16:06.121','2025-10-24 11:16:06.121');
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
INSERT INTO `momopayment` VALUES ('3209f68c-bfad-450e-85a4-a28e7d03e86e','8cf583a3-9817-4ae0-8634-2022de189d74','MOMO_1760959466010_ivbw49',96005,'Thanh to+Ìn -Ê¶Ìn h+·ng #8cf583a3','{\"source\":\"web\",\"timestamp\":1760959465973}','https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xNT01PXzE3NjA5NTk0NjYwMTBfaXZidzQ5&s=ce1fa314d17f1facc9b933d543d7f5dc3e5185d08d2d7ecc559dad85e9f12817',NULL,NULL,'TEST_1760960837736',0,'Test payment success',NULL,NULL,'2025-10-20 11:24:26.016','2025-10-20 11:47:17.736'),('dc468d69-5c41-47d9-8f3c-b31c371b6418','f21a6b37-b5e9-48b5-9fa5-17aea458c979','MOMO_1760960624047_htgnp6',62405,'Thanh to+Ìn -Ê¶Ìn h+·ng #f21a6b37','{\"source\":\"web\",\"timestamp\":1760960624038}','https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xNT01PXzE3NjA5NjA2MjQwNDdfaHRnbnA2&s=a4f145e6fc43ddc3645820b1fbd021a678730cc7b8523b1cdccea107090c52fc',NULL,NULL,NULL,0,'Th+·nh c+¶ng.',NULL,NULL,'2025-10-20 11:43:44.060','2025-10-20 11:43:44.285');
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
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Notification_userId_idx` (`userId`),
  KEY `Notification_userId_isRead_idx` (`userId`,`isRead`),
  KEY `Notification_userId_type_idx` (`userId`,`type`),
  KEY `Notification_createdAt_idx` (`createdAt`),
  CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `notification_chk_1` CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES ('_DEV0zrpxanjGRaK_1eJK','JwmwSf825i9e_RI4NfVRH','Order Confirmed','Great news! Your order #e37fc3c2-24f7-4612-9ece-7c28331e79ae has been confirmed and will be prepared for shipping.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"e37fc3c2-24f7-4612-9ece-7c28331e79ae\",\"status\":\"confirmed\",\"totalAmount\":22}','2025-10-19 17:05:07.199','2025-10-19 17:05:07.199'),('2XN6q9eyoq9EoRAnHlDpC','JwmwSf825i9e_RI4NfVRH','Order Delivered','Your order #f21a6b37-b5e9-48b5-9fa5-17aea458c979 has been successfully delivered. We hope you love your new items!','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"f21a6b37-b5e9-48b5-9fa5-17aea458c979\",\"status\":\"delivered\",\"totalAmount\":52000}','2025-11-03 12:56:55.784','2025-11-03 12:56:55.784'),('3zQA8sT2WMg8eS6PTlSPX','JwmwSf825i9e_RI4NfVRH','Order Confirmed','Great news! Your order #0fad0fd7-0f48-4515-895d-a5515550f88a has been confirmed and will be prepared for shipping.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"0fad0fd7-0f48-4515-895d-a5515550f88a\",\"status\":\"confirmed\",\"totalAmount\":64}','2025-10-19 17:07:04.075','2025-10-19 17:07:04.075'),('6yg5yV4nRoyFFj3vRDgVt','JwmwSf825i9e_RI4NfVRH','Order Confirmed','Great news! Your order #f21a6b37-b5e9-48b5-9fa5-17aea458c979 has been confirmed and will be prepared for shipping.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"f21a6b37-b5e9-48b5-9fa5-17aea458c979\",\"status\":\"confirmed\",\"totalAmount\":52000}','2025-10-20 11:43:43.024','2025-10-20 11:43:43.024'),('K1bU7JsLmC4f60auDBO6H','JwmwSf825i9e_RI4NfVRH','Order Confirmed','Great news! Your order #c96f344d-7c65-438a-ba2f-265edc15361d has been confirmed and will be prepared for shipping.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"c96f344d-7c65-438a-ba2f-265edc15361d\",\"status\":\"confirmed\",\"totalAmount\":22}','2025-10-19 16:21:52.341','2025-10-19 16:21:52.341'),('KQxC9OOhKs2DzUaavhaZs','JwmwSf825i9e_RI4NfVRH','Order Confirmed','Great news! Your order #8cf583a3-9817-4ae0-8634-2022de189d74 has been confirmed and will be prepared for shipping.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"8cf583a3-9817-4ae0-8634-2022de189d74\",\"status\":\"confirmed\",\"totalAmount\":80000}','2025-10-20 09:36:18.976','2025-10-20 09:36:18.976'),('pg1Er6c9Vdc-Z0iIOsUVr','JwmwSf825i9e_RI4NfVRH','Order Shipped','Excellent! Your order #f21a6b37-b5e9-48b5-9fa5-17aea458c979 has been shipped and is on its way to you.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"f21a6b37-b5e9-48b5-9fa5-17aea458c979\",\"status\":\"shipped\",\"totalAmount\":52000}','2025-11-03 12:56:54.649','2025-11-03 12:56:54.649'),('yRGQTWYmL3cP69a-hvQTT','JwmwSf825i9e_RI4NfVRH','Order Update','Your order #f21a6b37-b5e9-48b5-9fa5-17aea458c979 status has been updated to: success','ORDER_UPDATE',0,'NORMAL','{\"orderId\":\"f21a6b37-b5e9-48b5-9fa5-17aea458c979\",\"status\":\"success\",\"totalAmount\":52000}','2025-11-03 12:56:56.818','2025-11-03 12:56:56.818'),('Z7fgrx44AVv9WC_-OAF1Z','d683b7f7-92b1-4216-931f-43daf6851aad','Order Confirmed','Great news! Your order #f5e6f544-1d23-406b-a382-d5081ccea42e has been confirmed and will be prepared for shipping.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"f5e6f544-1d23-406b-a382-d5081ccea42e\",\"status\":\"confirmed\",\"totalAmount\":54000}','2025-11-25 12:02:37.427','2025-11-25 12:02:37.416');
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
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mainImage` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` double DEFAULT '0',
  `costPrice` double DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `rating` int NOT NULL DEFAULT '0',
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `manufacturer` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
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
INSERT INTO `product` VALUES ('1','smart-phone-demo','Smart phone','product1.webp',22000,NULL,10,5,'This is smart phone description','Samsung','3117a1b0-6369-491e-8b8b-9fdd5ad9912e','1'),('10','smart-watch-demo','Smart watch','product10.webp',80000,NULL,10,3,'This is smart watch description','Samsung','a6896b67-197c-4b2a-b5e2-93954474d8b4','1'),('11','notebook-horizon-demo','Notebook horizon','product11.webp',52000,NULL,10,5,'This is notebook description','HP','782e7829-806b-489f-8c3a-2689548d7153','1'),('12','mens-trimmer-demo','Mens trimmer','product12.webp',54000,NULL,0,5,'This is trimmer description','Gillete','313eee86-bc11-4dc1-8cb0-6b2c2a2a1ccb','1'),('2','slr-camera-demo','SLR camera','product2.webp',24000,NULL,1,0,'This is slr description','Canon','659a91b9-3ff6-47d5-9830-5e7ac905b961','1'),('3','mixed-grinder-demo','Mixer grinder','product3.webp',25000,NULL,1,4,'This is mixed grinder description','ZunVolt','6c3b8591-b01e-4842-bce1-2f5585bf3a28','1'),('4','phone-gimbal-demo','Phone gimbal','product4.webp',21,NULL,1,5,'This is phone gimbal description','Samsung','d30b85e2-e544-4f48-8434-33fe0b591579','1'),('5','tablet-keyboard-demo','Tablet keyboard','product5.webp',52000,NULL,1,4,'This is tablet keyboard description','Samsung','ada699e5-e764-4da0-8d3e-18a8c8c5ed24','1'),('6','wireless-earbuds-demo','Wireless earbuds','product6.webp',640000,NULL,1,3,'This is earbuds description','Samsung','1cb9439a-ea47-4a33-913b-e9bf935bcc0b','1'),('7','party-speakers-demo','Party speakers','product7.webp',35000,NULL,1,5,'This is party speakers description','SOWO','7a241318-624f-48f7-9921-1818f6c20d85','1'),('8','slow-juicer-demo','Slow juicer','product8.webp',69000,NULL,10,5,'Slow juicer desc','Bosch','8d2a091c-4b90-4d60-b191-114b895f3e54','1'),('9','wireless-headphones-demo','Wireless headphones','product9.webp',36000,NULL,10,3,'This is wireless headphones description','Sony','4c2cc9ec-7504-4b7c-8ecd-2379a854a423','1'),('test-product-id','test-product-slug','Test Product','test-image.jpg',99.99,NULL,10,0,'This is a test product.','Test Manufacturer','26171434-eb1d-44ed-bae1-d4d72c446425','test-merchant-id');
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
  `deletedAt` datetime(3) DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('5b33422f-d556-4cfe-8c62-e1c303e68d6a','admin@example.com','$2a$10$96zKzk6yNcyeMLfTzD8Y3ui3gSvZFzLb/UwcRhl6SKv6oqoZ1P81e','admin',NULL,NULL,NULL,'ACTIVE'),('d683b7f7-92b1-4216-931f-43daf6851aad','caigido@gmail.com','$2a$14$YhHfrAPbCn9mRTScrc9IDuYlYQzKZT13DZPR8B6x2yWRZaiBZ5uEa','user',NULL,NULL,NULL,'ACTIVE'),('JwmwSf825i9e_RI4NfVRH','phucmanhtran08@gmail.com','$2a$14$aFuhsIbHuDFbIBlUpksjn.cDnTUyWm2nWP2gmVM03F4Gl5iWL286u','user',NULL,NULL,NULL,'ACTIVE'),('test-user-id','test@example.com','$2a$10$TbONFqcZIDE661HLaCDq7.wz4KP7JICq0Q.nEV9PIuv.2UoIutiqq','user',NULL,NULL,NULL,'ACTIVE');
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
/*!40000 ALTER TABLE `wishlist` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-25 12:33:09
