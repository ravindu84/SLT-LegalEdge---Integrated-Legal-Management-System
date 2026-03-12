-- Realistic Seed Data for SLT-LegalEdge
-- Focus: SLT Officials, Fiber Theft, Tower Sharing, and Arrears Recovery

-- 1. Update Profiles with Realistic Names and Details
-- Note: We use the existing IDs from the database to ensure auth consistency

-- DGM Legal (Supervisor)
UPDATE public.profiles 
SET full_name = 'S. Karunaratne, DGM', 
    designation = 'Deputy General Manager (Legal)',
    department = 'Legal Division',
    employee_id = 'SLT/LEG/001'
WHERE role = 'supervisor' AND email = 's.karunaratne@slt.com.lk';

-- Senior Legal Officer (Manager/Admin)
UPDATE public.profiles 
SET full_name = 'K. Fernando, AGM', 
    designation = 'Assistant General Manager (Legal)',
    department = 'Legal Division',
    employee_id = 'SLT/LEG/002'
WHERE role = 'manager' AND email = 'k.fernando@slt.com.lk';

-- Legal Officer (The user/creator)
UPDATE public.profiles 
SET full_name = 'Ravindu Chinthana', 
    designation = 'Legal Officer',
    department = 'Litigation Unit',
    employee_id = 'SLT/LEG/045'
WHERE email = 'ravindu@slt.com.lk';

-- 2. Clear existing dummy cases and agreements to prevent clutter (Optional, but recommended for clean slate)
-- DELETE FROM public.legal_cases WHERE title LIKE 'Test%';
-- DELETE FROM public.agreements WHERE title LIKE 'Test%';

-- 3. Realistic Legal Cases
INSERT INTO public.legal_cases (
    case_no, title, case_type, status, plaintiff, defendant, assigned_lawyer, court, court_case_no, financial_exposure, next_hearing, summary_facts
) VALUES 
(
    'LC/2026/001', 
    'SLT vs Gampaha Construction Ltd - Fiber Cable Damage', 
    'Damages', 
    'Active', 
    'Sri Lanka Telecom PLC', 
    'Gampaha Construction Ltd', 
    'Ravindu Chinthana', 
    'Commercial High Court - Colombo', 
    'CHC/450/2026/MR', 
    2500000.00, 
    '2026-04-15', 
    'Defendant damaged 48-core backbone fiber cable during unauthorized excavation in Gampaha. Claim includes repair costs and loss of revenue.'
),
(
    'LC/2026/002', 
    'SLT vs Arrears Recovery - Corporate Client X', 
    'Money Recovery', 
    'Pending Hearing', 
    'Sri Lanka Telecom PLC', 
    'Enterprise Solutions (Pvt) Ltd', 
    'Ravindu Chinthana', 
    'District Court - Colombo', 
    'DC/Col/8902/2025', 
    8500000.00, 
    '2026-03-25', 
    'Action for recovery of outstanding leased line charges for the period 2023-2024.'
),
(
    'LC/2026/003', 
    'Land Dispute - Matara Tower Site', 
    'Land Case', 
    'Active', 
    'Sri Lanka Telecom PLC', 
    'Local Landowner Association', 
    'Senior Legal Officer', 
    'District Court - Matara', 
    'DC/Mat/556/2024', 
    15000000.00, 
    '2026-05-10', 
    'Dispute regarding the access road to the SLT LTE Tower site in Matara South.'
);

-- 4. Realistic Agreements
INSERT INTO public.agreements (
    ref_no, title, agreement_type, status, party1, party2, value, start_date, expiry_date, description
) VALUES 
(
    'AGR/2026/VND/012', 
    'Master Service Agreement - Fiber Infrastructure Maintenance', 
    'Vendor Agreement', 
    'Active', 
    'Sri Lanka Telecom PLC', 
    'Network Solutions Lanka (Pvt) Ltd', 
    50000000.00, 
    '2026-01-01', 
    '2028-12-31', 
    'Annual maintenance contract for backbone fiber network in Central and Uva provinces.'
),
(
    'AGR/2026/MOU/005', 
    'MOU for Tower Sharing - Mobitel & Dialog', 
    'MOU', 
    'Draft', 
    'Sri Lanka Telecom PLC', 
    'Dialog Axiata PLC', 
    0.00, 
    '2026-06-01', 
    '2031-05-31', 
    'Framework for mutual sharing of passive infrastructure (towers) to reduce CO2 footprint and Opex.'
),
(
    'AGR/2026/SLA/088', 
    'SLA for Cloud Services - Government Data Center', 
    'Service Level Agreement', 
    'Under Review', 
    'ICTA Sri Lanka', 
    'Sri Lanka Telecom PLC', 
    12000000.00, 
    '2026-02-15', 
    '2027-02-14', 
    'Performance guarantees for hosting the central government registry at SLT Tier III Data Center.'
);

-- 5. Add some initial approval records to show history
INSERT INTO public.agreement_approvals (
    agreement_id, level, approved_by, status, remarks
) 
SELECT id, 1, '85c939fc-7c3f-41a9-aca3-3ac76ad39942', 'Approved', 'Initial technical review completed. Legal terms are standard.'
FROM public.agreements 
WHERE ref_no = 'AGR/2026/SLA/088';

-- 6. Background Audit Logs
INSERT INTO public.system_audit_log (
    action, table_name, record_id, changed_by, old_values, new_values
) VALUES 
(
    'CREATE', 
    'legal_cases', 
    (SELECT id FROM public.legal_cases WHERE case_no = 'LC/2026/001'), 
    '33dc4c95-acca-49b7-8221-e432dd21beb0', 
    NULL, 
    '{"title": "SLT vs Gampaha Construction Ltd - Fiber Cable Damage"}'
);
