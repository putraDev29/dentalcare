-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 18, 2026 at 10:47 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dental_care`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` varchar(255) NOT NULL,
  `facility_id` varchar(255) DEFAULT NULL,
  `appointment_number` varchar(255) NOT NULL,
  `patient_id` varchar(255) NOT NULL,
  `patient_name` varchar(255) NOT NULL,
  `patient_mrn` varchar(255) DEFAULT NULL,
  `patient_phone` varchar(255) DEFAULT NULL,
  `patient_gender` varchar(255) DEFAULT NULL,
  `patient_birth_date` date DEFAULT NULL,
  `patient_insurance_type` varchar(255) DEFAULT NULL,
  `doctor_id` varchar(255) NOT NULL,
  `doctor_name` varchar(255) NOT NULL,
  `doctor_specialization` varchar(255) DEFAULT NULL,
  `department_id` varchar(255) DEFAULT NULL,
  `department_name` varchar(255) DEFAULT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` varchar(255) NOT NULL,
  `duration_minutes` int(11) NOT NULL DEFAULT 30,
  `visit_type` varchar(255) NOT NULL DEFAULT 'routine_checkup',
  `complaint` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'in_queue',
  `queue_number` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dental_diagnoses`
--

CREATE TABLE `dental_diagnoses` (
  `id` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL DEFAULT 'Umum',
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `dental_diagnoses`
--

INSERT INTO `dental_diagnoses` (`id`, `code`, `name`, `category`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
('DIA-001', 'K02.0', 'Karies Terbatas Enamel (White Spot Lesion / Karies Email Dini)', 'Karies Gigi', 'Lesi karies awal terbatas pada lapisan email tanpa kavitas terbuka, tampak bercak putih kapur (white spot).', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-002', 'K02.1', 'Karies Dentin (Gigi Berlubang Menengah / Dalam)', 'Karies Gigi', 'Kavitas karies mencapai lapisan dentin dengan rasa ngilu bila terkena rangsangan termal, manis, atau asam.', 1, '2026-09-25 06:01:40', '2026-10-16 01:48:40'),
('DIA-003', 'K02.2', 'Karies Sementum / Karies Akar Gigi (Caries of Cementum)', 'Karies Gigi', 'Karies yang terjadi pada permukaan akar atau sementum gigi yang terbuka akibat resesi gingiva.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-004', 'K02.3', 'Karies Terhenti (Arrested Dental Caries / Karies Inaktif)', 'Karies Gigi', 'Lesi karies yang telah mengalami remineralisasi dan berhenti berkembang, berwarna kecokelatan keras.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-005', 'K02.4', 'Odontoklasia / Melanodontia Infantil (Infantile Melanodontia)', 'Karies Gigi', 'Kerusakan mahkota gigi sulung pada anak dengan perubahan warna kehitaman yang progresif.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-006', 'K02.5', 'Karies Meluas dengan Keterlibatan Pulpa (Karies Profunda Perforasi)', 'Karies Gigi', 'Karies profunda yang telah menembus atap pulpa gigi sehingga pulpa terbuka langsung ke rongga mulut.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-007', 'K02.51', 'Karies Profunda Tanpa Keterlibatan Pulpa (Karies Profunda Non-Perforasi)', 'Karies Gigi', 'Kavitas karies mendekati kamar pulpa namun masih menyisakan selapis tipis dentin sehat tanpa perforasi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-008', 'K02.8', 'Karies Rampan / Karies Botol Susu (Early Childhood Caries - ECC)', 'Karies Gigi', 'Karies akut menyebar luas pada banyak gigi sulung anak secara cepat, sering terkait botol susu berkepanjangan.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-009', 'K02.9', 'Karies Gigi Tidak Spesifik (Dental Caries, Unspecified)', 'Karies Gigi', 'Karies gigi yang belum terinci lokasi kedalaman jaringan keras yang terlibat.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-010', 'K04.0', 'Pulpitis Reversibel (Hiperemi Pulpa / Ngilu Terpicu Rangsangan)', 'Penyakit Pulpa & Periapikal', 'Inflamasi pulpa ringan di mana rasa ngilu tajam hanya timbul saat ada rangsang dingin/manis dan reda seketika.', 1, '2026-09-25 06:01:40', '2026-10-16 01:48:40'),
('DIA-011', 'K04.01', 'Pulpitis Ireversibel Akut (Nyeri Spontan Berdenyut Tajam)', 'Penyakit Pulpa & Periapikal', 'Peradangan pulpa berat dengan nyeri berdenyut hebat spontan terutama di malam hari, menetap lama pasca rangsangan.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-012', 'K04.02', 'Pulpitis Ireversibel Kronis (Nyeri Tumpul Hilang Timbul)', 'Penyakit Pulpa & Periapikal', 'Inflamasi pulpa kronis yang berlangsung lama dengan gejala nyeri tumpul ringan atau tanpa keluhan nyeri hebat.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-013', 'K04.03', 'Pulpitis Hiperplastik / Polip Pulpa (Pulp Polyp)', 'Penyakit Pulpa & Periapikal', 'Proliferasi jaringan granulasi pulpa membentuk polip kemerahan di dalam kavitas karies terbuka luas pada usia muda.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-014', 'K04.1', 'Nekrosis Pulpa / Gangren Pulpa (Gigi Non-Vital Mati)', 'Penyakit Pulpa & Periapikal', 'Kematian jaringan pulpa gigi akibat infeksi lanjut atau trauma, gigi tidak merespons tes vitalitas CE/EPT.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-015', 'K04.2', 'Degenerasi Pulpa / Kalsifikasi Saluran Akar (Pulp Stone / Dentikel)', 'Penyakit Pulpa & Periapikal', 'Perubahan degeneratif pulpa seperti kalsifikasi ruang pulpa, batu pulpa (pulp stones), atau atrofi pulpa.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-016', 'K04.3', 'Pembentukan Jaringan Keras Abnormal dalam Pulpa (Dentin Tersier Irregular)', 'Penyakit Pulpa & Periapikal', 'Pembentukan dentin sekunder atau reparatif irregular yang berlebihan di dalam ruang pulpa.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-017', 'K04.4', 'Periodontitis Apikalis Akut (Nyeri Saat Mengunyah & Perkusi)', 'Penyakit Pulpa & Periapikal', 'Inflamasi akut ligamen periodontal di sekitar apeks akar gigi, sangat nyeri saat gigi ditekan atau diperkusi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-018', 'K04.5', 'Periodontitis Apikalis Kronis (Granuloma Periapikal Gigi)', 'Penyakit Pulpa & Periapikal', 'Lesi inflamasi periapikal kronis tanpa gejala akut, tampak radiolusensi berbatas jelas di apeks akar pada rontgen.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-019', 'K04.6', 'Abses Periapikal dengan Sinus / Fistula Gusi (Fistul Intraoral Odontogenik)', 'Penyakit Pulpa & Periapikal', 'Infeksi supuratif periapikal yang telah membentuk saluran fistula/gum boil ke mukosa intraoral dengan drainase nanah.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-020', 'K04.7', 'Abses Periapikal Akut Tanpa Sinus (Bengkak Dentoalveolar Akut)', 'Penyakit Pulpa & Periapikal', 'Pembengkakan bernanah akut pada apeks akar tanpa saluran pembuangan, menimbulkan bengkak lokal nyeri hebat.', 1, '2026-09-25 06:01:40', '2026-10-16 01:48:40'),
('DIA-021', 'K04.8', 'Kista Radikular / Kista Periapikal (Radicular Cyst)', 'Penyakit Pulpa & Periapikal', 'Kista odontogenik berbatas epitel yang berkembang dari granuloma periapikal gigi non-vital di apeks akar.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-022', 'K04.9', 'Penyakit Pulpa dan Periapikal Lainnya & Tidak Spesifik', 'Penyakit Pulpa & Periapikal', 'Kelainan jaringan pulpa dan periapikal lainnya yang tidak tercakup dalam klasifikasi spesifik.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-023', 'K05.0', 'Gingivitis Akut (Gusi Merah, Bengkak & Mudah Berdarah)', 'Gusi & Periodontal', 'Inflamasi akut pada jaringan gingiva dengan eritema, edema, dan perdarahan spontan atau saat menyikat gigi.', 1, '2026-09-25 06:01:40', '2026-10-16 01:48:40'),
('DIA-024', 'K05.00', 'Gingivitis Ulseratif Nekrotikans Akut (ANUG / Acute Necrotizing Ulcerative Gingivitis)', 'Gusi & Periodontal', 'Infeksi nekrotikans akut papila interdental dengan ulserasi bergaung, pseudomembran kelabu, nyeri hebat dan bau mulut.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-025', 'K05.1', 'Gingivitis Kronis (Plaque-Induced Chronic Gingivitis)', 'Gusi & Periodontal', 'Inflamasi gusi kronis akibat akumulasi plak bakteri dan karang gigi tanpa disertai kehilangan perlekatan tulang.', 1, '2026-09-25 06:01:40', '2026-10-16 01:48:40'),
('DIA-026', 'K05.2', 'Periodontitis Akut / Abses Periodontal (Periodontal Pocket Pus)', 'Gusi & Periodontal', 'Infeksi supuratif terlokalisir pada dinding poket periodontal dengan eksudat purulen dan nyeri tekan.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-027', 'K05.22', 'Perikoronitis Akut Gigi Bungsu (Acute Pericoronitis M3)', 'Gusi & Periodontal', 'Peradangan dan infeksi akut operkulum jaringan lunak di atas mahkota gigi geraham bungsu yang sedang erupsi sebagian.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-028', 'K05.23', 'Perikoronitis Kronis Gigi Bungsu (Chronic Pericoronitis)', 'Gusi & Periodontal', 'Inflamasi kronis ringan berulang pada operkulum gigi impaksi tanpa pembengkakan supuratif akut.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-029', 'K05.3', 'Periodontitis Kronis Menyeluruh (Generalized Chronic Periodontitis)', 'Gusi & Periodontal', 'Destruksi progresif ligamen periodontal dan resorpsi tulang alveolar pada lebih dari 30% area gigi, gigi goyang.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-030', 'K05.31', 'Periodontitis Kronis Terlokalisir (Localized Chronic Periodontitis)', 'Gusi & Periodontal', 'Kehilangan perlekatan periodontal dan kedalaman poket bertambah terbatas pada kurang dari 30% lokasi gigi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-031', 'K05.4', 'Periodontosis / Periodontitis Agresif (Aggressive Periodontitis)', 'Gusi & Periodontal', 'Kerusakan jaringan periodontal parah dan cepat pada usia muda, sering melibatkan gigi insisivus dan molar satu.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-032', 'K05.5', 'Penyakit Periodontal Lainnya', 'Gusi & Periodontal', 'Kondisi patologis periodontal lainnya yang tidak diklasifikasikan terpisah.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-033', 'K06.0', 'Resesi Gingiva (Gusi Turun / Akar Gigi Terbuka)', 'Gusi & Periodontal', 'Migrasi tepi gingiva ke arah apikal dari garis semento-enamel (CEJ) menyebabkan terbukanya permukaan akar gigi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-034', 'K06.1', 'Hiperplasia Gingiva / Pembesaran Gusi Fibrotik (Drug-Induced Gingival Overgrowth)', 'Gusi & Periodontal', 'Penebalan dan pembesaran jaringan gusi fibrotik akibat obat antihipertensi/antikonvulsan atau faktor genetik.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-035', 'K06.2', 'Lesi Traumatik Gingiva & Lingir Alveolar (Ulkus Traumatik Gusi)', 'Gusi & Periodontal', 'Luka ulserasi atau lecet pada gingiva akibat trauma mekanis seperti sikat gigi keras, tusuk gigi, atau makanan keras.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-036', 'K06.8', 'Epulis Gusi (Epulis Fibromatosa / Granulomatosa / Gigantoseluler)', 'Gusi & Periodontal', 'Benjolan hiperplastik jinak yang tumbuh pada gusi, biasanya berasal dari ligamen periodontal atau periosteum.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-037', 'K06.9', 'Gangguan Gusi dan Lingir Alveolar Tidak Spesifik', 'Gusi & Periodontal', 'Kelainan pada gusi atau lingir alveolar edentulus yang belum ditentukan jenis spesifiknya.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-038', 'K01.1', 'Gigi Impaksi Geraham Bungsu (Molar 3 Impaksi Mandibula / Maksila)', 'Gigi Impaksi & Erupsi', 'Gigi geraham bungsu ketiga yang terhalang erupsi normal oleh tulang rahang atau gigi molar kedua di dekatnya.', 1, '2026-09-25 06:01:40', '2026-10-16 01:48:40'),
('DIA-039', 'K01.16', 'Gigi Impaksi Kaninus / Taring (Impacted Canine)', 'Gigi Impaksi & Erupsi', 'Gigi taring atas atau bawah terhalang erupsi dan tertahan di dalam tulang rahang atau palatum.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-040', 'K01.18', 'Gigi Impaksi Premolar atau Lainnya', 'Gigi Impaksi & Erupsi', 'Impaksi pada gigi premolar, insisivus, atau supernumerary yang gagal erupsi normal ke lengkung gigi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-041', 'K01.0', 'Gigi Terpendam / Terbenam Tulang (Embedded Teeth)', 'Gigi Impaksi & Erupsi', 'Gigi yang gagal erupsi sempurna tanpa adanya hambatan fisik yang jelas dari gigi lain.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-042', 'K00.6', 'Persistensi Gigi Susu (Over-Retained Deciduous Teeth)', 'Gigi Impaksi & Erupsi', 'Gigi sulung yang belum tanggal melebihi usia fisiologis normalnya saat gigi tetap pengganti sudah mulai tumbuh.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-043', 'K00.61', 'Erupsi Prematur Gigi Susu (Natal / Neonatal Teeth)', 'Gigi Impaksi & Erupsi', 'Gigi sulung yang sudah erupsi saat lahir (natal teeth) atau tumbuh dalam kurun 30 hari pasca kelahiran (neonatal).', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-044', 'K00.62', 'Erupsi Terlambat Gigi Permanen (Delayed Tooth Eruption)', 'Gigi Impaksi & Erupsi', 'Keterlambatan waktu munculnya gigi permanen melampaui rentang usia normal erupsi fisiologis.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-045', 'K00.7', 'Sindrom Erupsi Gigi Anak (Teething Pain / Nyeri Tumbuh Gigi)', 'Gigi Impaksi & Erupsi', 'Ketidaknyamanan, iritabilitas, demam ringan, dan hiperemia gusi pada bayi dan anak saat gigi sulung mulai menembus gusi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-046', 'K03.0', 'Atrisi Gigi Berlebihan (Excessive Attrition / Bruxism / Gigi Aus Gesek)', 'Kelainan Jaringan Keras Gigi', 'Keausan permukaan oklusal dan insisal gigi akibat gesekan mekanis antar gigi lawan (misal kebiasaan bruxism).', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-047', 'K03.1', 'Abrasi Gigi (Defek Baji Leher Gigi Servikal / Sikat Gigi Keras)', 'Kelainan Jaringan Keras Gigi', 'Keausan struktur gigi akibat gesekan benda asing secara berulang seperti teknik menyikat gigi horizontal yang keras.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-048', 'K03.2', 'Erosi Gigi (Aus Kimiawi Asam Lambung GERD / Makanan Asam)', 'Kelainan Jaringan Keras Gigi', 'Pelarutan dan hilangnya lapisan email-dentin akibat paparan zat asam kimia tanpa melibatkan bakteri (asam lambung/minuman soda).', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-049', 'K03.3', 'Resorpsi Patologis Gigi (Resorpsi Internal Pulpa & Eksternal Akar)', 'Kelainan Jaringan Keras Gigi', 'Kerusakan resorptif jaringan keras gigi baik dari dalam saluran akar (internal) maupun dari permukaan luar akar (eksternal).', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-050', 'K03.4', 'Hipersementosis (Penebalan Sementum Berlebih Akar Gigi)', 'Kelainan Jaringan Keras Gigi', 'Deposisi jaringan sementum yang berlebihan dan abnormal pada bagian akar gigi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-051', 'K03.5', 'Ankilosis Gigi (Fusi Akar Gigi dengan Tulang Alveolar)', 'Kelainan Jaringan Keras Gigi', 'Penyatuan anatomis langsung antara sementum akar gigi dan tulang alveolar akibat hilangnya ligamen periodontal.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-052', 'K03.6', 'Deposit / Karang Gigi (Kalkulus Supragingival & Subgingival)', 'Kelainan Jaringan Keras Gigi', 'Endapan plak termineralisasi yang mengeras pada mahkota dan leher gigi, serta pewarnaan ekstrinsik tembakau/kopi/teh.', 1, '2026-09-25 06:01:40', '2026-10-16 01:48:40'),
('DIA-053', 'K03.7', 'Perubahan Warna Jaringan Keras Gigi Pasca-Erupsi (Stain Intrinsik / Non-Vital)', 'Kelainan Jaringan Keras Gigi', 'Diskolorisasi jaringan keras gigi setelah erupsi akibat nekrosis pulpa, degradasi darah pasca trauma, atau medikasi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-054', 'K03.8', 'Dentin Hipersensitif (Dentine Hypersensitivity / Gigi Ngilu Sangat Sensitif)', 'Kelainan Jaringan Keras Gigi', 'Nyeri tajam singkat yang timbul pada dentin yang terbuka akibat rangsangan termal, evaporatif, taktil, atau osmotik.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-055', 'K03.81', 'Sindrom Gigi Retak (Cracked Tooth Syndrome)', 'Kelainan Jaringan Keras Gigi', 'Fraktur inkomplit mikro pada gigi vital posterior yang menimbulkan nyeri tajam sesaat saat melepaskan gigitan mengunyah.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-056', 'K03.9', 'Penyakit Jaringan Keras Gigi Tidak Spesifik', 'Kelainan Jaringan Keras Gigi', 'Kelainan jaringan keras gigi yang belum dapat diklasifikasikan ke dalam kategori diagnostik khusus.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-057', 'K00.0', 'Anodonsia / Hipodonsia / Oligodonsia (Gigi Kurang Bawaan)', 'Kelainan Bentuk & Struktur Gigi', 'Kelainan bawaan berupa tidak terbentuknya satu atau beberapa benih gigi (hipodonsia) atau seluruh gigi (anodonsia).', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-058', 'K00.1', 'Gigi Berlebih (Supernumerary Teeth / Mesiodens / Paramolar)', 'Kelainan Bentuk & Struktur Gigi', 'Adanya benih gigi tambahan melebihi jumlah normal, sering di garis tengah anterior atas (mesiodens) atau di molar (paramolar).', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-059', 'K00.2', 'Kelainan Ukuran & Bentuk Gigi (Makrodonsia / Mikrodonsia / Peg-Shaped)', 'Kelainan Bentuk & Struktur Gigi', 'Ukuran mahkota gigi yang jauh lebih besar (makrodonsia) atau kecil berbentuk kerucut baji (peg-shaped incisor).', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-060', 'K00.21', 'Fusi Gigi & Geminasi Gigi (Fusion and Gemination)', 'Kelainan Bentuk & Struktur Gigi', 'Penyatuan dua benih gigi yang sedang berkembang (fusi) atau satu benih gigi membelah menjadi dua mahkota (geminasi).', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-061', 'K00.22', 'Dens Evaginatus / Dens Invaginatus (Dens In Dente)', 'Kelainan Bentuk & Struktur Gigi', 'Kelainan lipatan organ email ke dalam ruang pulpa (dens in dente) atau tonjolan tuberkel tambahan pada permukaan oklusal.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-062', 'K00.24', 'Taurodonsia (Taurodontism)', 'Kelainan Bentuk & Struktur Gigi', 'Pembesaran ruang pulpa gigi molar ke arah vertikal dengan pemendekan akar gigi menyerupai anatomi gigi hewan banteng.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-063', 'K00.3', 'Fluorosis Gigi (Mottled Enamel / Gigi Bercak Fluor)', 'Kelainan Bentuk & Struktur Gigi', 'Hipomineralisasi email gigi akibat asupan fluoride yang berlebihan selama fase amelogenesis pembentukan gigi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-064', 'K00.4', 'Hipoplasia Email Gigi (Enamel Hypoplasia / Gigi Turner)', 'Kelainan Bentuk & Struktur Gigi', 'Defek kuantitatif ketebalan lapisan email dengan pit atau alur akibat gangguan lokal atau sistemik saat pembentukan email.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-065', 'K00.5', 'Gangguan Herediter Struktur Gigi (Amelogenesis / Dentinogenesis Imperfecta)', 'Kelainan Bentuk & Struktur Gigi', 'Kelainan genetik pembentukan matriks email rapuh (amelogenesis) atau dentin translusen kebiruan mudah aus (dentinogenesis).', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-066', 'K08.1', 'Kehilangan Sebagian Gigi (Edentulism Parsial Akibat Trauma/Ekstraksi)', 'Kehilangan Gigi & Radiks', 'Ketiadaan beberapa gigi permanen dalam lengkung rahang pasca pencabutan atau trauma, membutuhkan gigi tiruan.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-067', 'K08.10', 'Kehilangan Seluruh Gigi (Edentulism Total Rahang Atas & Bawah)', 'Kehilangan Gigi & Radiks', 'Ketiadaan seluruh elemen gigi pada satu atau kedua rahang, memerlukan rehabilitasi gigi tiruan lengkap lepas.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-068', 'K08.2', 'Atrofi Lingir Alveolar Tanpa Gigi (Resorpsi Tulang Lingir / Flat Ridge)', 'Kehilangan Gigi & Radiks', 'Penyusutan progresif ketinggian dan lebar tulang alveolar pasca kehilangan gigi (lingir rahang datar/flabby ridge).', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-069', 'K08.3', 'Sisa Akar Gigi Tertinggal (Retained Dental Root / Radix / Gangren Radiks)', 'Kehilangan Gigi & Radiks', 'Akar gigi tertinggal di dalam tulang alveolar setelah mahkota gigi hancur akibat karies profunda atau patah pasca trauma.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-070', 'K08.8', 'Pembesaran Lingir Alveolar / Flabby Ridge', 'Kehilangan Gigi & Radiks', 'Hiperplasia jaringan lunak lingir alveolar yang mudah bergerak di bawah basis gigi tiruan.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-071', 'K07.0', 'Anomali Ukuran Rahang (Makrognasia / Mikrognasia Maksila atau Mandibula)', 'Maloklusi & Ortodonti', 'Ketidaksesuaian ukuran ukuran tulang rahang atas atau bawah yang terlalu besar atau terlalu kecil dibandingkan kranium.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-072', 'K07.1', 'Anomali Hubungan Rahang dengan Dasar Tengkorak (Prognatisme / Retrognatisme)', 'Maloklusi & Ortodonti', 'Posisi rahang maju ke depan (prognatism) atau mundur ke belakang (retrognatism) terhadap basis kranii.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-073', 'K07.2', 'Maloklusi Dental (Maloklusi Angle Kelas I, Kelas II, Kelas III)', 'Maloklusi & Ortodonti', 'Ketidakharmonisan hubungan oklusi antara lengkung gigi atas dan bawah sesuai klasifikasi Angle.', 1, '2026-09-25 06:01:40', '2026-10-16 01:48:40'),
('DIA-074', 'K07.21', 'Gigitan Terbuka (Open Bite Anterior / Posterior)', 'Maloklusi & Ortodonti', 'Ketiadaan kontak oklusal vertikal antara gigi atas dan bawah saat rahang dalam keadaan oklusi sentrik.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-075', 'K07.22', 'Gigitan Dalam Berlebih (Deep Overbite / Deep Bite)', 'Maloklusi & Ortodonti', 'Tumpang gigit vertikal gigi insisivus atas yang menutupi insisivus bawah secara berlebihan hingga menyentuh palatum.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-076', 'K07.24', 'Gigitan Silang (Crossbite Anterior / Posterior)', 'Maloklusi & Ortodonti', 'Hubungan gigi atas yang berada di sebelah lingual dari gigi bawah saat beroklusi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-077', 'K07.3', 'Gigi Berjejal / Crowding (Anomali Posisi Gigi)', 'Maloklusi & Ortodonti', 'Disproporsi antara ruang lengkung rahang dan ukuran lebar gigi sehingga susunan gigi berjejal dan tumpang tindih.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-078', 'K07.31', 'Diastema Sentral / Spacing (Celah Renggang Antar Gigi)', 'Maloklusi & Ortodonti', 'Adanya celah ruang pemisah yang nyata antara dua gigi yang seharusnya berkontak rapat, terutama di antara gigi insisivus sentral.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-079', 'K07.32', 'Rotasi dan Transposisi Gigi (Rotated / Transposed Teeth)', 'Maloklusi & Ortodonti', 'Penyimpangan orientasi sumbu panjang gigi memutar (rotasi) atau pertukaran urutan posisi antar dua gigi berdekatan.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-080', 'K07.5', 'Kelainan Fungsional Dentofasial (Kebiasaan Menghisap Jempol / Bernapas Lewat Mulut)', 'Maloklusi & Ortodonti', 'Gangguan perkembangan lengkung gigi akibat kebiasaan buruk seperti tongue thrusting, mouth breathing, atau thumb sucking.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-081', 'K07.6', 'Gangguan Sendi Temporomandibular (Temporomandibular Joint Disorder - TMD)', 'Sendi Rahang (TMJ)', 'Kelainan fungsional sendi engsel rahang yang ditandai dengan nyeri, keterbatasan gerak membuka mulut, dan deviasi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-082', 'K07.60', 'Sindrom Kliking & Disfungsi TMJ (TMJ Clicking / Crepitus)', 'Sendi Rahang (TMJ)', 'Adanya bunyi \'klik\' atau krepitasi pada sendi rahang saat membuka atau menutup mulut akibat perpindahan diskus artikularis.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-083', 'K07.61', 'Nyeri Miofasial Mastikasi (Myofascial Pain Dysfunction Syndrome Otot Rahang)', 'Sendi Rahang (TMJ)', 'Nyeri tumpul pegal pada otot-otot pengunyah (masseter, temporalis) dengan titik picu nyeri (trigger points).', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-084', 'K07.62', 'Subluksasi & Dislokasi Rekuren TMJ (Recurrent Dislocation of TMJ)', 'Sendi Rahang (TMJ)', 'Kondisi di mana kondilus mandibula tergelincir melompati eminensia artikularis sehingga rahang terkunci dalam posisi terbuka.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-085', 'K10.0', 'Torus & Eksostosis Rahang (Torus Palatinus / Torus Mandibularis)', 'Kelainan Rahang & Alveolus', 'Penonjolan tulang jinak non-neoplastik pada garis tengah palatum keras atau permukaan lingual korpus mandibula.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-086', 'K10.1', 'Granuloma Sel Raksasa Sentral Rahang (Central Giant Cell Granuloma)', 'Kelainan Rahang & Alveolus', 'Lesi intraosseus jinak rahang yang tersusun atas stroma fibroblas kaya vaskular dan sel raksasa berinti banyak.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-087', 'K10.2', 'Osteomielitis Rahang (Osteomyelitis Maksila / Mandibula)', 'Kelainan Rahang & Alveolus', 'Infeksi supuratif parah yang melibatkan medula tulang rahang, periosteum, dan korteks tulang.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-088', 'K10.21', 'Periostitis Rahang Odontogenik (Periostitis of Jaw)', 'Kelainan Rahang & Alveolus', 'Inflamasi pada periosteum tulang rahang yang dipicu oleh penyebaran infeksi dari abses gigi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-089', 'K10.3', 'Alveolitis Pasca Pencabutan Gigi (Dry Socket / Alveolitis Sika)', 'Kelainan Rahang & Alveolus', 'Komplikasi pasca-ekstraksi gigi di mana bekuan darah soket lepas prematur menyebabkan tulang alveolar terbuka dan nyeri hebat.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-090', 'K10.8', 'Osteonekrosis Rahang Terkait Obat (MRONJ - Medication-Related Osteonecrosis)', 'Kelainan Rahang & Alveolus', 'Area nekrosis tulang rahang terbuka yang tidak kunjung sembuh pada pasien dengan riwayat terapi bisfosfonat atau anti-angiogenik.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-091', 'K09.0', 'Kista Dentigerous / Kista Folikular (Dentigerous Cyst)', 'Kista Regio Mulut & Rahang', 'Kista odontogenik yang berkembang menyelubungi mahkota gigi yang belum erupsi (sering pada gigi molar ketiga atau kaninus).', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-092', 'K09.01', 'Kista Erupsi Gigi Anak (Eruption Cyst)', 'Kista Regio Mulut & Rahang', 'Kista jaringan lunak kebiruan berisi cairan serosa atau darah yang terbentuk di atas mahkota gigi yang sedang akan erupsi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-093', 'K09.02', 'Keratokista Odontogenik (Odontogenic Keratocyst - OKC)', 'Kista Regio Mulut & Rahang', 'Kista rahang intraosseus dengan lapisan epitel bertanduk tipis dan tingkat rekurensi yang tinggi pasca-enukleasi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-094', 'K09.1', 'Kista Duktus Nasopalatinus (Nasopalatine Duct Cyst / Incisive Canal Cyst)', 'Kista Regio Mulut & Rahang', 'Kista perkembangan non-odontogenik yang paling umum terjadi di garis tengah anterior palatum durum.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-095', 'K09.8', 'Kista Dermoid Rongga Mulut', 'Kista Regio Mulut & Rahang', 'Kista perkembangan yang berdinding epitel skuamosa berkeratin dan mengandung adneksa kulit di dasar mulut.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-096', 'K11.1', 'Hipertrofi Kelenjar Liur Parotis / Submandibula', 'Penyakit Kelenjar Liur', 'Pembesaran parenkim kelenjar saliva mayor tanpa proses keganasan primer.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-097', 'K11.2', 'Sialadenitis (Radang Infeksi Kelenjar Liur Akut / Kronis)', 'Penyakit Kelenjar Liur', 'Peradangan pada kelenjar liur akibat infeksi bakteri atau virus dengan gejala pembengkakan nyeri di sudut rahang.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-098', 'K11.3', 'Abses Kelenjar Liur (Salivary Gland Abscess)', 'Penyakit Kelenjar Liur', 'Pengumpulan nanah terlokalisasi di dalam parenkim kelenjar liur parotis atau submandibula.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-099', 'K11.5', 'Sialolitiasis / Batu Kelenjar Liur (Salivary Duct Calculus)', 'Penyakit Kelenjar Liur', 'Pembentukan batu kalsium di dalam saluran kelenjar saliva (terbanyak di duktus Wharton kelenjar submandibula), nyeri saat makan.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-100', 'K11.6', 'Mukokel Rongga Mulut (Mucocele Kelenjar Liur Bibir / Pipi)', 'Penyakit Kelenjar Liur', 'Kista ekstravasasi mukus akibat trauma gigitan pada saluran kelenjar liur minor bibir bawah, berupa benjolan kebiruan kenyal.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-101', 'K11.61', 'Ranula Dasar Mulut (Ranula Sublingualis)', 'Penyakit Kelenjar Liur', 'Mukokel berukuran besar pada dasar mulut akibat sumbatan atau ruptur duktus kelenjar saliva sublingualis.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-102', 'K11.7', 'Gangguan Sekresi Saliva / Xerostomia (Mulut Kering Kronis / Hiposalivasi)', 'Penyakit Kelenjar Liur', 'Penurunan laju alir saliva fisiologis yang menyebabkan mukosa rongga mulut kering, sensasi terbakar, dan risiko karies meningkat.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-103', 'K12.0', 'Stomatitis Aftosa Rekuren Minor (SAR Minor / Sariawan Rekuren)', 'Mukosa Mulut & Bibir', 'Ulkus bulat dangkal berbatas kemerahan dengan dasar fibrin kekuningan, diameter <1 cm, sembuh dalam 7-14 hari tanpa jaringan parut.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-104', 'K12.01', 'Stomatitis Aftosa Rekuren Mayor (SAR Mayor / Sutton\'s Ulcer)', 'Mukosa Mulut & Bibir', 'Ulkus aftosa yang dalam dan besar (>1 cm), sangat nyeri, memerlukan waktu berminggu-minggu untuk sembuh dan meninggalkan jaringan parut.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-105', 'K12.02', 'Ulkus Aftosa Herpetiformis (Herpetiform Aphthous Ulceration)', 'Mukosa Mulut & Bibir', 'Kemunculan multipel ulkus kecil (1-2 mm) berkelompok mirip herpes yang dapat bergabung membentuk lesi besar.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-106', 'K12.1', 'Stomatitis Kontak Alergi (Allergic Contact Stomatitis)', 'Mukosa Mulut & Bibir', 'Reaksi inflamasi alergi tipe lambat pada mukosa oral akibat kontak dengan bahan tambal dental, pasta gigi, atau kawat gigi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-107', 'K12.2', 'Selulitis & Abses Dasar Mulut (Angina Ludwig / Ludwig\'s Angina Odontogenik)', 'Mukosa Mulut & Bibir', 'Infeksi selulitis difus yang mengancam jiwa, menyebar cepat di spasium submandibular, sublingual, dan submental bilateral.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-108', 'K12.21', 'Abses Spasium Fasial Odontogenik (Abses Submandibular / Bukal / Fosa Kanina)', 'Mukosa Mulut & Bibir', 'Penyebaran nanah odontogenik dari apeks gigi ke ruang-ruang fasial potensial wajah dan leher.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-109', 'K12.3', 'Mukositis Oral Akibat Terapi (Oral Mucositis Radiasi/Kemoterapi)', 'Mukosa Mulut & Bibir', 'Eritema dan ulserasi luas mukosa mulut akibat efek samping toksik kemoterapi atau radiasi kepala-leher.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-110', 'K13.0', 'Keilitis Angularis (Angular Cheilitis / Perleche / Luka Radang Sudut Bibir)', 'Mukosa Mulut & Bibir', 'Fisura eritematosa meradang dan perih pada sudut bibir bilateral, sering dipicu oleh infeksi Candida, kehilangan dimensi vertikal, atau defisiensi besi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-111', 'K13.01', 'Keilitis Eksfoliativa (Exfoliative Cheilitis Bibir Mengelupas)', 'Mukosa Mulut & Bibir', 'Pengelupasan kronis dan pembentukan krusta pada bibir akibat inflamasi superfisial berulang.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-112', 'K13.1', 'Gigitan Pipi & Bibir Habitualis (Morsicatio Buccarum et Labiorum)', 'Mukosa Mulut & Bibir', 'Lesi putih kasar compang-camping pada mukosa bukal garis oklusal akibat kebiasaan mengunyah pipi secara tidak sadar.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-113', 'K13.2', 'Leukoplakia Rongga Mulut (Oral Leukoplakia - Lesi Putih Prakanker)', 'Mukosa Mulut & Bibir', 'Plak putih keratotik berbatas tegas pada mukosa oral yang tidak dapat diangkat dengan usapan dan berpotensi prakanker.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-114', 'K13.21', 'Eritroplakia Rongga Mulut (Oral Erythroplakia - Lesi Merah Risiko Tinggi)', 'Mukosa Mulut & Bibir', 'Makula atau plak merah beludru pada mukosa mulut dengan risiko transformasi keganasan yang sangat tinggi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-115', 'K13.22', 'Leukokeratosis Nikotina (Smoker\'s Palate / Palatum Perokok)', 'Mukosa Mulut & Bibir', 'Perubahan mukosa palatum durum menjadi keputihan dengan titik-titik merah di muara kelenjar liur minor akibat panas rokok.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-116', 'K13.4', 'Granuloma Piogenik Mukosa Mulut (Oral Pyogenic Granuloma)', 'Mukosa Mulut & Bibir', 'Lesi vaskular jinak bertangkai yang mudah berdarah pada gusi atau mukosa, sering terkait kehamilan (pregnancy tumor) atau iritasi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-117', 'K13.6', 'Hiperplasia Iritasi Mukosa Mulut (Epulis Fissuratum / Denture Fibroma)', 'Mukosa Mulut & Bibir', 'Lipatan jaringan fibrosa hiperplastik pada sulkus gingivobukal akibat tepi sayap gigi tiruan tiruan lepasan yang menekan.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-118', 'K13.7', 'Pigmentasi & Lesi Mukosa Lainnya (Tato Amalgam / Melanin Oral)', 'Mukosa Mulut & Bibir', 'Deposit partikel logam tambalan amalgam ke dalam jaringan mukosa (tato amalgam) atau pigmentasi fisiologis melanin.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-119', 'K14.0', 'Glositis Akut / Ulkus Lidah Traumatik (Glossitis / Lingual Ulcer)', 'Penyakit Lidah', 'Peradangan akut pada lidah yang ditandai dengan pembengkakan kemerahan atau luka akibat tergigit tepi gigi tajam.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-120', 'K14.1', 'Lidah Geografika (Geographic Tongue / Benign Migratory Glossitis)', 'Penyakit Lidah', 'Area depapilasi kemerahan dengan tepi keputihan pada dorsum lidah yang berpindah-pindah menyerupai peta kontur.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-121', 'K14.2', 'Glositis Romboid Median (Median Rhomboid Glossitis)', 'Penyakit Lidah', 'Zona depapilasi atrofik kemerahan berbentuk belah ketupat di garis tengah dorsum posterior lidah anterior dari foramen caecum.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-122', 'K14.3', 'Lidah Berambut Hitam (Black Hairy Tongue / Lingua Villosa Nigra)', 'Penyakit Lidah', 'Elongasi dan hipertrofi papila filiformis lidah dengan pewarnaan kecokelatan/kehitaman akibat bakteri chromogenic atau antibiotik.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-123', 'K14.4', 'Glositis Atrofi (Atrophic Glossitis / Smooth Tongue Defisiensi Nutrisi)', 'Penyakit Lidah', 'Permukaan dorsum lidah menjadi licin, mengilap kemerahan tanpa papila akibat defisiensi vitamin B12, asam folat, atau anemia besi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-124', 'K14.5', 'Lidah Berlipat-lipat (Fissured Tongue / Scrotal Tongue)', 'Penyakit Lidah', 'Variasi anatomis berupa alur dan celah yang dalam pada permukaan dorsum lidah, sering merupakan kondisi bawaan.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-125', 'K14.6', 'Glosodinia / Burning Mouth Syndrome (Sensasi Lidah Terbakar)', 'Penyakit Lidah', 'Sensasi terbakar kronis tanpa kelainan lesi klinis yang nyata pada mukosa lidah dan rongga mulut.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-126', 'K14.8', 'Ankiloglosia Lidah (Ankyloglossia / Tongue-Tie)', 'Penyakit Lidah', 'Perlekatan frenulum lingualis yang terlalu pendek dan tebal sehingga membatasi pergerakan ujung lidah dan artikulasi bicara.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-127', 'S02.50', 'Fraktur Email Gigi Saja (Enamel Infraction / Retak Email)', 'Trauma Gigi & Maksilofasial', 'Garis retak inkomplit pada lapisan email gigi tanpa adanya kehilangan struktur substansi gigi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-128', 'S02.51', 'Fraktur Mahkota Gigi Tanpa Pulpa (Uncomplicated Crown Fracture)', 'Trauma Gigi & Maksilofasial', 'Fraktur mahkota yang melibatkan email saja atau email dan dentin tanpa terbukanya kamar pulpa gigi.', 1, '2026-10-16 01:48:40', '2026-10-16 01:48:40'),
('DIA-129', 'S02.52', 'Fraktur Mahkota Gigi dengan Pulpa Terbuka (Complicated Crown Fracture)', 'Trauma Gigi & Maksilofasial', 'Fraktur trauma pada mahkota gigi yang menembus lapisan dentin hingga pulpa vital terpapar langsung dan berdarah.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-130', 'S02.53', 'Fraktur Akar Gigi (Root Fracture Vertikal / Horisontal)', 'Trauma Gigi & Maksilofasial', 'Garis fraktur yang melintasi struktur sementum, dentin akar, dan saluran pulpa secara horizontal atau vertikal.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-131', 'S02.54', 'Fraktur Mahkota-Akar Gigi (Crown-Root Fracture)', 'Trauma Gigi & Maksilofasial', 'Fraktur gigi miring yang meluas dari permukaan mahkota hingga ke bawah batas margin gingiva dan sementum akar.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-132', 'S02.57', 'Fraktur Gigi Multipel (Multiple Tooth Fractures)', 'Trauma Gigi & Maksilofasial', 'Kondisi fraktur mekanis yang mengenai lebih dari satu gigi secara bersamaan akibat benturan trauma fasial.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-133', 'S03.20', 'Konkusi Gigi (Concussion of Tooth / Trauma Ligamen Tanpa Goyang)', 'Trauma Gigi & Maksilofasial', 'Cedera pada struktur penyangga periodontal gigi tanpa adanya kegoyangan atau perpindahan letak gigi, nyeri saat perkusi.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-134', 'S03.21', 'Subluksasi Gigi (Subluxation of Tooth / Gigi Goyang Pasca Benturan)', 'Trauma Gigi & Maksilofasial', 'Cedera ligamen periodontal dengan kegoyangan abnormal namun tanpa perpindahan posisi gigi dari soket asalnya.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-135', 'S03.22', 'Luksasi Ekstrusi Gigi (Extrusive Luxation / Gigi Terungkit Keluar)', 'Trauma Gigi & Maksilofasial', 'Perpindahan sebagian gigi keluar dari soket alveolar sepanjang sumbu aksial akibat trauma benturan.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-136', 'S03.23', 'Luksasi Lateral Gigi (Lateral Luxation / Gigi Bergeser Labial-Lingual)', 'Trauma Gigi & Maksilofasial', 'Perpindahan posisi gigi ke arah selain aksial yang disertai fraktur atau kompresi pada dinding soket alveolar.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-137', 'S03.24', 'Luksasi Intrusi Gigi (Intrusive Luxation / Gigi Terdesak Masuk Tulang)', 'Trauma Gigi & Maksilofasial', 'Perpindahan gigi masuk ke arah dalam tulang alveolar soket disertai kerusakan luas ligamen periodontal dan neurovaskular.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-138', 'S03.25', 'Avulsi Gigi (Avulsion of Tooth / Gigi Terlepas Utuh dari Soket)', 'Trauma Gigi & Maksilofasial', 'Keluarnya gigi secara utuh seluruhnya dari soket alveolar tulang akibat trauma benturan mekanis keras.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-139', 'S02.6', 'Fraktur Tulang Mandibula (Mandibular Bone Fracture)', 'Trauma Gigi & Maksilofasial', 'Diskontinuitas tulang rahang bawah (korpus, simfisis, angulus, atau kondilus mandibula) akibat benturan kecelakaan.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-140', 'S02.4', 'Fraktur Tulang Maksila & Zigoma (Maxillary & Zygomatic Fracture)', 'Trauma Gigi & Maksilofasial', 'Fraktur tulang rahang atas (Le Fort I, II, III) atau kompleks zigomatiko-maksilaris.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-141', 'S03.0', 'Dislokasi Sendi Rahang TMJ Akut (Acute Dislocation of Jaw)', 'Trauma Gigi & Maksilofasial', 'Terlepasnya kaput kondilus mandibula ke anterior dari eminensia artikularis sehingga pasien tidak mampu menutup mulut.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-142', 'B37.0', 'Kandidiasis Oral Pseudomembranosa (Oral Thrush / Jamur Mulut)', 'Infeksi Spesifik Rongga Mulut', 'Plak putih seperti dadih susu pada mukosa oral yang dapat dikerok dan meninggalkan dasar eritematosa kemerahan.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-143', 'B37.01', 'Stomatitis Gigi Tiruan (Denture Stomatitis / Kandidiasis Eritematosa Kronis)', 'Infeksi Spesifik Rongga Mulut', 'Eritema mukosa palatal yang berkontak langsung dengan basis gigi tiruan akrilik akibat kolonisasi jamur Candida albicans.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-144', 'B00.2', 'Gingivostomatitis Herpetika Primer (Primary Herpetic Gingivostomatitis HSV-1)', 'Infeksi Spesifik Rongga Mulut', 'Infeksi primer virus Herpes Simplex tipe 1 dengan vesikel multipel pecah menjadi ulkus nyeri, demam, dan limfadenopati.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-145', 'B00.1', 'Herpes Labialis Rekuren (Cold Sores / Demam Lepuh Bibir)', 'Infeksi Spesifik Rongga Mulut', 'Reaktivasi infeksi virus HSV-1 berupa kelompok vesikel lepuh gatal dan nyeri pada batas vermilion bibir.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-146', 'B08.4', 'Penyakit Tangan, Kaki, dan Mulut (HFMD / Flu Singapura)', 'Infeksi Spesifik Rongga Mulut', 'Infeksi enterovirus (Coxsackie) dengan vesikel dan ulkus di palatum, lidah, mukosa bukal disertai ruam pada telapak tangan dan kaki.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-147', 'A69.0', 'Noma / Stomatitis Gangrenosa (Cancrum Oris)', 'Infeksi Spesifik Rongga Mulut', 'Penyakit gangrenosa mutilatif cepat pada jaringan lunak dan tulang wajah/mulut pada kondisi malnutrisi berat.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-148', 'A69.1', 'Stomatitis Vincent (Trench Mouth / Gingivitis Ulseratif Nekrotikans)', 'Infeksi Spesifik Rongga Mulut', 'Infeksi fuso-spirochaetal akut pada jaringan gusi dan mukosa mulut.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-149', 'Q35', 'Celah Langit-langit (Cleft Palate / Palatoskisis Kongenital)', 'Kelainan Kongenital Gigi-Mulut', 'Kegagalan fusi prosesus palatinus kongenital yang menimbulkan celah pada langit-langit mulut.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-150', 'Q36', 'Celah Bibir (Cleft Lip / Labioskisis / Bibir Sumbing)', 'Kelainan Kongenital Gigi-Mulut', 'Kelainan bawaan celah satu sisi (unilateral) atau dua sisi (bilateral) pada bibir atas.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-151', 'Q37', 'Celah Bibir dan Langit-langit (Cleft Lip with Cleft Palate / Labiopalatoskisis)', 'Kelainan Kongenital Gigi-Mulut', 'Kombinasi celah kongenital pada bibir dan langit-langit rongga mulut.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-152', 'Q38.1', 'Ankiloglosia Kongenital (Congenital Ankyloglossia / Frenulum Pendek Bawaan)', 'Kelainan Kongenital Gigi-Mulut', 'Frenulum lingua pendek kongenital sejak bayi yang menyebabkan kesulitan menyusui dan fonetik.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-153', 'Z01.2', 'Pemeriksaan & Kontrol Gigi Rutin (Dental Examination & General Check-Up)', 'Pemeriksaan & Kontrol Gigi', 'Kunjungan konsultasi, pemeriksaan berkala kesehatan gigi dan mulut rutin tanpa adanya keluhan patologis akut.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-154', 'Z46.3', 'Pemasangan & Penyesuaian Gigi Tiruan (Fitting & Adjustment of Dental Prosthesis)', 'Pemeriksaan & Kontrol Gigi', 'Kunjungan insersi, penyesuaian oklusi, dan adaptasi gigi tiruan lepasan atau cekat (crown/bridge).', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-155', 'Z46.4', 'Pemasangan & Penyesuaian Alat Ortodonti (Fitting & Adjustment of Orthodontic Device)', 'Pemeriksaan & Kontrol Gigi', 'Kontrol rutin aktivasi kawat gigi, penggantian archwire/karet ligatur, atau penyesuaian aligner ortodonti.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-156', 'Z96.5', 'Keberadaan Implan Gigi & Akar Buatan (Presence of Tooth & Dental Root Implants)', 'Pemeriksaan & Kontrol Gigi', 'Evaluasi dan kontrol berkala kondisi osseointegrasi fixture implan gigi dan mahkota implan.', 1, '2026-10-16 01:48:41', '2026-10-16 01:48:41'),
('DIA-157', 'K00.9', 'Gangguan Perkembangan dan Erupsi Gigi, Tidak Spesifik (Disorder of Tooth Development and Eruption, Unspecified)', 'Gigi Impaksi & Erupsi', 'Gangguan perkembangan atau erupsi gigi yang tidak dapat diklasifikasikan secara lebih spesifik berdasarkan informasi diagnosis yang tersedia.', 1, '2026-10-24 11:23:00', '2026-10-24 11:23:00'),
('id', 'code', 'name', 'category', 'description', 0, '0000-00-00 00:00:00', '0000-00-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `dental_insurances`
--

CREATE TABLE `dental_insurances` (
  `id` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL DEFAULT 'Asuransi Swasta',
  `contact_person` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `claim_count` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `dental_insurances`
--

INSERT INTO `dental_insurances` (`id`, `code`, `name`, `category`, `contact_person`, `phone`, `email`, `claim_count`, `is_active`, `created_at`, `updated_at`) VALUES
('INS-001', 'BPJS-DNT', 'BPJS Kesehatan (P-Care Dental)', 'Pemerintah / JKN', 'Pusat Layanan Faskes Primer BPJS', '165', 'faskes@bpjs-kesehatan.go.id', 184, 1, '2026-09-25 06:01:40', '2026-09-25 06:01:40'),
('INS-002', 'INHEALTH-DNT', 'Mandiri Inhealth Dental Care', 'Asuransi Komersial', 'Bambang Irawan (Provider Relation)', '021-525-0988', 'provider.dental@mandiriinhealth.co.id', 67, 1, '2026-09-25 06:01:40', '2026-09-25 06:01:40'),
('INS-003', 'PRU-DNT', 'Prudential PRUMedical Dental Rider', 'Asuransi Swasta', 'Customer Care Dental Claim', '1500085', 'claim@prudential.co.id', 42, 1, '2026-09-25 06:01:40', '2026-09-25 06:01:40'),
('INS-004', 'ADMEDIKA', 'AdMedika Third Party Administrator', 'TPA Korporasi', 'Meja Bantuan Klaim AdMedika', '021-500-811', 'helpdesk@admedika.co.id', 95, 1, '2026-09-25 06:01:40', '2026-09-25 06:01:40');

-- --------------------------------------------------------

--
-- Table structure for table `dental_procedures`
--

CREATE TABLE `dental_procedures` (
  `id` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL DEFAULT 'Umum',
  `cost` decimal(12,2) NOT NULL DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `dental_procedures`
--

INSERT INTO `dental_procedures` (`id`, `code`, `name`, `category`, `cost`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
('PROC-001', '23.70', 'Open bur', 'Endodontik (PSA)', 150000.00, 'Open bur', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-002', '89.07', 'Konsultasi', 'Pemeriksaan & Diagnostik', 100000.00, 'Konsultasi', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-003', '99.91', 'Cetak alginat', 'Prostodonsia (Gigi Tiruan)', 150000.00, 'Cetak alginat', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-004', '24.00', 'Incisi abses', 'Bedah Mulut', 350000.00, 'Incisi abses', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-005', '23.45', 'Insersi gigi tiruan', 'Prostodonsia (Gigi Tiruan)', 650000.00, 'Insersi gigi tiruan', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-006', '96.54', 'Pembersihan Karang Gigi (Scaling)', 'Periodonsia', 350000.00, 'Pembersihan Karang Gigi (Scaling)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-007', '23.2', 'Penambalan Permanen Komposit Sinar', 'Restorasi & Konservasi', 450000.00, 'Penambalan Permanen Komposit Sinar', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-008', '23.2G', 'Penambalan Permanen Glass Ionomer (GIC)', 'Restorasi & Konservasi', 300000.00, 'Penambalan Permanen Glass Ionomer (GIC)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-009', '23.2T', 'Penambalan Sementara (Fletcher / Cavit)', 'Restorasi & Konservasi', 150000.00, 'Penambalan Sementara (Fletcher / Cavit)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-010', '23.09', 'Pencabutan Gigi Tetap Dewasa', 'Bedah Mulut', 350000.00, 'Pencabutan Gigi Tetap Dewasa', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-011', '23.01', 'Pencabutan Gigi Susu Anak (Topikal)', 'Bedah Mulut', 175000.00, 'Pencabutan Gigi Susu Anak (Topikal)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-012', '23.19', 'Odontektomi / Bedah Gigi Bungsu', 'Bedah Mulut', 1850000.00, 'Odontektomi / Bedah Gigi Bungsu', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-013', '23.7', 'Perawatan Saluran Akar (PSA Kunjungan 1)', 'Endodontik (PSA)', 650000.00, 'Perawatan Saluran Akar (PSA Kunjungan 1)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-014', '23.41', 'Mahkota Jaket Porselen Zirconia', 'Prostodonsia (Gigi Tiruan)', 2800000.00, 'Mahkota Jaket Porselen Zirconia', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-015', '96.55', 'Bleaching / Pemutihan Gigi In-Office', 'Estetika Dental', 2500000.00, 'Bleaching / Pemutihan Gigi In-Office', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-016', '87.12', 'Rontgen Dental Periapikal', 'Radiologi Gigi', 150000.00, 'Rontgen Dental Periapikal', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-017', '87.11', 'Rontgen Panoramik Gigi 2D Digital', 'Radiologi Gigi', 250000.00, 'Rontgen Panoramik Gigi 2D Digital', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-018', '96.51', 'Aplikasi Topikal Fluoride Varnish Pencegah Karies Gigi', 'Preventif & Anak', 175000.00, 'Aplikasi Topikal Fluoride Varnish Pencegah Karies Gigi', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-019', '16.01', 'Fissure Sealant Penutupan Celah Gigi (per gigi)', 'Preventif & Anak', 200000.00, 'Fissure Sealant Penutupan Celah Gigi (per gigi)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-020', '96.52', 'Desensitisasi Leher Gigi Sensitif (Topical Agent)', 'Preventif & Anak', 150000.00, 'Desensitisasi Leher Gigi Sensitif (Topical Agent)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-021', '96.54A', 'Deep Scaling & Root Planing (SRP) per Kuadran', 'Periodonsia', 250000.00, 'Deep Scaling & Root Planing (SRP) per Kuadran', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-022', '96.54B', 'Kuretase Gingiva / Deep Pocket Curettage', 'Periodonsia', 200000.00, 'Kuretase Gingiva / Deep Pocket Curettage', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-023', '24.31', 'Gingivektomi / Gingivoplasti (Koreksi Gusi Berlebih)', 'Periodonsia', 600000.00, 'Gingivektomi / Gingivoplasti (Koreksi Gusi Berlebih)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-024', '24.70', 'Fiber Ribbon Splinting Gigi Goyang (per regio)', 'Periodonsia', 650000.00, 'Fiber Ribbon Splinting Gigi Goyang (per regio)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-025', '23.21', 'Penambalan Komposit Sinar Light-Curing Posterior Kelas I / II', 'Restorasi & Konservasi', 450000.00, 'Penambalan Komposit Sinar Light-Curing Posterior Kelas I / II', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-026', '23.20', 'Penambalan Komposit Sinar Estetik Anterior Kelas III / IV / V', 'Restorasi & Konservasi', 550000.00, 'Penambalan Komposit Sinar Estetik Anterior Kelas III / IV / V', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-027', '23.22', 'Penambalan Glass Ionomer Cement (GIC) Kuat Fisiologis', 'Restorasi & Konservasi', 300000.00, 'Penambalan Glass Ionomer Cement (GIC) Kuat Fisiologis', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-028', '23.23', 'Penambalan Sementara / Tumpatan Cavit Pasca Medikamen', 'Restorasi & Konservasi', 100000.00, 'Penambalan Sementara / Tumpatan Cavit Pasca Medikamen', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-029', '23.24', 'Direct Composite Veneer Estetik (per elemen)', 'Restorasi & Konservasi', 950000.00, 'Direct Composite Veneer Estetik (per elemen)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-030', '23.42', 'Inlay / Onlay Keramik Zirconia (CAD/CAM)', 'Restorasi & Konservasi', 1750000.00, 'Inlay / Onlay Keramik Zirconia (CAD/CAM)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-031', '23.71', 'PSA - Medikamen Dressing Saluran Akar (Kunjungan 2)', 'Endodontik (PSA)', 250000.00, 'PSA - Medikamen Dressing Saluran Akar (Kunjungan 2)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-032', '23.73', 'PSA - Pengisian & Obturasi Saluran Akar Gutta-Percha', 'Endodontik (PSA)', 600000.00, 'PSA - Pengisian & Obturasi Saluran Akar Gutta-Percha', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-033', '23.43', 'Pemasangan Fiber Post (Pasak Gigi) & Core Build-Up Komposit', 'Endodontik (PSA)', 750000.00, 'Pemasangan Fiber Post (Pasak Gigi) & Core Build-Up Komposit', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-034', '23.11', 'Pencabutan Gigi Tetap dengan Penyulit (Separasi Tulang / Akar Bengkok)', 'Bedah Mulut', 550000.00, 'Pencabutan Gigi Tetap dengan Penyulit (Separasi Tulang / Akar Bengkok)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-035', '23.12', 'Pencabutan Sisa Akar Gigi (Radiks Retained)', 'Bedah Mulut', 400000.00, 'Pencabutan Sisa Akar Gigi (Radiks Retained)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-036', '23.19B', 'Odontektomi Bedah Gigi Bungsu Impaksi Horisontal Kompleks Kelas III', 'Bedah Mulut', 2500000.00, 'Odontektomi Bedah Gigi Bungsu Impaksi Horisontal Kompleks Kelas III', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-037', '24.11', 'Penanganan Alveolitis / Dry Socket (Debridement + Alvogyl)', 'Bedah Mulut', 200000.00, 'Penanganan Alveolitis / Dry Socket (Debridement + Alvogyl)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-038', '24.32', 'Alveolektomi / Penghalusan Tulang Alveolar Tajam', 'Bedah Mulut', 600000.00, 'Alveolektomi / Penghalusan Tulang Alveolar Tajam', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-039', '24.35', 'Operkulektomi (Eksisi Gusi Penutup Gigi Bungsu Erupsi)', 'Bedah Mulut', 450000.00, 'Operkulektomi (Eksisi Gusi Penutup Gigi Bungsu Erupsi)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-040', '86.59', 'Penjahitan Luka Bedah Gigi (Suturing) / Angkat Jahitan', 'Bedah Mulut', 150000.00, 'Penjahitan Luka Bedah Gigi (Suturing) / Angkat Jahitan', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-041', '23.41B', 'Mahkota Tiruan PFM (Porcelain Fused to Metal)', 'Prostodonsia (Gigi Tiruan)', 1800000.00, 'Mahkota Tiruan PFM (Porcelain Fused to Metal)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-042', '23.44', 'Jembatan Gigi Tiruan (Dental Bridge 3 Unit Zirconia)', 'Prostodonsia (Gigi Tiruan)', 6500000.00, 'Jembatan Gigi Tiruan (Dental Bridge 3 Unit Zirconia)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-043', '23.45B', 'Tambahan Elemen Gigi Tiruan Lepasan (per elemen)', 'Prostodonsia (Gigi Tiruan)', 150000.00, 'Tambahan Elemen Gigi Tiruan Lepasan (per elemen)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-044', '23.46', 'Gigi Tiruan Fleksibel (Valplast) Tanpa Logam Kawat', 'Prostodonsia (Gigi Tiruan)', 1500000.00, 'Gigi Tiruan Fleksibel (Valplast) Tanpa Logam Kawat', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-045', '23.47', 'Gigi Tiruan Lengkap Penuh (Full Denture Rahang Atas & Bawah)', 'Prostodonsia (Gigi Tiruan)', 4500000.00, 'Gigi Tiruan Lengkap Penuh (Full Denture Rahang Atas & Bawah)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-046', '24.20', 'Pemasangan Kawat Gigi / Behel Metal MBT (Rahang Atas & Bawah)', 'Ortodonti (Behel)', 6000000.00, 'Pemasangan Kawat Gigi / Behel Metal MBT (Rahang Atas & Bawah)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-047', '24.20B', 'Pemasangan Kawat Gigi Ceramic / Sapphire Transparan Estetik', 'Ortodonti (Behel)', 8500000.00, 'Pemasangan Kawat Gigi Ceramic / Sapphire Transparan Estetik', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-048', '24.21', 'Kontrol Rutin Kawat Gigi (Ganti Kawat Niti, Power O / Chain)', 'Ortodonti (Behel)', 200000.00, 'Kontrol Rutin Kawat Gigi (Ganti Kawat Niti, Power O / Chain)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-049', '24.22', 'Pemasangan Retainer Pasca Behel (Clear Essix / Hawley)', 'Ortodonti (Behel)', 800000.00, 'Pemasangan Retainer Pasca Behel (Clear Essix / Hawley)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-050', '96.55B', 'Home Bleaching Kit Lengkap + Custom Tray Cetakan Gigi', 'Estetika Dental', 1400000.00, 'Home Bleaching Kit Lengkap + Custom Tray Cetakan Gigi', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01'),
('PROC-051', '23.70B', 'Open Bur / Trepanasi Gigi Darurat (Relief Nyeri Pulpa)', 'Endodontik (PSA)', 150000.00, 'Open Bur / Trepanasi Gigi Darurat (Relief Nyeri Pulpa)', 1, '2026-10-25 07:11:01', '2026-10-25 07:11:01');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` varchar(255) NOT NULL,
  `facility_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `head_doctor_id` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `facility_id`, `name`, `code`, `description`, `head_doctor_id`, `location`, `is_active`, `created_at`, `updated_at`) VALUES
('DEP-001', 'FAC-001', 'Poli Gigi Umum', 'PGU', 'Pemeriksaan rutin, scaling karang gigi, penambalan dan konsultasi kesehatan gigi mulut', 'DOC-001', 'Lantai 1 - Dental Unit 1 & 2', 1, '2026-09-24 07:34:26', '2026-09-24 07:34:26');

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `id` varchar(255) NOT NULL,
  `facility_id` varchar(255) DEFAULT NULL,
  `employee_number` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `department_id` varchar(255) DEFAULT NULL,
  `department_name` varchar(255) DEFAULT NULL,
  `sip_number` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `avatar_url` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `consultation_fee` decimal(12,2) NOT NULL DEFAULT 0.00,
  `schedules` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`schedules`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`id`, `facility_id`, `employee_number`, `name`, `title`, `specialization`, `department_id`, `department_name`, `sip_number`, `phone`, `email`, `avatar_url`, `status`, `consultation_fee`, `schedules`, `created_at`, `updated_at`) VALUES
('DOC-001', 'FAC-001', 'DOC-2020-001', 'drg. Jihan, S.Kep', 'drg. S.Kep', 'Dokter Gigi & Perawatan Gigi Klinis', 'DEP-001', 'Poli Gigi Umum & Bedah Mulut', 'SIP.503/442/01/DINKES/2026', '081234567890', 'drg.jihan.skep@klinikgigi.local', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80', 'active', 150000.00, '[{\"id\":\"SCH-001\",\"doctorId\":\"DOC-001\",\"dayOfWeek\":1,\"dayName\":\"Senin\",\"startTime\":\"08:00\",\"endTime\":\"16:00\",\"departmentId\":\"DEP-001\",\"roomNumber\":\"Dental Chair 1\",\"maxQuota\":25,\"isActive\":true},{\"id\":\"SCH-002\",\"doctorId\":\"DOC-001\",\"dayOfWeek\":2,\"dayName\":\"Selasa\",\"startTime\":\"08:00\",\"endTime\":\"16:00\",\"departmentId\":\"DEP-001\",\"roomNumber\":\"Dental Chair 1\",\"maxQuota\":25,\"isActive\":true},{\"id\":\"SCH-003\",\"doctorId\":\"DOC-001\",\"dayOfWeek\":3,\"dayName\":\"Rabu\",\"startTime\":\"08:00\",\"endTime\":\"16:00\",\"departmentId\":\"DEP-001\",\"roomNumber\":\"Dental Chair 1\",\"maxQuota\":25,\"isActive\":true},{\"id\":\"SCH-004\",\"doctorId\":\"DOC-001\",\"dayOfWeek\":4,\"dayName\":\"Kamis\",\"startTime\":\"08:00\",\"endTime\":\"16:00\",\"departmentId\":\"DEP-001\",\"roomNumber\":\"Dental Chair 1\",\"maxQuota\":25,\"isActive\":true},{\"id\":\"SCH-005\",\"doctorId\":\"DOC-001\",\"dayOfWeek\":5,\"dayName\":\"Jumat\",\"startTime\":\"08:00\",\"endTime\":\"16:00\",\"departmentId\":\"DEP-001\",\"roomNumber\":\"Dental Chair 1\",\"maxQuota\":25,\"isActive\":true},{\"id\":\"SCH-006\",\"doctorId\":\"DOC-001\",\"dayOfWeek\":6,\"dayName\":\"Sabtu\",\"startTime\":\"08:00\",\"endTime\":\"14:00\",\"departmentId\":\"DEP-001\",\"roomNumber\":\"Dental Chair 1\",\"maxQuota\":20,\"isActive\":true}]', '2026-09-25 07:27:55', '2026-09-25 07:27:55');

-- --------------------------------------------------------

--
-- Table structure for table `encounters`
--

CREATE TABLE `encounters` (
  `id` varchar(255) NOT NULL,
  `facility_id` varchar(255) DEFAULT NULL,
  `encounter_number` varchar(255) NOT NULL,
  `patient_id` varchar(255) NOT NULL,
  `patient_name` varchar(255) NOT NULL,
  `patient_mrn` varchar(255) DEFAULT NULL,
  `patient_gender` varchar(255) DEFAULT NULL,
  `patient_birth_date` date DEFAULT NULL,
  `patient_blood_type` varchar(255) DEFAULT NULL,
  `patient_allergies` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`patient_allergies`)),
  `doctor_id` varchar(255) NOT NULL,
  `doctor_name` varchar(255) NOT NULL,
  `department_id` varchar(255) DEFAULT NULL,
  `department_name` varchar(255) DEFAULT NULL,
  `appointment_id` varchar(255) DEFAULT NULL,
  `visit_date` date NOT NULL,
  `visit_type` varchar(255) NOT NULL DEFAULT 'routine_checkup',
  `status` varchar(255) NOT NULL DEFAULT 'in_examination',
  `anamnesis` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`anamnesis`)),
  `vital_signs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`vital_signs`)),
  `physical_exam` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`physical_exam`)),
  `odontogram` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`odontogram`)),
  `diagnoses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`diagnoses`)),
  `procedures` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`procedures`)),
  `follow_up_plan` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`follow_up_plan`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `finance_transactions`
--

CREATE TABLE `finance_transactions` (
  `id` varchar(255) NOT NULL,
  `transaction_number` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(255) NOT NULL DEFAULT 'cash',
  `description` text NOT NULL,
  `reference_id` varchar(255) DEFAULT NULL,
  `reference_type` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `operator_name` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hospital_profiles`
--

CREATE TABLE `hospital_profiles` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `accreditation` varchar(255) DEFAULT NULL,
  `license_number` varchar(255) DEFAULT NULL,
  `tax_id` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `province` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `director_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hospital_profiles`
--

INSERT INTO `hospital_profiles` (`id`, `name`, `code`, `type`, `accreditation`, `license_number`, `tax_id`, `phone`, `email`, `website`, `address`, `city`, `province`, `postal_code`, `director_name`, `created_at`, `updated_at`) VALUES
('HOSP-001', 'Klinik Gigi Pratama Dental Care', 'KDC-01', 'Klinik Gigi Mandiri', 'Paripurna', '503/012/KLINIK/DPMPTSP/2024', '09.876.543.2-012.000', '021-8291029 / 0812-9988-7766', 'info@dentalcarepratama.id', 'https://dentalcarepratama.id', 'Jl. Tebet Raya No. 45B, Tebet Barat', 'Jakarta Selatan', 'DKI Jakarta', '12810', 'drg. Pratama Wijaya', '2026-09-24 07:34:26', '2026-10-24 04:11:17');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` varchar(255) NOT NULL,
  `facility_id` varchar(255) DEFAULT NULL,
  `invoice_number` varchar(255) NOT NULL,
  `encounter_id` varchar(255) DEFAULT NULL,
  `patient_id` varchar(255) NOT NULL,
  `patient_name` varchar(255) NOT NULL,
  `patient_mrn` varchar(255) DEFAULT NULL,
  `patient_phone` varchar(255) DEFAULT NULL,
  `insurance_type` varchar(255) NOT NULL DEFAULT 'umum',
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tax` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `covered_by_insurance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `patient_paid_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `outstanding_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `payments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payments`)),
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medicines`
--

CREATE TABLE `medicines` (
  `id` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `generic_name` varchar(255) NOT NULL,
  `brand_name` varchar(255) NOT NULL,
  `dosage_form` varchar(255) NOT NULL,
  `strength` varchar(255) DEFAULT NULL,
  `unit` varchar(255) NOT NULL,
  `manufacturer` varchar(255) DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `current_stock` int(11) NOT NULL DEFAULT 0,
  `minimum_stock` int(11) NOT NULL DEFAULT 0,
  `purchase_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `selling_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `expiry_date` date DEFAULT NULL,
  `stock_status` varchar(255) NOT NULL DEFAULT 'in_stock',
  `requires_prescription` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `medicines`
--

INSERT INTO `medicines` (`id`, `code`, `generic_name`, `brand_name`, `dosage_form`, `strength`, `unit`, `manufacturer`, `category`, `current_stock`, `minimum_stock`, `purchase_price`, `selling_price`, `expiry_date`, `stock_status`, `requires_prescription`, `created_at`, `updated_at`) VALUES
('MED-001', 'OBT-001', 'Amoxicillin Trihydrate', 'Amoxisan 500mg', 'Capsule', '500mg', 'kapsul', 'Sanbe Farma', 'Antibiotic', 450, 100, 1200.00, 3500.00, '2027-08-30', 'in_stock', 1, '2026-10-10 21:35:24', '2026-10-24 04:19:45'),
('MED-002', 'OBT-002', 'Clindamycin HCl', 'Clinika 300mg', 'Capsule', '300mg', 'kapsul', 'Kalbe Farma', 'Antibiotic', 180, 50, 4500.00, 8500.00, '2027-06-15', 'in_stock', 1, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-003', 'OBT-003', 'Asam Mefenamat', 'Ponstan 500mg', 'Tablet', '500mg', 'tablet', 'Pfizer Indonesia', 'Analgesic', 620, 150, 2500.00, 6000.00, '2028-01-20', 'in_stock', 1, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-004', 'OBT-004', 'Ibuprofen', 'Proris 400mg', 'Tablet', '400mg', 'tablet', 'Pharos', 'Analgesic', 320, 100, 1500.00, 4000.00, '2027-11-10', 'in_stock', 1, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-005', 'OBT-005', 'Natrium Diklofenak', 'Cataflam 50mg', 'Tablet', '50mg', 'tablet', 'Novartis', 'Analgesic', 140, 50, 5000.00, 9500.00, '2027-09-05', 'in_stock', 1, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-006', 'OBT-006', 'Chlorhexidine Gluconate 0.2%', 'Minosep Gargle 150ml', 'Drops', '0.2%', 'botol', 'Minorock Mandiri', 'Gastrointestinal', 85, 30, 28000.00, 42000.00, '2027-12-01', 'in_stock', 0, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-007', 'OBT-007', 'Aloe Vera + Sodium Hyaluronate', 'Aloclair Plus Gel 8ml', 'Ointment', '8ml', 'tube', 'Alliance Pharma', 'Antiallergy', 42, 20, 75000.00, 115000.00, '2027-10-15', 'in_stock', 0, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-008', 'OBT-008', 'Triamcinolone Acetonide', 'Kenalog in Orabase 5g', 'Ointment', '0.1%', 'tube', 'Taisho Pharmaceutical', 'Antiallergy', 35, 15, 62000.00, 92000.00, '2027-07-20', 'in_stock', 1, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-009', 'OBT-009', 'Lidocaine HCl 2% + Epinephrine 1:80.000', 'Pehacain Injeksi 2ml', 'Injection', '2%', 'ampul', 'Phapros', 'Emergency', 250, 80, 8500.00, 16000.00, '2027-12-31', 'in_stock', 1, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-010', 'OBT-010', 'Paracetamol Sirup Anak', 'Sanmol Sirup 60ml', 'Syrup', '120mg/5ml', 'botol', 'Sanbe Farma', 'Analgesic', 90, 30, 18000.00, 28000.00, '2028-02-14', 'in_stock', 0, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-011', 'MAT-001', 'Komposit Resin Solare Universal', 'Solare Universal A2 Syringe 4g', 'Syringe', '4g', 'syringe', 'GC Dental Indonesia', 'Bahan Tambal & Restorasi', 28, 10, 280000.00, 450000.00, '2028-06-30', 'in_stock', 0, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-012', 'MAT-002', 'Bonding Agent Universal', '3M Single Bond Universal 5ml', 'Drops', '5ml', 'botol', '3M ESPE Indonesia', 'Bahan Tambal & Restorasi', 12, 5, 450000.00, 650000.00, '2027-12-15', 'in_stock', 0, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-013', 'MAT-003', 'Etching Gel Asam Fosfat 37%', 'Etching Gel Sirona 3ml', 'Syringe', '3ml (37%)', 'syringe', 'Dentsply Sirona', 'Bahan Tambal & Restorasi', 25, 8, 75000.00, 120000.00, '2028-03-01', 'in_stock', 0, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-014', 'MAT-004', 'Glass Ionomer Cement (GIC)', 'Fuji IX Gold Label Set', 'Capsule', 'Set Powder+Liquid', 'set', 'GC Dental Indonesia', 'Bahan Tambal & Restorasi', 8, 5, 520000.00, 750000.00, '2027-10-31', 'in_stock', 0, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-015', 'MAT-005', 'Jarum Dental Citoject Disposable 27G', 'Terumo Dental Needle 27G Short (Box 100)', 'Injection', '27G Short', 'box', 'Terumo Medical', 'Alat Medis & BMHP', 15, 5, 120000.00, 160000.00, '2029-01-01', 'in_stock', 0, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-016', 'MAT-006', 'Articaine HCl 4% + Epinephrine 1:100.000', 'Septanest Dental Carpule 1.8ml (Box 50)', 'Injection', '1.8ml', 'box', 'Septodont', 'Anestesi Dental', 18, 8, 425000.00, 550000.00, '2027-11-25', 'in_stock', 1, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-017', 'MAT-007', 'Bahan Cetak Alginat Fast Set', 'Aroma Fine Plus Fast Set 1kg', 'Drops', '1kg Pack', 'pack', 'GC Dental Indonesia', 'Alat Medis & BMHP', 6, 4, 145000.00, 200000.00, '2028-05-15', 'in_stock', 0, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-018', 'MAT-008', 'Saliva Ejector Suction Tip Disposable', 'Saliva Ejector Clear Blue (Pack 100)', 'Drops', 'Pack 100 pcs', 'pack', 'Cobra Dental', 'Alat Medis & BMHP', 4, 5, 35000.00, 50000.00, '2029-12-31', 'low_stock', 0, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-019', 'MAT-009', 'Cotton Roll Dental Absorbent', 'Dental Cotton Roll #2 (Pack 1000)', 'Drops', 'Pack 1000 pcs', 'pack', 'Cobra Dental', 'Alat Medis & BMHP', 8, 4, 55000.00, 80000.00, '2029-12-31', 'in_stock', 0, '2026-10-24 04:19:45', '2026-10-24 04:19:45'),
('MED-020', 'MAT-010', 'Bracket Behel Metal MBT 022 Kit', 'Ormco Mini Diamond MBT 022 Set', 'Drops', 'Set Atas & Bawah', 'set', 'Ormco Indonesia', 'Alat Medis & BMHP', 14, 5, 650000.00, 1200000.00, '2030-01-01', 'in_stock', 0, '2026-10-24 04:19:45', '2026-10-24 04:19:45');

-- --------------------------------------------------------

--
-- Table structure for table `medicine_mutations`
--

CREATE TABLE `medicine_mutations` (
  `id` varchar(255) NOT NULL,
  `medicine_id` varchar(255) NOT NULL,
  `medicine_name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `stock_before` int(11) NOT NULL,
  `stock_after` int(11) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `reason` varchar(255) NOT NULL,
  `reference_no` varchar(255) DEFAULT NULL,
  `batch_number` varchar(255) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `operator_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_09_24_064540_create_personal_access_tokens_table', 1),
(5, '2026_09_24_070000_create_dental_clinic_tables', 1),
(6, '2026_09_25_130034_create_dental_master_tables', 2),
(7, '2026_09_25_150000_add_performance_indexes_table', 3),
(8, '2026_10_21_150000_add_next_control_and_patient_indexes', 4);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` varchar(255) NOT NULL,
  `facility_id` varchar(255) DEFAULT NULL,
  `medical_record_number` varchar(255) NOT NULL,
  `nik` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `gender` varchar(255) NOT NULL DEFAULT 'male',
  `birth_place` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `blood_type` varchar(255) DEFAULT NULL,
  `marital_status` varchar(255) DEFAULT NULL,
  `religion` varchar(255) DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`address`)),
  `emergency_contact` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`emergency_contact`)),
  `insurance` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`insurance`)),
  `allergies` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`allergies`)),
  `chronic_diseases` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`chronic_diseases`)),
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `next_control_date` date DEFAULT NULL,
  `control_doctor` varchar(255) DEFAULT NULL,
  `control_notes` text DEFAULT NULL,
  `last_visit_at` timestamp NULL DEFAULT NULL,
  `registered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `prescriptions`
--

CREATE TABLE `prescriptions` (
  `id` varchar(255) NOT NULL,
  `prescription_number` varchar(255) NOT NULL,
  `facility_id` varchar(255) DEFAULT NULL,
  `encounter_id` varchar(255) DEFAULT NULL,
  `patient_id` varchar(255) NOT NULL,
  `patient_name` varchar(255) NOT NULL,
  `patient_mrn` varchar(255) DEFAULT NULL,
  `doctor_id` varchar(255) NOT NULL,
  `doctor_name` varchar(255) NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_status` varchar(255) NOT NULL DEFAULT 'unpaid',
  `status` varchar(255) NOT NULL DEFAULT 'submitted',
  `notes` text DEFAULT NULL,
  `dispensed_at` timestamp NULL DEFAULT NULL,
  `dispensed_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `queue_items`
--

CREATE TABLE `queue_items` (
  `id` varchar(255) NOT NULL,
  `facility_id` varchar(255) DEFAULT NULL,
  `queue_number` varchar(255) NOT NULL,
  `appointment_id` varchar(255) DEFAULT NULL,
  `encounter_id` varchar(255) DEFAULT NULL,
  `patient_id` varchar(255) NOT NULL,
  `patient_name` varchar(255) NOT NULL,
  `patient_mrn` varchar(255) DEFAULT NULL,
  `doctor_id` varchar(255) NOT NULL,
  `doctor_name` varchar(255) NOT NULL,
  `department_id` varchar(255) DEFAULT NULL,
  `department_name` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'waiting',
  `estimated_call_time` varchar(255) DEFAULT NULL,
  `called_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT 'super_admin',
  `role_name` varchar(255) DEFAULT 'Dokter Gigi',
  `avatar_url` varchar(255) DEFAULT NULL,
  `facility_id` varchar(255) DEFAULT 'FAC-001',
  `department_id` varchar(255) DEFAULT NULL,
  `doctor_id` varchar(255) DEFAULT NULL,
  `employee_number` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `role_name`, `avatar_url`, `facility_id`, `department_id`, `doctor_id`, `employee_number`, `phone`, `is_active`, `last_login_at`, `remember_token`, `created_at`, `updated_at`) VALUES
