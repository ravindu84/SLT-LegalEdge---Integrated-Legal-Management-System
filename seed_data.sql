-- Seed Data for SLT LegalEdge
-- Realistic cases and agreements for testing RBAC and workflows

-- Insert Cases
INSERT INTO public.legal_cases (case_no, title, case_type, status, plaintiff, defendant, assigned_lawyer, court, next_hearing)
VALUES 
('SLT/LEG/2024/001', 'Copper Cable Theft - Gampaha District', 'Criminal', 'Active', 'SLT Mobitel PLC', 'Unknown / Police Case', 'Ravindu Chinthana', 'Magistrate Court Gampaha', '2024-04-15'),
('SLT/LEG/2024/002', 'Vendor Breach - Fiber Optic Supplies', 'Money Recovery', 'New', 'SLT Mobitel PLC', 'Global Tech Solutions Pvt Ltd', 'N. Silva', 'Commercial High Court Colombo', '2024-05-10'),
('SLT/LEG/2024/003', 'Land Dispute - Telecom Tower Site A12', 'Land Case', 'Active', 'Landowner Perera', 'SLT Mobitel PLC', 'Ravindu Chinthana', 'District Court Kandy', '2024-03-25'),
('SLT/LEG/2024/004', 'Employee Disciplinary Inquiry - Fraud', 'Inquiry', 'Under Review', 'Management', 'Ex-Officer Silva', 'N. Silva', 'Internal Inquiry Panel', '2024-03-20'),
('SLT/LEG/2024/005', 'Public Liability Claim - Vehicle Accident', 'Damages', 'Pending Hearing', 'Customer Wickramasinghe', 'SLT Mobitel PLC', 'Ravindu Chinthana', 'District Court Colombo', '2024-04-02');

-- Insert Agreements
INSERT INTO public.agreements (title, agreement_type, reference_no, party1, party2, value, start_date, expiry_date, status, created_by)
VALUES 
('Software Licensing Agreement - Microsoft', 'Vendor Agreement', 'AGR/2024/001', 'SLT Mobitel PLC', 'Microsoft Sri Lanka', 5000000, '2024-01-01', '2026-12-31', 'Active', '33dc4c95-acca-49b7-8221-e432dd21beb0'),
('Tower Sharing MOU - Dialog Axiata', 'MOU', 'MOU/2024/015', 'SLT Mobitel PLC', 'Dialog Axiata PLC', 0, '2024-02-15', '2025-02-14', 'Pending L1 Approval', '33dc4c95-acca-49b7-8221-e432dd21beb0'),
('Maintenance Contract - Generator Backup', 'Maintenance Contract', 'MC/2024/088', 'SLT Mobitel PLC', 'Energy Sol Ltd', 1200000, '2024-03-01', '2025-02-28', 'Draft', '3a610fd3-83d5-4973-a96e-2ff65cc7c8a7');

-- Insert initial approvals for history display
INSERT INTO public.agreement_approvals (agreement_id, action, from_status, to_status, remarks, performer_name, performed_at)
SELECT id, 'Created', NULL, 'Draft', 'Initial draft created.', 'Ravindu Chinthana', now() FROM public.agreements WHERE reference_no = 'MC/2024/088';
