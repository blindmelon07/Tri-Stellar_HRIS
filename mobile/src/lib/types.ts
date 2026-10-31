export type Option = { value: string; label: string };

export type Paginated<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
};

export type Profile = {
  name: string;
  email: string;
  employee: {
    id: number;
    employee_number: string;
    full_name: string;
    first_name: string;
    job_title: string;
    department: string;
    branch: string;
    shift: { name: string; start_time: string; end_time: string };
  };
  can: { endorse_filings: boolean };
};

export type PayslipSummary = {
  id: number;
  period: { label: string; start_date: string; end_date: string; pay_date: string };
  payment_method: 'atm' | 'cash';
  payment_method_label: string;
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
};

export type PayslipLine = { label: string; amount: number };

export type Payslip = PayslipSummary & {
  details: {
    attendance: {
      days_worked: number;
      days_absent: number;
      late_undertime_minutes: number;
      overtime_hours: number;
    };
    earnings: PayslipLine[];
    deductions: PayslipLine[];
  };
};

export type Home = {
  today_logs: string[];
  pending_filings: number;
  endorsements_waiting: number | null;
  latest_payslip: PayslipSummary | null;
};

export type DailyStatus =
  | 'present'
  | 'absent'
  | 'incomplete'
  | 'leave'
  | 'holiday'
  | 'rest_day'
  | 'not_employed';

export type DailyRecord = {
  date: string;
  day: string;
  status: DailyStatus;
  shift: string;
  is_work_day: boolean;
  time_in: string | null;
  time_out: string | null;
  late_minutes: number;
  undertime_minutes: number;
  overtime_hours: number;
  days_worked: number;
  paid_leave_days: number;
  unpaid_leave_days: number;
  holiday: string | null;
};

export type WorkSummary = {
  days_worked: number;
  paid_leave_days: number;
  unpaid_leave_days: number;
  days_absent: number;
  late_minutes: number;
  undertime_minutes: number;
  overtime_hours: number;
};

export type Attendance = {
  data: DailyRecord[];
  meta: { from: string; to: string; summary: WorkSummary };
};

export type FilingType = 'unaccounted' | 'leave' | 'overtime' | 'early_out' | 'shift_change';
export type FilingStatus = 'pending' | 'endorsed' | 'approved' | 'denied';

export type Filing = {
  id: number;
  type: FilingType;
  type_label: string;
  date_from: string;
  date_to: string;
  time_from: string | null;
  time_to: string | null;
  is_half_day: boolean;
  with_pay: boolean;
  shift?: string | null;
  reason: string;
  status: FilingStatus;
  status_label: string;
  remarks: string | null;
  can_withdraw: boolean;
  employee?: { id: number; employee_number: string; full_name: string };
  filed_at: string;
};

export type FilingList = Paginated<Filing> & {
  meta: Paginated<Filing>['meta'] & { types: Option[]; shifts: Option[] };
};