(2, 'jihan', 'admin@dental.com', '2026-09-26 03:44:17', '$2y$12$iSVNBgYlxX9wTpXPcUgHjeuHJOrMzqq8WnsPte9HZsXfcyVLb4EHW', 'super_admin', 'Super Admin', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80', 'FAC-001', 'DEP-001', 'DOC-001', 'DOC-2020-001', '081311223344', 1, NULL, NULL, '2026-09-24 07:34:26', '2026-10-10 20:58:00'),
(7, 'drg. Pratama Wijaya', 'admin@dentalcare.local', '2026-10-24 04:19:44', '$2y$12$zXAWMKuZ2cPPtX8IF3B3dO6JFoTLfbexlrprfItIpxZcErwykeNXm', 'super_admin', 'Dokter Gigi & Super Admin', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80', 'FAC-001', 'DEP-001', 'DOC-001', 'DOC-2020-001', '081311223344', 1, NULL, NULL, '2026-10-24 04:11:16', '2026-10-24 04:19:44'),
(8, 'drg. Pratama Wijaya', 'admin@ehealth.local', '2026-10-24 04:19:45', '$2y$12$9Xetvdlu6FJ5RMT40aQlHuXBQjyvRysY6QiZ12D/VUFzPh2wQxegy', 'super_admin', 'Dokter Gigi & Super Admin', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80', 'FAC-001', 'DEP-001', 'DOC-001', 'DOC-2020-001', '081311223344', 1, NULL, NULL, '2026-10-24 04:11:16', '2026-10-24 04:19:45'),
(9, 'Siti Nurhaliza (Petugas Klinik)', 'petugas@dentalcare.local', '2026-10-24 04:19:45', '$2y$12$DfzI0pTgdkU2toBU/kljfOQNOyBAgYmKn0OaEYMK.0ph9oX8NVSVq', 'receptionist', 'Petugas Resepsionis & Farmasi', 'https://images.unsplash.com/photo-1594824813576-03716d1cd41b?w=150&auto=format&fit=crop&q=80', 'FAC-001', 'DEP-001', NULL, 'STF-2022-005', '081555667788', 1, NULL, NULL, '2026-10-24 04:11:17', '2026-10-24 04:19:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `appointments_appointment_number_unique` (`appointment_number`),
  ADD KEY `idx_appointments_date_status` (`appointment_date`,`status`),
  ADD KEY `idx_appointments_patient_id` (`patient_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `dental_diagnoses`
--
ALTER TABLE `dental_diagnoses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dental_diagnoses_code_unique` (`code`);

--
-- Indexes for table `dental_insurances`
--
ALTER TABLE `dental_insurances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dental_insurances_code_unique` (`code`);

--
-- Indexes for table `dental_procedures`
--
ALTER TABLE `dental_procedures`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dental_procedures_code_unique` (`code`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `encounters`
--
ALTER TABLE `encounters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `encounters_encounter_number_unique` (`encounter_number`),
  ADD KEY `idx_encounters_patient_id` (`patient_id`),
  ADD KEY `idx_encounters_visit_date` (`visit_date`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `finance_transactions`
--
ALTER TABLE `finance_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `finance_transactions_transaction_number_unique` (`transaction_number`),
  ADD KEY `idx_finance_type_date` (`type`,`date`);

--
-- Indexes for table `hospital_profiles`
--
ALTER TABLE `hospital_profiles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoices_invoice_number_unique` (`invoice_number`),
  ADD KEY `idx_invoices_patient_id` (`patient_id`),
  ADD KEY `idx_invoices_status` (`status`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `medicines`
--
ALTER TABLE `medicines`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `medicines_code_unique` (`code`);

--
-- Indexes for table `medicine_mutations`
--
ALTER TABLE `medicine_mutations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `patients_medical_record_number_unique` (`medical_record_number`),
  ADD KEY `idx_patients_nik` (`nik`),
  ADD KEY `idx_patients_name` (`name`),
  ADD KEY `idx_patients_created_at` (`created_at`),
  ADD KEY `idx_patients_next_control_date` (`next_control_date`),
  ADD KEY `idx_patients_phone` (`phone`),
  ADD KEY `idx_patients_status` (`status`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `prescriptions`
--
ALTER TABLE `prescriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `prescriptions_prescription_number_unique` (`prescription_number`);

--
-- Indexes for table `queue_items`
--
ALTER TABLE `queue_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_queues_status_created` (`status`,`created_at`),
  ADD KEY `idx_queues_patient_id` (`patient_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
