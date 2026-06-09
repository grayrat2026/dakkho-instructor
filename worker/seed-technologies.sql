-- DAKKHO - Seed Data: Diploma Engineering Technologies
-- 7 core technologies offered in Bangladesh Polytechnic Institutes
-- Short codes MUST match schema.sql and the Student App's DEPT_TO_TECHNOLOGY mapping

INSERT OR IGNORE INTO technologies (name, name_bn, short_code, description, is_active) VALUES
('Civil Technology', 'সিভিল টেকনোলজি', 'CT', 'Civil engineering technology covering construction, surveying, and structural design', 1),
('Computer Science & Technology', 'কম্পিউটার সায়েন্স অ্যান্ড টেকনোলজি', 'CST', 'Computer science covering programming, networking, database, and web development', 1),
('Electrical Technology', 'ইলেকট্রিক্যাল টেকনোলজি', 'ET', 'Electrical engineering covering power systems, electrical machines, and control systems', 1),
('Electro Medical Technology', 'ইলেকট্রোমেডিক্যাল টেকনোলজি', 'EMT', 'Electromedical technology covering medical equipment maintenance and biomedical engineering', 1),
('Electronics Technology', 'ইলেকট্রনিক্স টেকনোলজি', 'EnT', 'Electronics technology covering electronic circuits, communication systems, and embedded systems', 1),
('Mechanical Technology', 'মেকানিক্যাল টেকনোলজি', 'MT', 'Mechanical engineering covering manufacturing, thermodynamics, and machine design', 1),
('Power Technology', 'পাওয়ার টেকনোলজি', 'PT', 'Power technology covering power generation, transmission, and distribution systems', 1);
