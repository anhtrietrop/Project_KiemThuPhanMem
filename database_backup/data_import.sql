
INSERT INTO `_prisma_migrations` VALUES ('1a80ea11-fd24-43fb-8cb5-141ce544efd2','247c4aa650984757c733671179039075da6
73a5ab2f7744d8d42a5d5dae8b3b2','2025-10-19 
15:33:42.350','20251019153342_remove_instock_field',NULL,NULL,'2025-10-19 15:33:42.331',1),('23949289-afd0-45a1-9c9c
-d21fa6913aae','24206c689bfa5df72e16679b43456af249643e1e75cddac84bcf03e52380f7e6','2025-10-20 
11:52:00.478','20251020115155_remove_momo_payment_status',NULL,NULL,'2025-10-20 11:52:00.429',1),('2ee62584-9fa7-41a
d-9a3a-f31901e179db','059b5f609823e8fa529dbd65bbb239f471a3542013494b945bf0aebe2ff0c7e6','2025-10-24 
10:47:49.159','20251024104748_add_cart_tables',NULL,NULL,'2025-10-24 10:47:48.944',1),('5e7f733d-3bea-4058-81ee-b423
b28bfadc','def7f5ba58b9f6108350dc0164e69717b4f309b647cc4e74e67b2f44489de1b8','2025-10-19 
15:06:15.047','20251019150614_init',NULL,NULL,'2025-10-19 15:06:14.413',1);
INSERT INTO `cart` VALUES 
('71636b1f-adea-49b6-a8b3-ccc792609d90','d683b7f7-92b1-4216-931f-43daf6851aad','2025-11-25 
11:21:31.762','2025-11-25 11:21:31.761');
INSERT INTO `category` VALUES ('659a91b9-3ff6-47d5-9830-5e7ac905b961','cameras'),('1cb9439a-ea47-4a33-913b-e9bf935bc
c0b','earbuds'),('4c2cc9ec-7504-4b7c-8ecd-2379a854a423','headphones'),('8d2a091c-4b90-4d60-b191-114b895f3e54','juice
rs'),('782e7829-806b-489f-8c3a-2689548d7153','laptops'),('6c3b8591-b01e-4842-bce1-2f5585bf3a28','mixer-grinders'),('
d30b85e2-e544-4f48-8434-33fe0b591579','phone-gimbals'),('3117a1b0-6369-491e-8b8b-9fdd5ad9912e','smart-phones'),('7a2
41318-624f-48f7-9921-1818f6c20d85','speakers'),('ada699e5-e764-4da0-8d3e-18a8c8c5ed24','tablets'),('26171434-eb1d-44
ed-bae1-d4d72c446425','Test 
Category'),('313eee86-bc11-4dc1-8cb0-6b2c2a2a1ccb','trimmers'),('a6896b67-197c-4b2a-b5e2-93954474d8b4','watches');
INSERT INTO `customer_order` VALUES 
('8cf583a3-9817-4ae0-8634-2022de189d74','Trß║ºn','Mß║ính','+84931439171','phucmanhtran08@gmail.com','460/4 N╞í 
trang long',NULL,'2025-10-20 09:36:18.947','processing','Th├ánh phß╗æ Hß╗ô Ch├¡ 
Minh','',NULL,80000,'PAID','MOMO','TEST_1760960837754','2025-10-20 11:47:17.754',NULL),('f21a6b37-b5e9-48b5-9fa5-17a
ea458c979','Trß║ºn','Mß║ính','+84931439171','phucmanhtran08@gmail.com','460/4 N╞í trang long',NULL,'2025-10-20 
11:43:42.976','success','Th├ánh phß╗æ Hß╗ô Ch├¡ Minh','',NULL,52000,'PENDING',NULL,NULL,'2025-11-03 12:56:56.810',NU
LL),('f5e6f544-1d23-406b-a382-d5081ccea42e','Mß║ính','Ph├║c','+84931439171','3122411121@sv.sgu.edu.vn','460/4 N╞í 
trang long',NULL,'2025-11-25 12:02:37.386','processing','Th├ánh phß╗æ Hß╗ô Ch├¡ 
Minh','',NULL,54000,'PENDING',NULL,NULL,NULL,NULL);
INSERT INTO `customer_order_product` VALUES ('5315509e-7eeb-4f48-b274-deef46e28dd2','8cf583a3-9817-4ae0-8634-2022de1
89d74','10',1),('7d5d1aea-43a5-4437-99b9-df22a1c8cdeb','f5e6f544-1d23-406b-a382-d5081ccea42e','12',1),('81ee0f9a-6bf
9-4b17-9f0e-be7bc1d44a13','f21a6b37-b5e9-48b5-9fa5-17aea458c979','11',1);
INSERT INTO `merchant` VALUES ('1','Demo Merchant','This is demo merchant description',NULL,'1234567890','123 Demo 
St, Demo City, DM 12345','active','2025-10-19 15:08:38.572','2025-10-19 17:00:44.939'),('test-merchant-id','Test 
Merchant','A merchant for testing purposes','merchant@test.com',NULL,NULL,'ACTIVE','2025-10-24 
11:16:06.121','2025-10-24 11:16:06.121');
INSERT INTO `momopayment` VALUES ('3209f68c-bfad-450e-85a4-a28e7d03e86e','8cf583a3-9817-4ae0-8634-2022de189d74','MOM
O_1760959466010_ivbw49',96005,'Thanh to├ín ─æ╞ín h├áng #8cf583a3','{\"source\":\"web\",\"timestamp\":1760959465973}'
,'https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xNT01PXzE3NjA5NTk0NjYwMTBfaXZidzQ5&s=ce1fa314d17f1facc9b933d54
3d7f5dc3e5185d08d2d7ecc559dad85e9f12817',NULL,NULL,'TEST_1760960837736',0,'Test payment 
success',NULL,NULL,'2025-10-20 11:24:26.016','2025-10-20 11:47:17.736'),('dc468d69-5c41-47d9-8f3c-b31c371b6418','f21
a6b37-b5e9-48b5-9fa5-17aea458c979','MOMO_1760960624047_htgnp6',62405,'Thanh to├ín ─æ╞ín h├áng #f21a6b37','{\"source\
":\"web\",\"timestamp\":1760960624038}','https://test-payment.momo.vn/v2/gateway/pay?t=TU9NT3xNT01PXzE3NjA5NjA2MjQwN
DdfaHRnbnA2&s=a4f145e6fc43ddc3645820b1fbd021a678730cc7b8523b1cdccea107090c52fc',NULL,NULL,NULL,0,'Th├ánh 
c├┤ng.',NULL,NULL,'2025-10-20 11:43:44.060','2025-10-20 11:43:44.285');
INSERT INTO `notification` VALUES ('_DEV0zrpxanjGRaK_1eJK','JwmwSf825i9e_RI4NfVRH','Order Confirmed','Great news! 
Your order #e37fc3c2-24f7-4612-9ece-7c28331e79ae has been confirmed and will be prepared for shipping.','ORDER_UPDAT
E',0,'HIGH','{\"orderId\":\"e37fc3c2-24f7-4612-9ece-7c28331e79ae\",\"status\":\"confirmed\",\"totalAmount\":22}','20
25-10-19 17:05:07.199','2025-10-19 17:05:07.199'),('2XN6q9eyoq9EoRAnHlDpC','JwmwSf825i9e_RI4NfVRH','Order 
Delivered','Your order #f21a6b37-b5e9-48b5-9fa5-17aea458c979 has been successfully delivered. We hope you love your 
new items!','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"f21a6b37-b5e9-48b5-9fa5-17aea458c979\",\"status\":\"delivered\",
\"totalAmount\":52000}','2025-11-03 12:56:55.784','2025-11-03 
12:56:55.784'),('3zQA8sT2WMg8eS6PTlSPX','JwmwSf825i9e_RI4NfVRH','Order Confirmed','Great news! Your order 
#0fad0fd7-0f48-4515-895d-a5515550f88a has been confirmed and will be prepared for shipping.','ORDER_UPDATE',0,'HIGH'
,'{\"orderId\":\"0fad0fd7-0f48-4515-895d-a5515550f88a\",\"status\":\"confirmed\",\"totalAmount\":64}','2025-10-19 
17:07:04.075','2025-10-19 17:07:04.075'),('6yg5yV4nRoyFFj3vRDgVt','JwmwSf825i9e_RI4NfVRH','Order Confirmed','Great 
news! Your order #f21a6b37-b5e9-48b5-9fa5-17aea458c979 has been confirmed and will be prepared for shipping.','ORDER
_UPDATE',0,'HIGH','{\"orderId\":\"f21a6b37-b5e9-48b5-9fa5-17aea458c979\",\"status\":\"confirmed\",\"totalAmount\":52
000}','2025-10-20 11:43:43.024','2025-10-20 11:43:43.024'),('K1bU7JsLmC4f60auDBO6H','JwmwSf825i9e_RI4NfVRH','Order 
Confirmed','Great news! Your order #c96f344d-7c65-438a-ba2f-265edc15361d has been confirmed and will be prepared 
for shipping.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"c96f344d-7c65-438a-ba2f-265edc15361d\",\"status\":\"confirmed
\",\"totalAmount\":22}','2025-10-19 16:21:52.341','2025-10-19 
16:21:52.341'),('KQxC9OOhKs2DzUaavhaZs','JwmwSf825i9e_RI4NfVRH','Order Confirmed','Great news! Your order 
#8cf583a3-9817-4ae0-8634-2022de189d74 has been confirmed and will be prepared for shipping.','ORDER_UPDATE',0,'HIGH'
,'{\"orderId\":\"8cf583a3-9817-4ae0-8634-2022de189d74\",\"status\":\"confirmed\",\"totalAmount\":80000}','2025-10-20
 09:36:18.976','2025-10-20 09:36:18.976'),('pg1Er6c9Vdc-Z0iIOsUVr','JwmwSf825i9e_RI4NfVRH','Order 
Shipped','Excellent! Your order #f21a6b37-b5e9-48b5-9fa5-17aea458c979 has been shipped and is on its way to you.','O
RDER_UPDATE',0,'HIGH','{\"orderId\":\"f21a6b37-b5e9-48b5-9fa5-17aea458c979\",\"status\":\"shipped\",\"totalAmount\":
52000}','2025-11-03 12:56:54.649','2025-11-03 
12:56:54.649'),('yRGQTWYmL3cP69a-hvQTT','JwmwSf825i9e_RI4NfVRH','Order Update','Your order 
#f21a6b37-b5e9-48b5-9fa5-17aea458c979 status has been updated to: success','ORDER_UPDATE',0,'NORMAL','{\"orderId\":\
"f21a6b37-b5e9-48b5-9fa5-17aea458c979\",\"status\":\"success\",\"totalAmount\":52000}','2025-11-03 
12:56:56.818','2025-11-03 12:56:56.818'),('Z7fgrx44AVv9WC_-OAF1Z','d683b7f7-92b1-4216-931f-43daf6851aad','Order 
Confirmed','Great news! Your order #f5e6f544-1d23-406b-a382-d5081ccea42e has been confirmed and will be prepared 
for shipping.','ORDER_UPDATE',0,'HIGH','{\"orderId\":\"f5e6f544-1d23-406b-a382-d5081ccea42e\",\"status\":\"confirmed
\",\"totalAmount\":54000}','2025-11-25 12:02:37.427','2025-11-25 12:02:37.416');
INSERT INTO `product` VALUES ('1','smart-phone-demo','Smart phone','product1.webp',22000,NULL,10,5,'This is smart 
phone description','Samsung','3117a1b0-6369-491e-8b8b-9fdd5ad9912e','1'),('10','smart-watch-demo','Smart 
watch','product10.webp',80000,NULL,10,3,'This is smart watch 
description','Samsung','a6896b67-197c-4b2a-b5e2-93954474d8b4','1'),('11','notebook-horizon-demo','Notebook 
horizon','product11.webp',52000,NULL,10,5,'This is notebook 
description','HP','782e7829-806b-489f-8c3a-2689548d7153','1'),('12','mens-trimmer-demo','Mens 
trimmer','product12.webp',54000,NULL,0,5,'This is trimmer 
description','Gillete','313eee86-bc11-4dc1-8cb0-6b2c2a2a1ccb','1'),('2','slr-camera-demo','SLR 
camera','product2.webp',24000,NULL,1,0,'This is slr 
description','Canon','659a91b9-3ff6-47d5-9830-5e7ac905b961','1'),('3','mixed-grinder-demo','Mixer 
grinder','product3.webp',25000,NULL,1,4,'This is mixed grinder 
description','ZunVolt','6c3b8591-b01e-4842-bce1-2f5585bf3a28','1'),('4','phone-gimbal-demo','Phone 
gimbal','product4.webp',21,NULL,1,5,'This is phone gimbal 
description','Samsung','d30b85e2-e544-4f48-8434-33fe0b591579','1'),('5','tablet-keyboard-demo','Tablet 
keyboard','product5.webp',52000,NULL,1,4,'This is tablet keyboard 
description','Samsung','ada699e5-e764-4da0-8d3e-18a8c8c5ed24','1'),('6','wireless-earbuds-demo','Wireless 
earbuds','product6.webp',640000,NULL,1,3,'This is earbuds 
description','Samsung','1cb9439a-ea47-4a33-913b-e9bf935bcc0b','1'),('7','party-speakers-demo','Party 
speakers','product7.webp',35000,NULL,1,5,'This is party speakers 
description','SOWO','7a241318-624f-48f7-9921-1818f6c20d85','1'),('8','slow-juicer-demo','Slow 
juicer','product8.webp',69000,NULL,10,5,'Slow juicer 
desc','Bosch','8d2a091c-4b90-4d60-b191-114b895f3e54','1'),('9','wireless-headphones-demo','Wireless 
headphones','product9.webp',36000,NULL,10,3,'This is wireless headphones 
description','Sony','4c2cc9ec-7504-4b7c-8ecd-2379a854a423','1'),('test-product-id','test-product-slug','Test 
Product','test-image.jpg',99.99,NULL,10,0,'This is a test product.','Test 
Manufacturer','26171434-eb1d-44ed-bae1-d4d72c446425','test-merchant-id');
INSERT INTO `user` VALUES ('5b33422f-d556-4cfe-8c62-e1c303e68d6a','admin@example.com','$2a$10$96zKzk6yNcyeMLfTzD8Y3u
i3gSvZFzLb/UwcRhl6SKv6oqoZ1P81e','admin',NULL,NULL,NULL,'ACTIVE'),('d683b7f7-92b1-4216-931f-43daf6851aad','caigido@g
mail.com','$2a$14$YhHfrAPbCn9mRTScrc9IDuYlYQzKZT13DZPR8B6x2yWRZaiBZ5uEa','user',NULL,NULL,NULL,'ACTIVE'),('JwmwSf825
i9e_RI4NfVRH','phucmanhtran08@gmail.com','$2a$14$aFuhsIbHuDFbIBlUpksjn.cDnTUyWm2nWP2gmVM03F4Gl5iWL286u','user',NULL,
NULL,NULL,'ACTIVE'),('test-user-id','test@example.com','$2a$10$TbONFqcZIDE661HLaCDq7.wz4KP7JICq0Q.nEV9PIuv.2UoIutiqq
','user',NULL,NULL,NULL,'ACTIVE');


